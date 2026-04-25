# Deploying STRM NOW

Target setup: a single VPS running the Next.js container with `docker compose`, fronted by nginx on the host, fronted by Cloudflare on the public DNS.

```
client → Cloudflare (orange) → nginx (host :443) → docker (127.0.0.1:3000) → Next.js
```

The container binds to `127.0.0.1:3000` only — nothing on the public internet can reach Next directly.

## Prerequisites

- Docker Engine (recent — Compose v2 is required) and the `docker compose` plugin
- nginx installed on the host
- Cloudflare proxying the domain (orange cloud on)
- A TMDB API key

## 1. Get the code on the VPS

```bash
sudo mkdir -p /opt/strm-next
sudo chown "$USER":"$USER" /opt/strm-next
git clone https://github.com/<you>/strm-next.git /opt/strm-next
cd /opt/strm-next
```

## 2. Environment

`docker-compose.yml` requires `TMDB_API_KEY` — it fails fast at `compose up` if missing. Put it in `/opt/strm-next/.env`:

```bash
cat > .env <<'EOF'
TMDB_API_KEY=your_tmdb_key
EOF
chmod 600 .env
```

`docker compose` reads `.env` automatically from the project directory; nothing else loads it (Next inside the container only sees what compose passes via `environment:`).

## 3. Build and start

```bash
docker compose up -d --build
docker compose ps          # should show "healthy" within ~15s
docker compose logs -f web
```

What the image gives you:
- Multi-stage build → final image ~280 MB (no devDeps, no source, no build cache).
- Runs as non-root `nextjs` (UID 1001).
- `read_only: true` root FS, `cap_drop: ALL`, `no-new-privileges`, `pids_limit: 256`, 2 GB memory cap.
- `/tmp` and `/app/.next/cache` are tmpfs (the only writable paths besides `/app/logs`).
- Logs persisted in a named volume (`strm-next_logs`).
- Built-in healthcheck on `GET /`.
- json-file log driver capped at 5 × 10 MB.

## 4. nginx (on the host)

`/etc/nginx/sites-available/strm-next`:

```nginx
# Trust Cloudflare's edge IPs so $remote_addr reflects the real client.
# Refresh from https://www.cloudflare.com/ips/ if Cloudflare adds new ranges.
set_real_ip_from 173.245.48.0/20;
set_real_ip_from 103.21.244.0/22;
set_real_ip_from 103.22.200.0/22;
set_real_ip_from 103.31.4.0/22;
set_real_ip_from 141.101.64.0/18;
set_real_ip_from 108.162.192.0/18;
set_real_ip_from 190.93.240.0/20;
set_real_ip_from 188.114.96.0/20;
set_real_ip_from 197.234.240.0/22;
set_real_ip_from 198.41.128.0/17;
set_real_ip_from 162.158.0.0/15;
set_real_ip_from 104.16.0.0/13;
set_real_ip_from 104.24.0.0/14;
set_real_ip_from 172.64.0.0/13;
set_real_ip_from 131.0.72.0/22;
set_real_ip_from 2400:cb00::/32;
set_real_ip_from 2606:4700::/32;
set_real_ip_from 2803:f800::/32;
set_real_ip_from 2405:b500::/32;
set_real_ip_from 2405:8100::/32;
set_real_ip_from 2a06:98c0::/29;
set_real_ip_from 2c0f:f248::/32;
real_ip_header CF-Connecting-IP;
real_ip_recursive on;

server {
    listen 80;
    listen [::]:80;
    server_name your-domain.example;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name your-domain.example;

    # If you terminate TLS at nginx (recommended: Cloudflare Origin Cert):
    ssl_certificate     /etc/nginx/cf-origin/cert.pem;
    ssl_certificate_key /etc/nginx/cf-origin/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers off;

    # Block requests that didn't actually transit Cloudflare.
    # $realip_remote_addr is the TCP peer (Cloudflare's edge after set_real_ip_from).
    # If it equals $remote_addr, set_real_ip_from didn't substitute — not from Cloudflare.
    if ($realip_remote_addr = $remote_addr) {
        return 403;
    }

    client_max_body_size 1m;

    location / {
        # Container is bound to 127.0.0.1:3000 by docker-compose
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;

        # The app reads cf-connecting-ip first, then x-real-ip, then x-forwarded-for.
        proxy_set_header Host              $host;
        proxy_set_header X-Real-IP         $remote_addr;
        proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header CF-Connecting-IP  $http_cf_connecting_ip;

        # WebSocket / streaming friendly (harmless if unused).
        proxy_set_header Upgrade           $http_upgrade;
        proxy_set_header Connection        "upgrade";

        proxy_buffering off;
        proxy_read_timeout 60s;
    }
}
```

Enable and reload:

```bash
sudo ln -s /etc/nginx/sites-available/strm-next /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

## 5. Cloudflare settings

- **SSL/TLS mode:** Full (strict). Generate a **Cloudflare Origin Certificate** for the domain and put it at `/etc/nginx/cf-origin/{cert,key}.pem`. This is what nginx serves; Cloudflare verifies it.
- **Always Use HTTPS:** on.
- **Proxy status:** orange cloud (proxied). Required for `cf-connecting-ip` to be set.
- **Rate Limiting (optional, recommended):** add a rule on `/api/tmdb/search` (e.g. 60 req/min per IP). Stops abuse at the edge before it touches your VPS. The app's per-IP limit (30/min) stays as a backstop.

## 6. Lock down the VPS firewall

Even with Cloudflare in front, somebody can find the origin IP via DNS history or scanning. Block 443 from anything that isn't Cloudflare:

```bash
# Reset whatever's there for 443 first if needed
for cidr in $(curl -s https://www.cloudflare.com/ips-v4) $(curl -s https://www.cloudflare.com/ips-v6); do
  sudo ufw allow from "$cidr" to any port 443 proto tcp
done
sudo ufw deny 443/tcp
sudo ufw enable
```

Re-run this whenever Cloudflare adds ranges (rare).

Note: `127.0.0.1:3000` is bound to loopback by docker, so it's already unreachable from outside the host regardless of ufw.

## 7. Updating

```bash
cd /opt/strm-next
git pull
docker compose up -d --build
docker image prune -f      # optional, drops the previous untagged image
```

Compose only restarts the container if the image changed. Zero-downtime is not configured here — there's a brief gap during restart. If that matters, look at compose's `rolling` deploy or run two replicas behind nginx upstream.

## 8. Logs

- App logs (Winston, daily rotation, 14 days):
  ```bash
  docker compose exec web ls /app/logs
  docker compose exec web tail -f /app/logs/application-$(date +%F).log
  ```
- Container stdout/stderr:
  ```bash
  docker compose logs -f web
  ```
- nginx: `/var/log/nginx/access.log`, `/var/log/nginx/error.log`

To copy the logs volume off the host:

```bash
docker run --rm -v strm-next_logs:/data -v "$PWD":/dest busybox \
  cp -r /data /dest/strm-logs-backup
```

## 9. Why a Node server (and not pure static hosting)

Next.js can emit static files with `output: 'export'`, but only when the app has no API routes and no dynamic SSR. This app uses both:

- `/api/tmdb/search` — server-side route that holds the TMDB key
- `/watch/[type]/[id]` — dynamic SSR

A static export would either expose the TMDB key to the client or break the search/player. The container is the right answer.

## Bare-metal alternative (no Docker)

If you ever want to drop the container, the steps are:

1. Install Node 20.9+ on the host.
2. `npm ci && npm run build` in `/opt/strm-next`.
3. Run as a dedicated `strm` user via systemd (`ExecStart=/usr/bin/node .next/standalone/server.js`, `WorkingDirectory=/opt/strm-next`, `EnvironmentFile=/opt/strm-next/.env`, `Environment=PORT=3000 HOSTNAME=127.0.0.1`).
4. nginx and Cloudflare config from sections 4–6 are unchanged.

Standalone output (`output: 'standalone'` in `next.config.ts`) means you can ship just `.next/standalone/`, `.next/static/`, and `public/` — no `node_modules` on the host beyond what the standalone build inlined.
