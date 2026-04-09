# DigiTantra

DigiTantra is a production-style AI-first learning platform that combines full-stack web engineering, applied data workflows, and multiple LLM-powered learning/career assistants in one deployment.

Live app: [https://digitantra.vercel.app](https://digitantra.vercel.app)  
Repository: [https://github.com/ankan00V/DigiTantra](https://github.com/ankan00V/DigiTantra)

## What This Project Covers

- End-to-end full-stack app with modern Next.js App Router architecture.
- Data-science-oriented learning experience with category intelligence and external course aggregation.
- Multi-provider AI product layer including AI Saarthi and AI Enclave service workbenches.
- Production auth architecture with both Google OAuth and email/password + OTP flows.
- MongoDB-backed persistence for users, sessions, OTP lifecycle, OAuth profiles, and marketplace catalogs.
- Vercel production deployment with scheduled cron-based catalog refresh.

## Core Product Modules

### 1) Authentication and Account System

- Google OAuth via NextAuth.
- Email signup flow: `email + name + password + OTP`.
- Email login flow: `email + password`.
- Forgot password flow with OTP verification and password reset.
- Password policy enforcement: minimum 8 chars, uppercase, lowercase, number, special character.
- Profile API and UI with editable name and uploadable profile photo.
- Server-issued custom session cookie: `digitantra_email_session` for email-auth sessions.

### 2) AI Saarthi (Context-Grounded Assistant)

- Route: `POST /api/ai-chatbot`.
- Context-restricted assistant behavior grounded to DigiTantra product data.
- Uses NVIDIA-hosted chat model configuration (`NVIDIA_*` env group).

### 3) AI Enclave

AI Enclave includes 21 tools in total:

- 20 authenticated workbench services powered through `POST /api/ai-enclave/run`.
- 1 dedicated AI blog generator flow.

Service groups:

- Career AI: Resume Builder, Cover Letter Generator, LinkedIn Optimizer, SOP Generator, Email Writer, Interview Prep Coach, Skill Gap Analyzer.
- Learning AI: Career Roadmap Generator, Course Recommender, Assignment Helper, Notes Summarizer, Quiz Generator, Study Planner.
- Content AI: Blog Generator, Social Caption Generator, Ad Copy Generator, Landing Page Copy Generator, SEO Blog Outline Tool.
- Builder/Dev AI: Project Idea Generator, Code Explainer, Debug Helper.

Runtime model strategy:

- Complex services use `AI_ENCLAVE_COMPLEX_*`.
- Lighter services use `AI_ENCLAVE_CHAT_*`.
- Explicit key separation is enforced in production.

### 4) Course Marketplace Intelligence Layer

- Public catalog endpoint: `GET /api/course-marketplace`.
- Protected refresh endpoint: `POST /api/course-marketplace`.
- Refresh auth via `Authorization: Bearer <token>` using `COURSE_MARKETPLACE_REFRESH_TOKEN` or `CRON_SECRET`.
- Provider scraping + normalization + category classification logic.
- Persistent catalog snapshots in MongoDB.
- Vercel cron configured for daily refresh (`0 0 * * *`) in [`vercel.json`](/Users/ankanghosh/Desktop/DigiTantra/vercel.json).

Tracked external providers include IBM SkillsBuild, Forage, Cisco NetAcad, GeeksforGeeks, Codecademy, upGrad, Udacity, Alison, Simplilearn, edX, Coursera, DataCamp, FutureLearn, Udemy, and others.

## Tech Stack

- Framework: Next.js 15 (App Router), React 18, TypeScript.
- UI: Tailwind CSS, shadcn/ui, Radix UI primitives, Recharts.
- Auth: NextAuth (Google OAuth) + custom MongoDB email auth.
- Database: MongoDB.
- AI runtime: OpenAI SDK against NVIDIA endpoint, plus Genkit/Gemini integration paths.
- Email delivery: Nodemailer (SMTP).
- Deployment: Vercel.
- Local HTTPS/tunneling workflow: Slim (`slim start`, `slim share`).

## Key API Endpoints

- `POST /api/auth/[...nextauth]` for OAuth auth handling.
- `POST /api/email-auth/request-otp` for signup OTP issuance.
- `POST /api/email-auth/verify-otp` for signup OTP verification.
- `POST /api/email-auth/login` for email/password login.
- `POST /api/email-auth/logout` for session revoke.
- `GET /api/email-auth/session` for session resolution.
- `GET/PATCH /api/email-auth/profile` for profile read/update.
- `POST /api/email-auth/password-reset/request-otp` for reset OTP.
- `POST /api/email-auth/password-reset/verify-otp` for password reset completion.
- `POST /api/ai-chatbot` for AI Saarthi.
- `POST /api/ai-enclave/run` for AI Enclave tool execution (authenticated).
- `GET/POST /api/course-marketplace` for catalog read/refresh.

## MongoDB Collections

- `auth_email_users`
- `auth_email_otps`
- `auth_email_sessions`
- `auth_oauth_users`
- `courseMarketplace`

## Environment Variables

Set these in local `.env.local` and in Vercel project environments.

AI runtime:

- `NVIDIA_API_KEY`
- `NVIDIA_BASE_URL`
- `NVIDIA_CHAT_MODEL`
- `AI_ENCLAVE_COMPLEX_API_KEY`
- `AI_ENCLAVE_COMPLEX_BASE_URL`
- `AI_ENCLAVE_COMPLEX_MODEL`
- `AI_ENCLAVE_CHAT_API_KEY`
- `AI_ENCLAVE_CHAT_BASE_URL`
- `AI_ENCLAVE_CHAT_MODEL`

Database:

- `MONGODB_URI`
- `MONGODB_DB_NAME`

Auth:

- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `NEXTAUTH_URL_INTERNAL`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `EMAIL_AUTH_SECRET`

SMTP:

- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASSWORD`
- `AUTH_OTP_FROM_EMAIL`
- `AUTH_OTP_FROM_NAME`
- `AUTH_COMPANY_NAME`
- `AUTH_COMPANY_ADDRESS`
- `AUTH_SUPPORT_EMAIL`
- `AUTH_SUPPORT_URL`

Cron/refresh:

- `COURSE_MARKETPLACE_REFRESH_TOKEN`
- `CRON_SECRET`

## Local Development

### Prerequisites

- Node.js 20.x or 22.x
- npm
- Slim installed ([https://slim.sh](https://slim.sh))

### Install and Run

```bash
git clone https://github.com/ankan00V/DigiTantra.git
cd DigiTantra
npm install
npm run dev
```

Default local app runs on `http://localhost:9002`.

### Local HTTPS with Slim (recommended)

```bash
slim start digitantra --port 9002
```

Then open:

```text
https://digitantra.test
```

Optional public tunnel for remote testing:

```bash
slim share --port 9002
```

## Production Deployment (Vercel)

1. Add all required env vars in Vercel.
2. Keep `NEXTAUTH_URL` and `NEXTAUTH_URL_INTERNAL` as `https://digitantra.vercel.app` in production.
3. Add authorized origin: `https://digitantra.vercel.app` in Google Cloud OAuth client.
4. Add redirect URI: `https://digitantra.vercel.app/api/auth/callback/google` in Google Cloud OAuth client.
5. Redeploy after env updates.
6. Ensure cron route `/api/course-marketplace` stays configured with daily schedule.

## Verification Scripts

Local AI Enclave sweep:

```bash
npx tsx scripts/verify-ai-enclave-services.ts
```

Production AI Enclave sweep (authenticated):

```bash
npx tsx scripts/verify-ai-enclave-production.ts https://digitantra.vercel.app <email> <password>
```

Email OTP/session E2E validation:

```bash
npx tsx scripts/verify-email-otp-e2e.ts
```

## Common Production Pitfalls

- `redirect_uri_mismatch`: Google OAuth client is missing the exact production callback URL.
- `NEXTAUTH_URL must use https`: production env still points to localhost/http.
- AI Enclave “configuration missing”: missing `AI_ENCLAVE_CHAT_API_KEY` or `AI_ENCLAVE_COMPLEX_API_KEY`.
- Cookie/session issues: stale deployment without updated auth env values.

## Security Notes

- Never commit real secrets.
- If credentials are exposed, rotate all affected keys immediately.
- Keep sensitive envs marked as sensitive in Vercel.

## Author

Ankan Ghosh  
LinkedIn: [https://www.linkedin.com/in/ankan-ghosh/](https://www.linkedin.com/in/ankan-ghosh/)
