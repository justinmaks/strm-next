# STRM NOW

Public movie search and streaming launcher built with Next.js 16, React 19, Tailwind 4, and TMDB.

## What Changed

- Authentication, registration, JWT cookies, and the SQLite user store were removed.
- The homepage is now the main product surface with public movie search.
- The player UI was refreshed and the server-selection flow was tightened.
- Dependencies were modernized around Next.js 16 tooling.

## Features

- Public TMDB-powered movie search
- Refreshed landing page and result cards
- Automatic embed-provider probing with manual server switching
- Lightweight request validation with Zod
- Structured logging via Winston

## Streaming Player

The player probes providers sequentially and opens the first one that responds.

- Page: `app/watch/[type]/[id]/page.tsx`
- Providers: `app/lib/embedSources.ts`
- Current support: movies only

If all providers fail, the page stays in the loading state with a retry message instead of dropping into a broken frame.

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create `.env.local`:
   ```bash
   TMDB_API_KEY=your_tmdb_key
   ```
3. Start the app:
   ```bash
   npm run dev
   ```
4. Open `http://localhost:3000`

## Routes

- `/` public landing page with movie search
- `/watch/movie/[id]` movie player route

## Scripts

- `npm run dev`
- `npm run build`
- `npm run start`
- `npm run lint`

## Stack

- Next.js 16.2.4
- React 19.2.5
- Tailwind CSS 4.2.4
- TypeScript 6
- Zod 4

## Docker

The Docker files are still present. If you use them, make sure `TMDB_API_KEY` is available to the container at runtime.

