# DeployLens

> Deployment intelligence for GitHub projects.

DeployLens is a developer-focused dashboard for understanding what shipped, how long it took, and where deployment risk is accumulating.

## Product vision

DeployLens connects GitHub repository activity with deployment signals so developers can quickly answer:

- What deployed recently?
- Which deployments failed?
- How long are builds taking?
- Which repositories are becoming unhealthy?
- What changed around a failed release?

## Planned capabilities

- GitHub repository connection
- Deployment history and release timeline
- Build duration and success-rate analytics
- Failed deployment detection
- Repository health scoring
- Environment health checks
- Webhook-driven updates
- Deployment detail pages
- Engineering activity overview

## Stack

Next.js · TypeScript · Tailwind CSS · PostgreSQL · Prisma · GitHub API

## Local development

```bash
npm install
cp .env.example .env.local
npm run dev
```

Then open http://localhost:3000.

For database-backed features, configure `DATABASE_URL` and run:

```bash
npx prisma generate
npx prisma db push
```

## Architecture

```text
GitHub API / Webhooks
        │
        ▼
 Next.js API layer
        │
        ├── Repository signals
        ├── Deployment events
        └── Health calculations
                │
                ▼
          PostgreSQL
                │
                ▼
       DeployLens dashboard
```

## Status

🚧 **In active development.** The first milestone establishes the product shell, data model, and deployment dashboard.

## Author

**Haritha Kongi** — Final-Year B.Tech CSE Student & Full-Stack Developer

Portfolio: https://harithakongi.me/
