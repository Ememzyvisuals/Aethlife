# AethLife — AI Life Operating System

> Your AI-powered personal life OS. Connect fitness, habits, finances, and energy.  
> Built by **EMEMZYVISUALS DIGITALS** · [aethlife.vercel.app](https://aethlife.vercel.app)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 App Router, TypeScript, Tailwind CSS |
| UI Components | shadcn/ui, Radix UI, Framer Motion |
| Database | Supabase PostgreSQL with RLS |
| Auth | Supabase Auth (email + Google OAuth) |
| AI | Groq Vision + LLaMA 70B |
| Push Notifications | Firebase Cloud Messaging |
| Email | Resend (free tier) |
| Offline | IndexedDB + Service Worker PWA |
| Hosting | Vercel (free tier) |

---

## Pricing

| Plan | NGN | USD (approx) |
|---|---|---|
| Monthly | ₦5,000/month | ~$4/month |
| Yearly | ₦50,000/year | ~$40/year |
| Lifetime | ₦45,000 one-time | ~$35 one-time |

**6% discount** automatically applied for crypto payments via Aurpay.

---

## Local Development Setup

### 1. Clone and install

```bash
git clone https://github.com/yourname/vitaflow.git
cd vitaflow
npm install
```

### 2. Environment variables

```bash
cp .env.example .env.local
```

Fill in all values in `.env.local` — see comments for where to get each key.

### 3. Supabase setup

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** in your dashboard
3. Run migrations in order:

```sql
-- Run in Supabase SQL Editor:
-- 1. Copy contents of supabase/migrations/001_initial_schema.sql → Run
-- 2. Copy contents of supabase/migrations/002_seed_data.sql → Run
```

4. Enable Google OAuth in **Authentication → Providers → Google**
5. Add `https://aethlife.vercel.app/auth/callback` to redirect URLs

### 4. Google OAuth Branding

To make Google OAuth show "AethLife" instead of the project ID:

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your project → **APIs & Services → OAuth consent screen**
3. Set:
   - App name: `AethLife`
   - App logo: upload your AethLife logo PNG
   - Homepage URL: `https://aethlife.vercel.app`
   - Privacy Policy: `https://aethlife.vercel.app/legal/privacy`
   - Terms of Service: `https://aethlife.vercel.app/legal/terms`
4. Add your domain to **Authorized domains**
5. Submit for verification (required for production OAuth)

### 5. Firebase Setup (Push Notifications)

1. Create project at [Firebase Console](https://console.firebase.google.com)
2. Add a Web App to your project
3. Enable **Cloud Messaging** in your project
4. Get your VAPID key from **Project Settings → Cloud Messaging → Web configuration**
5. Add all Firebase config values to `.env.local`

### 6. Resend Email Setup

1. Sign up at [resend.com](https://resend.com) (free tier: 3,000 emails/month)
2. Add and verify your domain `aethlife.vercel.app`
3. Create an API key and add to `.env.local`
4. The sender address `info@aethlife.vercel.app` will work automatically

### 7. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Deployment to Vercel

### 1. Connect repository

```bash
npx vercel --prod
```

Or connect via [vercel.com](https://vercel.com) dashboard.

### 2. Add environment variables

In Vercel Dashboard → Your Project → Settings → Environment Variables, add all variables from `.env.example`.

### 3. Configure domain

Add `aethlife.vercel.app` as a custom domain in Vercel Dashboard → Domains.

### 4. Update Supabase redirects

Add to Supabase Authentication → URL Configuration:
- Site URL: `https://aethlife.vercel.app`
- Redirect URLs: `https://aethlife.vercel.app/auth/callback`

---

## PWA Setup

The PWA is automatically configured via `public/manifest.json` and `public/sw.js`.

**Generate icons** (place in `public/icons/`):
- icon-72x72.png
- icon-96x96.png
- icon-128x128.png
- icon-144x144.png
- icon-152x152.png
- icon-192x192.png (main)
- icon-384x384.png
- icon-512x512.png (main)
- apple-touch-icon.png (180x180)

Use [realfavicongenerator.net](https://realfavicongenerator.net) with the AethLife logo.

---

## Database Schema Overview

```
profiles              → user account settings, subscription tier
onboarding_preferences → goals, reasons, notification settings
exercises             → global exercise catalog + custom exercises
workouts              → workout sessions
workout_logs          → individual sets (exercise + reps + weight)
step_logs             → daily step counts
expense_categories    → default + custom expense categories
expenses              → all expense records with AI scan data
recurring_expenses    → scheduled recurring bills
budgets               → monthly income and savings goals
budget_category_limits → per-category spending limits
habits                → user habits with streak data
habit_logs            → daily habit completion records
energy_logs           → daily energy and mood ratings
ai_insights           → AI-generated insights (free + premium)
notifications         → in-app notification records
subscriptions         → payment and subscription history
feedback_reports      → user feedback and bug reports
```

---

## Free Tier Limits

| Resource | Limit |
|---|---|
| Supabase | 500MB database, 5GB bandwidth |
| Vercel | 100GB bandwidth, unlimited deployments |
| Groq | ~14,400 requests/day on free tier |
| Resend | 3,000 emails/month |
| Firebase FCM | Unlimited push notifications |

**AI Usage limits (in-app):**
- Free: 3 AI insights/week, 5 receipt scans/month
- Premium: Unlimited everything

---

## Project Structure

```
vitaflow/
├── app/
│   ├── page.tsx                    # Landing page
│   ├── layout.tsx                  # Root layout (fonts, theme, toast)
│   ├── auth/                       # Login, signup, forgot-password, callback
│   ├── dashboard/                  # Main dashboard
│   ├── fitness/                    # Workout tracking
│   ├── expenses/                   # Expense management
│   ├── budget/                     # Budget planning
│   ├── habits/                     # Habit tracking
│   ├── insights/                   # AI insights
│   ├── notifications/              # Notification center
│   ├── billing/                    # Upgrade & subscription
│   ├── settings/                   # User settings
│   ├── onboarding/                 # Multi-step onboarding
│   ├── feedback/                   # Feedback & bug reports
│   ├── legal/                      # Privacy, Terms, Cookies
│   └── api/                        # API routes
├── components/
│   ├── layout/                     # Sidebar, header, mobile nav
│   ├── dashboard/                  # Dashboard content
│   ├── fitness/                    # Fitness components
│   ├── expenses/                   # Expense components
│   ├── habits/                     # Habits components
│   ├── insights/                   # AI insights components
│   ├── notifications/              # Notification components
│   └── shared/                     # Theme provider, shared UI
├── lib/
│   ├── supabase/                   # Client, server, middleware
│   ├── firebase/                   # FCM messaging
│   ├── pricing.ts                  # Pricing constants (NGN primary)
│   └── utils/                      # Offline storage, helpers
├── types/
│   └── index.ts                    # All TypeScript types
├── hooks/
│   └── use-pwa.ts                  # Service worker registration
├── supabase/migrations/
│   ├── 001_initial_schema.sql      # Full DB schema with RLS
│   └── 002_seed_data.sql           # Default exercises + categories
└── public/
    ├── sw.js                       # Service worker
    └── manifest.json               # PWA manifest
```

---

## Contact

- **Email:** info@aethlife.vercel.app
- **Owner:** Ememzyvisuals@gmail.com
- **Twitter/X:** [@ememzyvisuals](https://twitter.com/ememzyvisuals)
- **Instagram:** [@ememzyvisuals](https://instagram.com/ememzyvisuals)
- **Facebook:** [@ememzyvisuals](https://facebook.com/ememzyvisuals)

---

© 2025 AethLife · EMEMZYVISUALS DIGITALS. All rights reserved.
