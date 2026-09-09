# Hangeuloo

Hangeuloo is a gamified Korean learning app with vocabulary matching, sentence building, listening practice, spaced repetition, and AI interview coaching. It runs on React Router 7 and Cloudflare Workers.

## Requirements

- Node.js 20+
- A Cloudflare account for D1 and Workers AI
- Google OAuth web application credentials

## Local Setup

1. Install dependencies with `npm install`.
2. Copy `.dev.vars.example` to `.dev.vars` and fill in the Google OAuth values.
3. Apply the local database migrations with `npm run db:migrate:local`.
4. Export `CLOUDFLARE_API_TOKEN` with a token that can use Workers AI. The AI binding uses Cloudflare's remote development proxy.
5. Start the app with `npm run dev`.

The local OAuth callback URL is `http://localhost:5173/auth/google/callback`.

## Cloudflare Resources

The Worker bindings are declared in `wrangler.json`:

- `DB`: D1 storage for users, learning profiles, content, review schedules, progress, and interview history.
- `AI`: Workers AI for Korean transcription and structured interview feedback.

Apply migrations to the configured production database with:

```bash
npm run db:migrate:remote
```

Configure production OAuth secrets without committing them:

```bash
npx wrangler secret put GOOGLE_CLIENT_ID
npx wrangler secret put GOOGLE_CLIENT_SECRET
npx wrangler secret put SESSION_SECRET
```

## Commands

```bash
npm run dev                 # local development
npm run typecheck           # route type generation and TypeScript
npm run build               # production build
npm run check               # typecheck, build, and Worker dry run
npm run cf-typegen          # regenerate Cloudflare and route types
npm run db:migrate:local    # apply D1 migrations locally
npm run db:migrate:remote   # apply D1 migrations remotely
```

## Data and Privacy

Interview recordings stay in the browser for playback and transcription and are not retained in object storage. D1 stores the resulting transcript, scenario, structured feedback, and progress. A failed AI request leaves the local recording and typed answer available for retry.
