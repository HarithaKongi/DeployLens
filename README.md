# DeployLens

> **Deployment intelligence for GitHub projects.**

DeployLens is a production-deployed developer dashboard that turns GitHub repository activity, Actions runs, deployment records, and release signals into an actionable engineering overview.

## What it does

- 🔐 **GitHub OAuth** — secure account connection with HTTP-only session cookies
- 📦 **Repository intelligence** — browse accessible repositories and repository metadata
- ⚙️ **GitHub Actions analytics** — live workflow runs and success-rate calculations
- 🚀 **Deployment intelligence** — reads GitHub deployment records and environments
- 🧭 **Repository health** — explainable health score derived from completed workflow success
- 📝 **Commit intelligence** — latest default-branch commits with direct GitHub links
- 🔔 **Webhook ingestion** — signed GitHub webhook endpoint with duplicate-delivery protection
- 🗄️ **PostgreSQL + Prisma** — persistence layer for repositories, deployments, and webhook events
- 📱 **Responsive UI** — dark engineering dashboard optimized for desktop and mobile

## Architecture

```text
                    GitHub
                       │
              OAuth + REST API
                       │
                       ▼
                Next.js App
             ┌─────────┴─────────┐
             │                   │
        Live API data       Signed Webhooks
             │                   │
             └─────────┬─────────┘
                       ▼
                    Prisma
                       │
                       ▼
                  PostgreSQL
                       │
                       ▼
              DeployLens Dashboard
```

## Stack

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- Prisma
- PostgreSQL
- GitHub REST API
- GitHub OAuth
- GitHub Webhooks
- Vercel

## Production

**Live application:** https://deploylens-iota.vercel.app

## Local development

```bash
npm install
cp .env.example .env.local
npm run dev
```

Required environment variables:

- `DATABASE_URL`
- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`
- `GITHUB_PRIVATE_KEY` (required for GitHub App operations)
- `GITHUB_INSTALLATION_OWNER`
- `GITHUB_WEBHOOK_SECRET`
- `NEXT_PUBLIC_APP_URL`
- `SESSION_SECRET`

Never commit secrets, private keys, OAuth client secrets, or production database credentials.

## Webhook configuration

Configure the GitHub App webhook URL as:

```text
https://deploylens-iota.vercel.app/api/webhooks/github
```

Use the same secret configured in `GITHUB_WEBHOOK_SECRET`.

Enable deployment-related events, especially:

- `deployment`
- `deployment_status`

The endpoint verifies `X-Hub-Signature-256` before accepting an event and stores delivery IDs to prevent duplicate processing.

## API surface

- `/api/auth/github` — start GitHub OAuth
- `/api/auth/github/callback` — complete OAuth
- `/api/auth/session` — inspect the application session
- `/api/auth/logout` — clear the session
- `/api/github/me` — connected GitHub account
- `/api/github/repositories` — authenticated repositories
- `/api/github/repository?repo=...` — repository intelligence
- `/api/webhooks/github` — signed webhook ingestion
- `/api/health` — application health endpoint

## Project status

**v1.0 — Portfolio-ready**

The application is deployed and its core GitHub integration, live repository intelligence, workflow analytics, deployment records, persistence model, and webhook ingestion are implemented.

## Author

**Haritha Kongi** — Final-Year B.Tech CSE Student & Full-Stack Developer

Portfolio: https://harithakongi.me/
