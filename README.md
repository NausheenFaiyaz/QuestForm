# QuestForm

QuestForm is a full-stack, Typeform-style SaaS platform for creating, publishing, and analyzing interactive forms. It includes a visual form builder, secure authentication, public shareable form links, response analytics, CSV export, and a comic-inspired themed experience for both creators and respondents.

- Live app: `https://quest-form-web.vercel.app/`
- API docs (hosted): `https://questform.onrender.com/docs`
- Frontend hosting: Vercel
- Backend hosting: Render
- Database: Neon (PostgreSQL)

## Demo Credentials

Use these credentials for evaluation testing:

- Demo URL: `https://quest-form-web.vercel.app/signin`
- Demo email: `codexninjadev@gmail.com`
- Demo password: `codeXninja`

## Tech Stack

- Monorepo: Turborepo + pnpm workspaces
- Frontend: Next.js 16, React 19, Tailwind CSS 4, TanStack Query, tRPC client
- Backend: Express 5, tRPC server, OpenAPI via `trpc-to-openapi`, Scalar docs
- Database: PostgreSQL with Drizzle ORM + Drizzle Kit
- Auth: Email/password + Google sign-in, JWT access token + refresh sessions
- Email: Resend API (optional but supported in production)

## Features

- User authentication
  - Sign up/sign in with email + password
  - Google sign-in
  - Session cookies with refresh-token rotation
- Form builder
  - Create/update/publish/unpublish/archive/clone/delete forms
  - Multiple field types: short/long text, email, number, single select, multi select, checkbox, rating, date
  - Welcome and end screens in flow metadata
  - Theme selection for forms (Comic Spiderman, Comic Town, Comic Green Cloud) with a default theme fallback
- Public form experience
  - Shareable form by slug
  - Submit responses with validation
  - Optional respondent email capture
  - Selected form theme is applied to the live public form page background
- Analytics and responses
  - Owner dashboard analytics
  - Per-form analytics and paginated response listing
  - CSV export of form responses from the responses dashboard
  - Form view tracking + completion metrics
- Email notifications
  - Creator form-created email
  - Respondent submission confirmation email

## Monorepo Structure

```text
apps/
  web/                      Next.js frontend
  api/                      Express API server (tRPC + OpenAPI + docs)
packages/
  database/                 Drizzle schema, models, migrations
  services/                 Domain services (user, form, email)
  trpc/                     Shared tRPC server/client package
  logger/                   Shared logger
  eslint-config/            Shared lint config
  typescript-config/        Shared TS config
```

## App Routes (Frontend)

- `/` home
- `/signin`
- `/signup`
- `/pricing`
- `/explore`
- `/dashboard`
- `/dashboard/forms/new`
- `/dashboard/forms/:formId`
- `/dashboard/forms/:formId/responses`
- `/profile`
- `/forms/:slug` public form page
- `/forms/:slug/thank-you`

## API and Docs

Base server endpoints:

- `GET /` basic server message
- `GET /health` basic health message
- `GET /openapi.json` generated OpenAPI schema
- `GET /docs` Scalar API docs
- `/trpc/*` tRPC endpoint
- `/api/*` OpenAPI routes generated from tRPC metadata

OpenAPI procedure groups:

- Authentication
  - `/api/authentication/createUserWithEmailAndPassword`
  - `/api/authentication/signInWithEmailAndPassword`
  - `/api/authentication/signInWithGoogle`
  - `/api/authentication/signOut`
  - `/api/authentication/me`
  - `/api/authentication/updateMe`
- Forms
  - `/api/forms/create`
  - `/api/forms/update`
  - `/api/forms/publish`
  - `/api/forms/unpublish`
  - `/api/forms/delete`
  - `/api/forms/archive`
  - `/api/forms/clone`
  - `/api/forms/mine`
  - `/api/forms/ownerAnalytics`
  - `/api/forms/detail`
  - `/api/forms/analytics`
  - `/api/forms/responses`
  - `/api/forms/explore`
  - `/api/forms/publicBySlug`
  - `/api/forms/submit`
- Health
  - `/api/health/status`

## Response CSV Export

From `/dashboard/forms/:formId/responses`, you can export submissions as CSV using the `Export CSV` button.

- Exports all matching responses (not just the currently visible page)
- Includes respondent email, submitted timestamp, and dynamic columns for question labels
- File name format: `<form-slug>-responses.csv`

## Environment Variables

This repo uses `dotenv --` in scripts, so root `.env` is used across apps/packages.

Required/shared:

- `DATABASE_URL` (Neon/Postgres connection string)
- `JWT_SECRET`
- `JWT_EXPIRES_IN` (default in code: `15m`)
- `ACCESS_TOKEN_EXPIRES_IN` (default: `15m`)
- `REFRESH_TOKEN_EXPIRES_IN` (default: `30d`)
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET` (needed by your auth flow setup)
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID`

API app (`apps/api`) runtime:

- `PORT` (default `8000`)
- `BASE_URL` (default `http://localhost:8000`)
- `CORS_ORIGIN` (default `http://localhost:3000`)

Frontend (`apps/web`) runtime:

- `NEXT_PUBLIC_API_URL` (example: `http://localhost:8000/trpc` or `https://questform.onrender.com/trpc`)

Email (optional but recommended in production):

- `RESEND_API_KEY`
- `EMAIL_FROM` (example: `QuestForm <noreply@yourdomain.com>`)
- `EMAIL_REPLY_TO` (example: `support@yourdomain.com`)
- `APP_WEB_URL` (example: `https://quest-form-web.vercel.app`)

## Local Setup

1. Install dependencies

```bash
pnpm install
```

2. Configure `.env` in repository root.

3. Start Postgres (optional local DB)

```bash
docker compose up -d
```

4. Generate and apply DB migrations

```bash
pnpm db:generate
pnpm db:migrate
```

5. Start all apps

```bash
pnpm dev
```

Default local URLs:

- Web: `http://localhost:3000`
- API: `http://localhost:8000`
- API docs: `http://localhost:8000/docs`

## Scripts

At repo root:

- `pnpm dev` run all dev servers via Turbo
- `pnpm build` build all packages/apps
- `pnpm lint` lint workspace
- `pnpm check-types` typecheck workspace
- `pnpm db:generate` generate Drizzle migration files
- `pnpm db:migrate` apply Drizzle migrations
- `pnpm format` format TS/TSX/MD files


## Deployment Notes

- Frontend (Vercel) should have `NEXT_PUBLIC_API_URL` pointing to your Render backend tRPC endpoint.
  - Example: `https://questform.onrender.com/trpc`
- Backend (Render) should allow CORS for your Vercel domain via `CORS_ORIGIN`.
- Neon is used as the production PostgreSQL database (`DATABASE_URL`).

## License

Private project.
