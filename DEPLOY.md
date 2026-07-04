# Deploying LoyaltyForge to GitHub + Vercel

## 0. Prerequisite: this app needs Postgres in production

The schema is already set to `provider = "postgresql"`. SQLite (what you'd
use for quick local testing) does **not** work on Vercel — its serverless
functions don't share a persistent filesystem. Pick one of these (all have
free tiers and take under 2 minutes to set up):

- **Vercel Postgres** — Storage tab in your Vercel project → Create Database
- **Neon** (neon.tech) — serverless Postgres, very popular Vercel pairing
- **Supabase** (supabase.com) — Postgres + extras

Whichever you pick, copy its connection string — you'll need it below.

## 1. Push to GitHub

```bash
cd loyaltyforge
git init
git add .
git commit -m "Initial commit: LoyaltyForge MVP"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

Your `.env` file is already git-ignored, so no secrets get committed —
`.env.example` is there instead as a template for anyone cloning the repo.

## 2. Get your database ready

Once you have a Postgres connection string, run this **locally** once to
create the tables (you can point it at your production database directly,
or a separate dev database — either works):

```bash
# in loyaltyforge/, with DATABASE_URL in .env pointed at your Postgres
npm install
npx prisma db push
npm run db:seed   # optional: adds a demo cafe you can sign in with
```

## 3. Import the project into Vercel

1. Go to vercel.com → **Add New → Project** → import your GitHub repo.
2. Vercel auto-detects Next.js. Leave the framework preset as-is.
3. **Before deploying**, add these Environment Variables (Project Settings →
   Environment Variables):

   | Name | Value |
   |---|---|
   | `DATABASE_URL` | your Postgres connection string |
   | `NEXTAUTH_SECRET` | a long random string — generate with `openssl rand -base64 32` |
   | `NEXTAUTH_URL` | your production URL, e.g. `https://your-app.vercel.app` |

   Add them for the **Production** environment at minimum (and Preview too
   if you want preview deployments to work against the same database).

4. Deploy.

The repo already includes a `vercel-build` script in `package.json`:

```
prisma generate && prisma db push --accept-data-loss && next build
```

Vercel automatically runs this instead of the plain `build` script, so your
database schema stays in sync with `prisma/schema.prisma` on every deploy.
`--accept-data-loss` is safe here because it only matters if a future schema
change would drop a column with data in it — worth reviewing before you ship
a breaking schema change to a database with real customers in it.

## 4. After it's live

- Visit your Vercel URL, sign up a cafe at `/register`.
- Generate an API key under **API & Widget** and try the endpoints in
  `docs/API.md`.
- Grab the widget snippet from the same page to embed on a cafe's site.

## Notes on scaling past the MVP

- **Migrations**: `db push` is convenient for an MVP with one environment.
  Once you have real customer data and multiple environments (staging/prod),
  switch to `npx prisma migrate dev` locally to generate versioned migration
  files, commit `prisma/migrations/`, and change `vercel-build` to
  `prisma generate && prisma migrate deploy && next build` instead.
- **NEXTAUTH_SECRET**: never reuse the dev value from `.env.example` in
  production.
- **Custom domain**: add it in Vercel's Domains settings, then update
  `NEXTAUTH_URL` to match before redeploying.
