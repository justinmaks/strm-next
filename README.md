# strmnow.lol

demo: https://strmnow.lol


@@ TODO:
- hcaptcha
- Streaming player: iterate sources and auto-pick a working server (DONE)

## Features

- User registration with validation
- Secure login authentication
- Password hashing with bcrypt
- JWT-based authentication
- IP address tracking for logins
- Protected routes with middleware
- Proper error handling
- Form validation (client and server side)

## Streaming Player

This app includes a lightweight streaming player page that automatically tests and selects a working embed provider from a curated list.

- Location: `app/watch/[type]/[id]/page.tsx`
- Sources list and URL templates: `app/lib/embedSources.ts`
- Current support: movies only (`type = movie`). TV episodes are not yet implemented on the page.

### How it works

- On load, the player shows a small animation with “Picking server…”.
- It probes providers sequentially using a hidden iframe (with `referrerPolicy="no-referrer"`).
- The first provider that loads is selected and displayed in the visible iframe.
- A small badge shows the current server and includes a “Next server” button to switch to the next provider manually.

### Customizing providers

- Edit `app/lib/embedSources.ts` to add/remove providers or reorder them.
- The list entry format is:
  - `id`: unique string
  - `name`: display name
  - `isFrench`: optional marker if the provider is FR-focused
  - `urls.movie` and `urls.tv`: string templates with `{id}`, `{season}`, `{episode}` placeholders
- UEmbed premium has been removed intentionally.

### Route format

- Visit `/watch/movie/[id]` where `[id]` is a TMDB ID expected by most providers in the list.
- Example: `/watch/movie/550` for Fight Club.

### Notes

- Third-party embeds are unstable and may fail (e.g., HLS fragment errors). Use “Next server” or reorder sources to prefer more reliable ones for your region.
- The probing timeout is 12s per provider to reduce false negatives.

## Security Features

- Password hashing with bcrypt (12 rounds)
- Secure HTTP-only cookies for JWT storage
- Input sanitization and validation using Zod
- Protection against common attacks (SQL injection via prepared statements)
- IP address detection with fallbacks for proxies (Cloudflare, Nginx)
- Password strength requirements

## Database

The application uses SQLite for storage, with the database file located in the `/data` directory.

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file with the following content:
   ```
   JWT_SECRET=your-secret-key-change-in-production
   TMDB_API_KEY=key
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```
5. Visit http://localhost:3000

## Routes

- `/login` - Login page
- `/register` - Registration page
- `/dashboard` - Protected dashboard displaying welcome message
- `/watch/movie/[id]` - Streaming player page (TMDB movie ID)
- `/api/auth/login` - Login API endpoint
- `/api/auth/register` - Registration API endpoint
- `/api/auth/logout` - Logout API endpoint

## Technologies Used

- Next.js 15.3+
- React 19+
- SQLite (via better-sqlite3)
- bcryptjs for password hashing
- jsonwebtoken for JWT tokens
- zod for validation
- TypeScript



## Docker Deployment

This project includes Docker support for easy deployment and development.

### Prerequisites

- Docker
- Docker Compose

### Running with Docker

1. Build and start the container:
   ```bash
   docker compose up --build
   ```

2. For production deployment:
   ```bash
   docker compose -f docker-compose.yml up -d
   ```

3. To stop the containers:
   ```bash
   docker compose down
   ```






### Docker Volumes

- `/app/data`: Contains SQLite database files
- Node modules are cached in a named volume


