================================================================
 LIFESENSE — COMPLETE PRODUCTION LAUNCH GUIDE
 Written for EMEMZYVISUALS DIGITALS
 Version: Final
 Platform: AethLife — AI Life Operating System
 Domain:   aethlife.vercel.app
================================================================

This is your single reference document for everything.
Read it once, then follow each section in order.
Every step is written so a complete beginner can follow it.

================================================================
 TABLE OF CONTENTS
================================================================

 PART 1 — OVERVIEW
   1.1  What AethLife is
   1.2  Tech stack summary
   1.3  Pricing structure
   1.4  What you need before starting
   1.5  Order to follow

 PART 2 — SUPABASE (Database + Auth)
   2.1  Create account
   2.2  Create project
   2.3  Get your 3 API keys
   2.4  Run database migrations
   2.5  Disable email verification
   2.6  Set redirect URLs
   2.7  Set password requirements

 PART 3 — GOOGLE OAUTH (Branded Sign-in)
   3.1  Create Google Cloud account
   3.2  Create project
   3.3  Set up OAuth consent screen
   3.4  Create credentials
   3.5  Connect to Supabase
   3.6  Publish OAuth app

 PART 4 — GROQ AI (4-Key Rotation System)
   4.1  What Groq does in AethLife
   4.2  Create up to 4 Groq accounts
   4.3  Get your API keys
   4.4  Add keys to your project
   4.5  How the rotation works

 PART 5 — FIREBASE (Push Notifications ONLY — not for hosting)
   5.1  Create Firebase account and project
   5.2  Add web app and get config
   5.3  Get VAPID key for push notifications
   5.4  Install Firebase CLI
   5.5  Login and enable Next.js support
   5.6  Connect project to Firebase

 PART 6 — AURPAY (Crypto Payments)
   6.1  Your Aurpay credentials (already obtained)
   6.2  Get your Callback Secret
   6.3  How the payment flow works
   6.4  Supported cryptocurrencies
   6.5  Configure webhook URL after deploy

 PART 7 — RESEND (Email)
   7.1  Create account and get API key
   7.2  Sender email setup
   7.3  What emails AethLife sends

 PART 8 — PROMO CODE SYSTEM
   8.1  How it works
   8.2  How to set your code
   8.3  How to use it
   8.4  How to invalidate it

 PART 9 — PWA ICONS
   9.1  Prepare your logo
   9.2  Generate all icon sizes
   9.3  Place files in correct locations
   9.4  Verify icon setup

 PART 10 — ENVIRONMENT VARIABLES
   10.1  Complete .env.local template
   10.2  Variable reference table

 PART 11 — LOCAL DEVELOPMENT
   11.1  Install dependencies
   11.2  Start dev server
   11.3  Test checklist

 PART 12 — DEPLOY TO VERCEL
   12.1  First deploy command
   12.2  Add environment variables to Firebase
   12.3  Redeploy after adding variables

 PART 13 — AURPAY WEBHOOK CONFIGURATION
   13.1  Set webhook URL in Aurpay
   13.2  Verify webhook is working
   13.3  Test a real payment

 PART 14 — GOOGLE SEARCH CONSOLE (SEO)
   14.1  Add your site
   14.2  Verify ownership
   14.3  Submit sitemap
   14.4  Request indexing

 PART 15 — AFTER LAUNCH CHECKLIST

 PART 16 — TROUBLESHOOTING

 PART 17 — QUICK REFERENCE


================================================================
 PART 1 — OVERVIEW
================================================================

1.1  WHAT VIGORFLOW IS
─────────────────────
AethLife is an AI-powered personal life operating system.
It connects fitness tracking, expense management, habit building,
energy logging, and behavioral analysis in one platform — then
uses AI to show users how these systems affect each other.

Example insight: "On days you skip workouts, your spending
increases by 73% compared to workout days."

1.2  TECH STACK SUMMARY
────────────────────────
Frontend:       Next.js 15, TypeScript, Tailwind CSS
Database:       Supabase PostgreSQL (17 tables, Row Level Security)
Authentication: Supabase Auth (email + Google OAuth)
AI:             Groq (LLaMA 70B for insights, Vision for receipts)
Push:           Firebase Cloud Messaging
Email:          Resend
Payments:       Aurpay (crypto only for now)
Hosting:        Firebase Hosting + Cloud Run (free tier)
Offline:        Service Worker PWA + IndexedDB

1.3  PRICING STRUCTURE
───────────────────────
Plan         NGN Price    USD Equiv    Notes
─────────────────────────────────────────────
Monthly      ₦5,000/mo    ~$4/mo       Recurring
Yearly       ₦50,000/yr   ~$40/yr      Best Value badge
Lifetime     ₦45,000      ~$35         One-time payment

Crypto discount: 6% off all plans via Aurpay (applied automatically)

Free tier includes:
  - Full fitness, expense, habit tracking
  - 3 AI insights per week
  - 5 receipt scans per month
  - Basic budgeting
  - Offline PWA

Premium includes everything plus:
  - Unlimited AI coaching + insights
  - Advanced behavioral correlations
  - Unlimited receipt scanning
  - Deep analytics
  - Enhanced notifications

1.4  WHAT YOU NEED BEFORE STARTING
────────────────────────────────────
Required:
  □ A computer (Windows, Mac, or Linux)
  □ Internet connection
  □ Node.js v18+ (download from nodejs.org)
  □ A Google account (for Firebase and Google OAuth)
  □ The AethLife project folder on your computer

Optional but recommended:
  □ A GitHub account (for version control)
  □ Up to 4 email accounts for Groq key rotation
  □ A text editor like VS Code (code.visualstudio.com)

Check Node.js is installed — open terminal and type:
  node --version
Should show v18.x.x or higher. If not, download from nodejs.org.

1.5  ORDER TO FOLLOW
─────────────────────
Follow the parts in this exact order:
  Part 2 → Supabase
  Part 3 → Google OAuth
  Part 4 → Groq AI
  Part 5 → Firebase
  Part 6 → Aurpay (credentials already obtained)
  Part 7 → Resend
  Part 8 → Promo code
  Part 9 → PWA icons
  Part 10 → Fill in .env.local
  Part 11 → Run locally and test
  Part 12 → Deploy to Vercel
  Part 13 → Configure Aurpay webhook
  Part 14 → Submit to Google Search Console
  Part 15 → Final checklist


================================================================
 PART 2 — SUPABASE (DATABASE + AUTH)
================================================================

Supabase stores all user data: workouts, expenses, habits,
profiles, subscriptions, AI insights, notifications.

2.1  CREATE ACCOUNT
────────────────────
1. Open your browser and go to: https://supabase.com
2. Click "Start your project"
3. Sign up with GitHub (recommended) or email
4. Confirm your email if asked

2.2  CREATE PROJECT
────────────────────
1. After logging in, click "New project"
2. Fill in the form:
     Organization:      (your name or EMEMZYVISUALS DIGITALS)
     Project name:      aethlife
     Database password: create a strong password
                        SAVE THIS SOMEWHERE SAFE
     Region:            eu-west-2 (London)
                        Good for Nigeria/Africa users
     Plan:              Free
3. Click "Create new project"
4. WAIT 2 minutes — do not close the tab
   A loading bar shows — this is normal

2.3  GET YOUR 3 API KEYS
─────────────────────────
1. Left sidebar → Project Settings (gear icon at bottom)
2. Click "API" in the settings menu
3. Copy these three values:

   PROJECT URL:
   → Find "Project URL" field
   → Copy the full URL: https://abcdefghijk.supabase.co
   → This is: NEXT_PUBLIC_SUPABASE_URL

   ANON KEY:
   → Find "Project API Keys" section
   → Find the row labeled "anon" and "public"
   → Click the copy icon or the eye icon to reveal, then copy
   → This is: NEXT_PUBLIC_SUPABASE_ANON_KEY

   SERVICE ROLE KEY:
   → In the same section, find "service_role"
   → Click copy icon (WARNING: keep this secret — full DB access)
   → This is: SUPABASE_SERVICE_ROLE_KEY

4. Open your project folder on your computer
5. Open (or create) the file named: .env.local
6. Paste the values in (replace the examples):
     NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
     NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
     SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...

2.4  RUN DATABASE MIGRATIONS
──────────────────────────────
This creates all 17 tables, indexes, Row Level Security policies,
triggers, and seeds 55 exercises + 14 expense categories.

Run Migration 1 (schema):
1. Left sidebar → SQL Editor (looks like a database icon with </>)
2. On your computer, open this file:
     supabase/migrations/001_initial_schema.sql
3. Select all text (Ctrl+A on Windows, Cmd+A on Mac)
4. Copy (Ctrl+C / Cmd+C)
5. Click inside the Supabase SQL Editor text area
6. Paste (Ctrl+V / Cmd+V)
7. Click the green "Run" button (or press Ctrl+Enter)
8. Wait for: "Success. No rows returned"
   If you see red text, check troubleshooting in Part 16.

Run Migration 2 (seed data):
Repeat the exact same steps with:
  supabase/migrations/002_seed_data.sql
Wait for success.

Run Migration 3 (rate limits + analytics):
Repeat with:
  supabase/migrations/003_rate_limits_analytics.sql
Wait for success.

Verify tables exist:
  Left sidebar → Table Editor
  You should see: profiles, workouts, expenses, habits,
  expense_categories, ai_insights, subscriptions, etc.

2.5  DISABLE EMAIL VERIFICATION (CRITICAL)
───────────────────────────────────────────
Without this step, users will be blocked by an email
verification wall after signing up. AethLife is designed
to take users straight to onboarding — no verification needed.

1. Left sidebar → Authentication → Settings
2. Find "Email Auth" section
3. Find "Enable email confirmations" → toggle it OFF (gray)
4. Find "Enable phone confirmations" → toggle it OFF
5. Click "Save"

2.6  SET REDIRECT URLS
───────────────────────
These tell Supabase where to send users after OAuth sign-in.

1. Still in Authentication → Settings
2. Find "URL Configuration" section
3. "Site URL" field → type:
     https://aethlife.vercel.app
4. "Redirect URLs" → click "Add URL" and add these one by one:
     https://aethlife.vercel.app/auth/callback
     http://localhost:3000/auth/callback
5. Click "Save"

2.7  SET PASSWORD REQUIREMENTS
────────────────────────────────
1. Authentication → Settings → "Password Security" section
2. "Minimum password length" → set to 8
3. Click "Save"

AethLife enforces stronger requirements (uppercase, lowercase,
number, special character) on the client side via Zod validation.


================================================================
 PART 3 — GOOGLE OAUTH (BRANDED SIGN-IN)
================================================================

Without this, Google sign-in shows an ugly project ID.
After setup, users see "Continue to AethLife" cleanly.

3.1  CREATE GOOGLE CLOUD ACCOUNT
──────────────────────────────────
1. Go to: https://console.cloud.google.com
2. Sign in with your Google account (Ememzyvisuals@gmail.com)
3. Accept terms of service if shown

3.2  CREATE GOOGLE CLOUD PROJECT
──────────────────────────────────
1. At the top of the page, click the project selector dropdown
   (it might say "Select a project" or a project name)
2. Click "New Project" in the popup
3. Project name: AethLife
4. Organization: leave as "No organization"
5. Click "Create"
6. Wait 10 seconds for it to create
7. Click the selector again → select "AethLife"

3.3  SET UP OAUTH CONSENT SCREEN
──────────────────────────────────
This is what users see when clicking "Continue with Google".

1. Left menu (hamburger ☰) → APIs & Services → OAuth consent screen
2. Select "External" → click Create
3. Fill in the form CAREFULLY:

   App name:
   → Type exactly: AethLife

   User support email:
   → Select: Ememzyvisuals@gmail.com

   App logo:
   → Click "Upload"
   → Select your AethLife logo PNG file
   → Must be square (equal width and height)
   → Must be at least 120×120 pixels
   → If your logo isn't square, see Part 9.1 for resizing

   Application home page URL:
   → https://aethlife.vercel.app

   Application privacy policy link:
   → https://aethlife.vercel.app/legal/privacy

   Application terms of service link:
   → https://aethlife.vercel.app/legal/terms

   Authorized domains:
   → Click "Add Domain"
   → Type: aethlife.vercel.app
   → Press Enter

   Developer contact information:
   → Email: Ememzyvisuals@gmail.com

4. Click "Save and Continue"
5. Scopes page → do not add anything → click "Save and Continue"
6. Test users page → click "Add Users" → enter your Gmail address
7. Click "Add" → click "Save and Continue"
8. Review summary → click "Back to Dashboard"

3.4  CREATE OAUTH CREDENTIALS
───────────────────────────────
1. Left menu → APIs & Services → Credentials
2. Click "+ Create Credentials" at the top
3. Select "OAuth client ID"
4. Application type: "Web application"
5. Name: AethLife Web

6. "Authorized JavaScript origins" section:
   Click "Add URI" → type: https://aethlife.vercel.app → Enter
   Click "Add URI" → type: http://localhost:3000 → Enter

7. "Authorized redirect URIs" section:
   IMPORTANT — do this step carefully:
   a. Open a new browser tab
   b. Go to your Supabase project
   c. Click Authentication → Providers → Google
   d. You see a field labeled "Callback URL (for OAuth)"
      It looks like: https://abcdefg.supabase.co/auth/v1/callback
   e. COPY that entire URL
   f. Go back to Google Cloud tab
   g. Click "Add URI" → paste the Supabase callback URL → Enter

8. Click "Create"

9. A popup appears with TWO values:
   Client ID:     (long string ending in .apps.googleusercontent.com)
   Client Secret: (shorter string)
   COPY BOTH VALUES NOW — paste them somewhere safe

3.5  CONNECT GOOGLE CREDENTIALS TO SUPABASE
─────────────────────────────────────────────
1. Go to your Supabase project
2. Authentication → Providers → Google
3. Toggle "Google" to ENABLED (green)
4. Paste your Client ID into the "Client ID" field
5. Paste your Client Secret into the "Client Secret" field
6. Click "Save"

3.6  PUBLISH YOUR OAUTH APP (FOR PRODUCTION)
──────────────────────────────────────────────
Currently your app is in "Testing" mode — only test users can
sign in. To allow all users:

1. Google Cloud → APIs & Services → OAuth consent screen
2. Find "Publishing status" section
3. Click "Publish App" → Confirm in the dialog

NOTE: During Google's review period (usually 1-7 days), users
see a warning: "This app is not verified by Google".
They can still sign in by clicking "Advanced" → "Go to AethLife".
This is normal and safe for early users. Full verification removes
the warning — apply via the verification button in Google console.


================================================================
 PART 4 — GROQ AI (4-KEY ROTATION SYSTEM)
================================================================

4.1  WHAT GROQ DOES IN VIGORFLOW
──────────────────────────────────
Two features use Groq AI:

Receipt Scanning:
  Model: llama-3.2-11b-vision-preview
  What it does: Reads receipt photos, extracts merchant,
  amount, date, and line items automatically.

AI Insights:
  Model: llama-3.3-70b-versatile
  What it does: Analyzes your workout, expense, habit, and
  energy data to surface behavioral correlations.

4.2  WHY 4 KEYS (KEY ROTATION)
────────────────────────────────
Groq's free tier has rate limits per API key.
AethLife rotates between up to 4 keys automatically.
If Key 1 hits the limit, Key 2 is tried. Then Key 3, Key 4.
This gives you 4× the free tier capacity.

Free tier per key:
  LLaMA 70B: 30 requests/minute, 14,400/day
  Vision:    20 requests/minute,  7,200/day

With 4 keys: 120 requests/minute, 57,600/day
(More than enough for thousands of users)

4.3  CREATE UP TO 4 GROQ ACCOUNTS
────────────────────────────────────
Each Groq account = 1 free API key.
Each account needs a different email address.

Account 1 (required — use your main email):
  1. Go to: https://console.groq.com
  2. Click "Sign Up"
  3. Sign up with Ememzyvisuals@gmail.com
  4. Confirm email if asked

Account 2 (optional but recommended):
  1. Create a second Google account
     e.g. aethlife.ai@gmail.com or aethlifeapp@gmail.com
  2. Go to: https://console.groq.com
  3. Sign up with the second email

Account 3 and 4:
  Same process — different emails each time.

4.4  GET YOUR API KEYS
───────────────────────
For each Groq account:
1. Log in to that account at console.groq.com
2. Left sidebar → "API Keys"
3. Click "Create API Key"
4. Name: AethLife Key 1 (or 2, 3, 4)
5. Click Submit
6. COPY THE KEY IMMEDIATELY — it starts with gsk_
   It is only shown once. Store it safely.

4.5  ADD KEYS TO YOUR PROJECT
──────────────────────────────
In your .env.local file, add the keys you have:

  GROQ_API_KEY_1=gsk_first_key_here
  GROQ_API_KEY_2=gsk_second_key_here
  GROQ_API_KEY_3=gsk_third_key_here
  GROQ_API_KEY_4=gsk_fourth_key_here

If you only have 1 key, just set GROQ_API_KEY_1.
The system still works — it just uses that one key.
Add more later as you create more accounts.

HOW IT WORKS AUTOMATICALLY:
  File: lib/groq/client.ts
  The groqWithRotation() function:
  1. Picks the next key in sequence
  2. Calls Groq API with that key
  3. If Groq returns 429 (rate limited), automatically retries
     with the next key
  4. Repeats until success or all keys exhausted
  5. If all keys rate limited, returns a user-friendly error


================================================================
 PART 5 — FIREBASE (PUSH NOTIFICATIONS ONLY)
================================================================

AethLife uses Firebase ONLY for push notifications (FCM).
Hosting is handled by Vercel (Part 12).
You still need a Firebase project — just not for hosting.

5.1  CREATE FIREBASE ACCOUNT AND PROJECT
──────────────────────────────────────────
1. Go to: https://console.firebase.google.com
2. Sign in with the SAME Google account you used in Part 3
3. Click "Create a project" (or "Add project")
4. Project name: aethlife-app
5. Click Continue
6. Enable Google Analytics: Yes → Create new account
   Account name: AethLife Analytics → Continue
7. Click "Create project"
8. Wait about 30 seconds
9. Click "Continue"

5.2  ADD WEB APP AND GET CONFIG
────────────────────────────────
1. On your Firebase project home page, look for platform icons
2. Click the web icon (it looks like: </>)
3. App nickname: AethLife Web
4. DO NOT check "Also set up Firebase Hosting" — Vercel handles hosting
5. Click "Register app"

6. You see a code block like this:
   const firebaseConfig = {
     apiKey: "AIzaSyXXXX",
     authDomain: "aethlife-app.firebaseapp.com",
     projectId: "aethlife-app",
     storageBucket: "aethlife-app.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123:web:abc123"
   };

7. Copy each value into your .env.local:
   NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyXXXX
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=aethlife-app.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=aethlife-app
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=aethlife-app.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
   NEXT_PUBLIC_FIREBASE_APP_ID=1:123:web:abc123

8. Click "Next" → "Next" → "Continue to console"

5.3  GET VAPID KEY (PUSH NOTIFICATIONS)
────────────────────────────────────────
1. In Firebase Console, click the gear icon ⚙ next to
   "Project Overview" in the left sidebar
2. Click "Project settings"
3. Click the "Cloud Messaging" tab at the top
4. Scroll down to "Web configuration" section
5. Under "Web Push certificates", click "Generate key pair"
6. A long key appears — copy it
7. Add to .env.local:
   NEXT_PUBLIC_FIREBASE_VAPID_KEY=BHv...

5.4  INSTALL FIREBASE CLI ON YOUR COMPUTER
────────────────────────────────────────────
Open your terminal (or Command Prompt on Windows) and type:

  npm install -g firebase-tools

This installs the Firebase command-line tool globally.
Takes 2-3 minutes. When done, verify:

  firebase --version

You should see something like: 14.x.x

5.5  LOGIN AND ENABLE NEXT.JS SUPPORT
───────────────────────────────────────
Log in to Firebase from your terminal:

  firebase login

Your browser opens automatically. Sign in with the same
Google account. Return to terminal — it says "Success!".

Enable Next.js framework detection:



 PART 6 — AURPAY (CRYPTO PAYMENTS)
================================================================

6.1  YOUR AURPAY CREDENTIALS (ALREADY OBTAINED)
─────────────────────────────────────────────────
You have already registered and obtained these from:
https://dashboard.aurpay.net/#/integration/plugin

Merchant ID:     mct-f348378b2c8b
API Key:         iv8fceE1R9PQNDLE5wweG5CZAvTCiLhk8p248mkxu00
Callback Token:  WGJ8OYB188R5RLMUSB45R

These are already pre-filled in your .env.local.example file.

6.2  GET YOUR CALLBACK SECRET
───────────────────────────────
The Callback Secret is the masked value on the Callback
Signature page. You need to reveal it.

1. Go to: https://dashboard.aurpay.net/#/integration/callback
2. You see a table with one row: "Callback Signature"
3. The "Callback Secret" column shows dots: ••••••••
4. Click the EYE icon (👁) next to those dots
5. The actual secret value is revealed
6. Copy it
7. Add to .env.local:
   AURPAY_WEBHOOK_SECRET=the_revealed_secret_value

6.3  HOW THE PAYMENT FLOW WORKS
─────────────────────────────────
This is what happens when a user pays:

Step 1: User clicks "Pay with Crypto" on /billing page
Step 2: Our server calls Aurpay API:
          POST https://dashboard.aurpay.net/api/order/pay-url
          Headers: { "api-key": "iv8fce..." }
          Body: { price: 3.76, currency: "USD", ... }
        (Note: 6% discount already applied to price)
Step 3: Aurpay responds with:
          { data: { pay_url: "https://dashboard.aurpay.net/#/cashier/..." } }
Step 4: We redirect user to the pay_url
Step 5: User sees Aurpay checkout, picks crypto (USDT, BTC etc.)
Step 6: User completes payment on the blockchain
Step 7: Aurpay sends POST callback to our webhook URL:
          https://aethlife.vercel.app/api/webhooks/payment?user_id=...&plan=...
        Body includes: status, order_id, amount, vs_price, tx_id
Step 8: Our webhook handler:
        - Checks status is "SUCCESS"
        - Looks up user from query params
        - Prevents duplicate grants (idempotency)
        - Inserts row in subscriptions table
        - Updates profiles table to subscription_tier=premium
        - Sends confirmation email
Step 9: User is redirected to /billing?success=true

6.4  SUPPORTED CRYPTOCURRENCIES
─────────────────────────────────
From Aurpay's API (what your customers can pay with):
  USDT-TRC20 (Tron — cheapest network fees, most popular)
  USDT-ERC20 (Ethereum)
  USDC-TRC20 (Tron)
  USDC-ERC20 (Ethereum)
  ETH        (Ethereum)
  BTC        (Bitcoin)
  BNB        (Binance Smart Chain)
  LTC        (Litecoin)
  DAI-ERC20  (Ethereum)

6.5  CONFIGURE WEBHOOK URL AFTER DEPLOY
─────────────────────────────────────────
NOTE: Do this step AFTER Part 12 (Firebase deploy).
The webhook URL must be live before you configure it.

After your app is deployed:
1. Go to: https://dashboard.aurpay.net
2. Left sidebar → Integration → API Management
   (Look for "Notify URL", "Webhook URL", or "Callback" settings)
3. Enter this URL:
   https://aethlife.vercel.app/api/webhooks/payment?user_id={user_id}&plan={plan}
4. Save

The actual user_id and plan values are embedded in each
order's callback_url when we create the payment, so
Aurpay delivers them to us with each webhook POST.


================================================================
 PART 7 — RESEND (EMAIL)
================================================================

7.1  CREATE ACCOUNT AND GET API KEY
─────────────────────────────────────
1. Go to: https://resend.com
2. Click "Sign up for free"
3. Sign up with your email
4. Confirm email if asked
5. After logging in, left sidebar → API Keys
6. Click "Create API Key"
7. Name: AethLife Production
8. Permission: Full access
9. Click "Create"
10. Copy the key — it starts with re_
11. Add to .env.local:
    RESEND_API_KEY=re_your_key_here

7.2  SENDER EMAIL SETUP
────────────────────────
For initial launch, use Resend's default test domain:
The code uses FROM: "AethLife <info@aethlife.vercel.app>"

If emails fail initially because domain is not verified,
temporarily change the FROM address in lib/email/templates.ts:

  const FROM = `AethLife <onboarding@resend.dev>`;

This works immediately without domain setup and is fine for
early users. Set up your branded domain later.

Later (optional branded domain):
1. Resend → Domains → Add Domain → aethlife.vercel.app
2. Add the DNS records Resend gives you (in Firebase/Google)
3. Verify → branded email works

7.3  WHAT EMAILS VIGORFLOW SENDS
──────────────────────────────────
Email Type            Trigger                   Recipient
──────────────────────────────────────────────────────────
Welcome email         User signs up/OAuth       User
Feedback notification User submits feedback     Ememzyvisuals@gmail.com
Bug report            User reports a bug        Ememzyvisuals@gmail.com
Subscription confirm  Payment webhook received  User
Password reset        User clicks forgot pwd    User (via Supabase)

Note: Password reset emails are sent by Supabase automatically.
You do not need to set up anything extra for password resets.


================================================================
 PART 8 — PROMO CODE SYSTEM
================================================================

The promo code system lets you unlock Lifetime Premium on
any account without paying. Useful for testing all premium
features before real users purchase.

8.1  HOW IT WORKS
───────────────────
- Code lives ONLY in your environment variable (never in DB)
- Any account that enters the code gets Lifetime Premium
- Each account can only redeem one promo code ever
- Rate limited: 5 attempts per IP per hour (prevents brute force)
- Remove or change the env var to invalidate the code instantly
- Uses timing-safe comparison to prevent timing attacks

8.2  HOW TO SET YOUR CODE
───────────────────────────
Add these to your .env.local (and Firebase env vars later):

  PROMO_CODE=YOURCODE
  PROMO_CODE_EXPIRES=2025-12-31T23:59:59Z

Replace YOURCODE with whatever you want. Example:
  PROMO_CODE=VIGORTEST2025
  PROMO_CODE_EXPIRES=2026-01-01T00:00:00Z

Keep it private — only you should know it.

8.3  HOW TO USE IT
────────────────────
1. Create an account on AethLife (or use existing)
2. Go to /billing
3. Scroll down — click "Have a promo code?"
4. The code input expands
5. Type your code exactly (it auto-uppercases)
6. Click "Apply"
7. Lifetime Premium activates instantly
8. You're redirected to the dashboard as a Premium user

8.4  HOW TO INVALIDATE IT
───────────────────────────
To make the code stop working:
  Option A: Remove PROMO_CODE from your .env.local and Vercel env vars
  Option B: Change the value of PROMO_CODE to a new string

After changing Vercel env vars, push to GitHub to redeploy:
  git add . && git commit -m "update" && git push


================================================================
 PART 9 — PWA ICONS
================================================================

Your app needs icons in many sizes for browser tabs,
phone home screens, iOS, and Android.

9.1  PREPARE YOUR LOGO
───────────────────────
You need a PNG version of the AethLife logo.
Requirements:
  - PNG format
  - Square (width equals height)
  - At least 512×512 pixels
  - Transparent or white background

If your logo is not square:
  1. Open it in any image editor
     (Paint on Windows, Preview on Mac, or canva.com)
  2. Add white padding to make it square
  3. Save as PNG

9.2  GENERATE ALL ICON SIZES
──────────────────────────────
1. Open browser → go to: https://realfavicongenerator.net
2. Click "Select your Favicon image"
3. Upload your square 512×512 PNG logo
4. Wait for it to load (5-10 seconds)
5. Scroll down and configure:

   iOS / iPhone section:
   → Background: White (#FFFFFF)

   Android Chrome section:
   → App name: AethLife
   → Background: #14b8a6
   → Theme color: #14b8a6

   Favicon Generator Options (bottom of page):
   → Find the "Path" field
   → Change it to: /icons/

6. Click "Generate your Favicons and HTML code"
7. Wait 10 seconds
8. Click "Download your package"
9. A ZIP file downloads to your computer

9.3  PLACE FILES IN CORRECT LOCATIONS
───────────────────────────────────────
Step A — Extract the ZIP file
  Right-click → Extract All (Windows) or double-click (Mac)

Step B — Copy PNG files to your project
  Copy ALL .png files from the ZIP into:
  your-project/public/icons/

Step C — Rename files to match the manifest
  The generator uses different names. Rename them:

  FROM (in ZIP)                    TO (in public/icons/)
  ─────────────────────────────────────────────────────────
  android-chrome-192x192.png    →  icon-192x192.png
  android-chrome-512x512.png    →  icon-512x512.png
  favicon-16x16.png             →  icon-16x16.png
  favicon-32x32.png             →  icon-32x32.png
  apple-touch-icon.png          →  apple-touch-icon.png (keep same)

Step D — Create missing sizes using Squoosh
  You also need these sizes. Use https://squoosh.app (free, online):
  1. Go to squoosh.app
  2. Drag your 512×512 PNG onto the page
  3. Right panel → find "Resize"
  4. Set both width and height to the target size
  5. Click the download button
  6. Rename the downloaded file and put it in public/icons/

  Sizes to create:
  icon-72x72.png
  icon-96x96.png
  icon-128x128.png
  icon-144x144.png
  icon-152x152.png
  icon-384x384.png

Step E — Place favicon.ico
  Copy favicon.ico from the ZIP to:
  your-project/public/favicon.ico
  (directly in public/, NOT inside public/icons/)

9.4  VERIFY ICON SETUP
───────────────────────
Your public/icons/ folder should contain:
  apple-touch-icon.png
  icon-16x16.png
  icon-32x32.png
  icon-72x72.png
  icon-96x96.png
  icon-128x128.png
  icon-144x144.png
  icon-152x152.png
  icon-192x192.png
  icon-384x384.png
  icon-512x512.png

And public/ should contain:
  favicon.ico
  manifest.json
  sw.js


================================================================
 PART 10 — ENVIRONMENT VARIABLES
================================================================

10.1  COMPLETE .env.local TEMPLATE
────────────────────────────────────
Create a file named exactly ".env.local" in your project root.
Copy everything below and replace placeholder values with your real ones.

─────────────────────────────────────────────
# SUPABASE
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# GROQ AI (add 1-4 keys)
GROQ_API_KEY_1=gsk_first_key_here
GROQ_API_KEY_2=gsk_second_key_here
GROQ_API_KEY_3=gsk_third_key_here
GROQ_API_KEY_4=gsk_fourth_key_here

# FIREBASE
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=aethlife-app.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=aethlife-app
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=aethlife-app.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
NEXT_PUBLIC_FIREBASE_VAPID_KEY=BHv...

# RESEND EMAIL
RESEND_API_KEY=re_...

# APP URL
NEXT_PUBLIC_APP_URL=https://aethlife.vercel.app

# AURPAY (your real credentials)
AURPAY_MERCHANT_ID=mct-f348378b2c8b
AURPAY_API_KEY=iv8fceE1R9PQNDLE5wweG5CZAvTCiLhk8p248mkxu00
AURPAY_CALLBACK_TOKEN=WGJ8OYB188R5RLMUSB45R
AURPAY_WEBHOOK_SECRET=reveal_from_callback_signature_eye_icon

# PROMO CODE (remove to disable)
PROMO_CODE=VIGORTEST2025
PROMO_CODE_EXPIRES=2026-01-01T00:00:00Z
─────────────────────────────────────────────

10.2  VARIABLE REFERENCE TABLE
────────────────────────────────
Variable                              Where to get it
─────────────────────────────────────────────────────────────────────
NEXT_PUBLIC_SUPABASE_URL             Supabase → Settings → API → Project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY        Supabase → Settings → API → anon public key
SUPABASE_SERVICE_ROLE_KEY            Supabase → Settings → API → service_role key
GROQ_API_KEY_1 through _4            console.groq.com → API Keys (1 per account)
NEXT_PUBLIC_FIREBASE_API_KEY         Firebase → Project Settings → Your Apps
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN     Firebase → Project Settings → Your Apps
NEXT_PUBLIC_FIREBASE_PROJECT_ID      Firebase → Project Settings → Your Apps
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET  Firebase → Project Settings → Your Apps
NEXT_PUBLIC_FIREBASE_MESSAGING_*     Firebase → Project Settings → Your Apps
NEXT_PUBLIC_FIREBASE_APP_ID          Firebase → Project Settings → Your Apps
NEXT_PUBLIC_FIREBASE_VAPID_KEY       Firebase → Cloud Messaging → Generate key pair
RESEND_API_KEY                       resend.com → API Keys → Create API Key
NEXT_PUBLIC_APP_URL                  Always: https://aethlife.vercel.app
AURPAY_MERCHANT_ID                   mct-f348378b2c8b (your account, already set)
AURPAY_API_KEY                       iv8fceE1R9PQNDLE5wweG5CZAvTCiLhk8p248mkxu00
AURPAY_CALLBACK_TOKEN                WGJ8OYB188R5RLMUSB45R (Integration → Callback)
AURPAY_WEBHOOK_SECRET                dashboard.aurpay.net → Integration → Callback Signature → eye icon
PROMO_CODE                           Set to any string you want
PROMO_CODE_EXPIRES                   ISO date string: 2026-01-01T00:00:00Z


================================================================
 PART 11 — LOCAL DEVELOPMENT
================================================================

11.1  INSTALL DEPENDENCIES
───────────────────────────
Open your terminal. Navigate to your project:
  cd path/to/vitaflow

Install all packages:
  npm install

This downloads everything needed. Takes 3-5 minutes first time.
You will see a lot of text scroll past — this is normal.

11.2  START DEV SERVER
───────────────────────
  npm run dev

You should see:
  ▲ Next.js 15.x.x
  ○ Local: http://localhost:3000

Open your browser and go to: http://localhost:3000
You should see the AethLife landing page.

11.3  TEST CHECKLIST
─────────────────────
Work through each item. Tick them off as you verify:

Landing page:
  □ Landing page loads at localhost:3000
  □ Logo appears correctly in nav bar
  □ Pricing cards show NGN prices with crypto toggle
  □ FAQ accordion opens and closes

Authentication:
  □ Click "Get started" → /auth/signup loads
  □ Fill in name, email, strong password → submit
  □ NO email verification popup — goes straight to /onboarding
  □ Complete onboarding → reaches /dashboard
  □ Sign out (top right) → goes to /auth/login
  □ Sign back in → reaches /dashboard (skips onboarding)
  □ Google sign-in button → opens Google consent screen
  □ Forgot password → email arrives in inbox

Dashboard:
  □ "Today's Focus" card appears
  □ Stats show zeros (expected for new account)
  □ Charts render without errors
  □ Dark/light mode toggle works

Core features:
  □ /fitness/new → add a workout with 2 exercises → save → appears in /fitness
  □ /expenses/new → add an expense → save → appears in /expenses
  □ /expenses/new?mode=scan → upload a receipt photo → data extracted
  □ /habits → create a habit → toggle it → shows completed
  □ /budget → enter income → save → shows breakdown
  □ /insights → shows empty state or generates insight

Billing:
  □ /billing → loads with crypto payment option
  □ Currency switcher works (NGN/USD/EUR/GBP)
  □ "Have a promo code?" expands → enter your PROMO_CODE → Premium activates
  □ After premium: /insights → Premium features unlocked

PWA:
  □ In Chrome: address bar shows install icon
  □ Push notification permission prompt works


================================================================
 PART 12 — DEPLOY TO VERCEL
================================================================

 PART 13 — AURPAY WEBHOOK CONFIGURATION
================================================================

13.1  SET WEBHOOK URL IN AURPAY
─────────────────────────────────
Now that your app is live, register your webhook URL.

1. Go to: https://dashboard.aurpay.net
2. Sign in
3. Left sidebar → Integration → API Management
4. Look for a field called "Notify URL", "Callback URL",
   "Webhook URL", or "Notification URL"
5. Enter this URL exactly:
   https://aethlife.vercel.app/api/webhooks/payment?provider=aurpay
6. Save

13.2  VERIFY WEBHOOK IS WORKING
─────────────────────────────────
After setting the webhook URL:

1. In Aurpay dashboard → Order → create a test order
   (if they have a sandbox/test mode)
2. OR check: Vercel Dashboard → Project → Deployments → Functions
   Look for "[AethLife] Aurpay webhook received:" in the logs

To view production logs in real-time:
  Vercel Dashboard → Project → Deployments → Functions tab

You should see log entries when Aurpay calls your webhook.

13.3  TEST A REAL PAYMENT
──────────────────────────
To fully verify the payment system works:

1. Go to: https://aethlife.vercel.app/billing
2. Select Monthly plan (₦4,700 with crypto discount)
3. Click "Pay with Crypto"
4. Aurpay checkout opens
5. Select USDT-TRC20 (cheapest fees)
6. Send the exact amount from your crypto wallet
7. Wait for blockchain confirmation (1-10 minutes)
8. After confirmation:
   - Check Supabase → Table Editor → subscriptions
     A new row should appear with status: active
   - Check Supabase → Table Editor → profiles
     Your profile should show subscription_tier: premium
   - Check your email — subscription confirmation email
   - Go to /billing on your app — should show Premium


================================================================
 PART 14 — GOOGLE SEARCH CONSOLE (SEO)
================================================================

Google Search Console tells Google your site exists and
helps it appear in search results.

14.1  ADD YOUR SITE
────────────────────
1. Go to: https://search.google.com/search-console
2. Sign in with your Google account
3. Click "Add property" (top left dropdown or large center button)
4. Choose "URL prefix" option
5. Enter: https://aethlife.vercel.app
6. Click "Continue"

14.2  VERIFY OWNERSHIP
───────────────────────
Google needs to confirm you own the site.
Choose the "HTML tag" verification method:

Step A — Copy the meta tag:
  Google shows something like:
  <meta name="google-site-verification" content="abc123xyz" />
  Copy just the content value: abc123xyz

Step B — Add to your codebase:
  Open: app/layout.tsx
  Find the metadata export object
  Add a verification property:

  export const metadata: Metadata = {
    // ... existing properties ...
    verification: {
      google: 'abc123xyz',   ← paste your content value here
    },
  };

Step C — Save and deploy:
  Save the file
  Push to GitHub: git add . && git commit -m "verify" && git push
  Wait for Vercel deploy to complete (2-3 minutes)

Step D — Verify in Search Console:
  Go back to Google Search Console
  Click "Verify"
  You should see: "Ownership verified"

14.3  SUBMIT YOUR SITEMAP
───────────────────────────
1. In Google Search Console left sidebar → Sitemaps
2. In the "Add a new sitemap" field, type:
   sitemap.xml
3. Click Submit
4. Status should show "Success"
5. Google will now crawl and index your pages

Your sitemap URL is: https://aethlife.vercel.app/sitemap.xml
It includes: / (landing), /auth/login, /auth/signup, /legal/*

14.4  REQUEST INDEXING FOR KEY PAGES
─────────────────────────────────────
Speed up indexing by requesting it manually:

1. Left sidebar → URL Inspection
2. In the search bar at the top, type:
   https://aethlife.vercel.app
3. Press Enter — Google checks the page
4. Click "Request Indexing"
5. Wait a moment — you see "Indexing requested"

Repeat this for:
  https://aethlife.vercel.app/auth/signup
  https://aethlife.vercel.app/auth/login

Timeline expectations:
  First crawl:       1-7 days
  Indexed pages:     1-4 weeks
  Search rankings:   Weeks to months (depends on content)

After one week, return to Search Console → Pages (or Coverage)
to see which pages have been indexed and if there are any errors.


================================================================
 PART 15 — AFTER LAUNCH CHECKLIST
================================================================

Work through every item after your first successful deploy.

AUTH & ONBOARDING
  □ Sign up with email → reaches /onboarding immediately (no email wall)
  □ Sign up with Google → reaches /onboarding immediately
  □ Complete onboarding → reaches /dashboard
  □ Sign out → /auth/login
  □ Sign back in → /dashboard (skips onboarding)
  □ Forgot password → reset link arrives in inbox
  □ Reset password → can sign in with new password

DASHBOARD
  □ Today's Focus card shows 4 action items
  □ Stats cards render (zeros for new account)
  □ Weekly charts render without errors
  □ Dark and light mode work correctly
  □ Mobile layout looks good on your phone

CORE FEATURES
  □ Log a workout with 2+ exercises
  □ Workout appears in /fitness history
  □ /fitness/[workout-id] shows workout detail
  □ Add an expense manually
  □ Scan a receipt (upload a real receipt photo)
  □ Expense appears in /expenses with correct amount
  □ Create 2-3 habits
  □ Toggle habits complete — streak logic works
  □ /budget → enter income → save → shows allocation
  □ AI insights generate after clicking "Generate insight"

BILLING & PAYMENTS
  □ /billing loads with Aurpay crypto option
  □ Currency switcher shows correct amounts (NGN/USD/EUR/GBP)
  □ 6% discount shown on all plans
  □ Promo code input works
  □ Enter your PROMO_CODE → Lifetime Premium activates
  □ Aurpay checkout redirects correctly (after deploy)
  □ After test payment → Premium activates within 5 minutes

EMAIL
  □ Welcome email received after signup (check spam too)
  □ Submit feedback at /feedback → email arrives at Ememzyvisuals@gmail.com
  □ Report a bug → email arrives at Ememzyvisuals@gmail.com

PWA
  □ On Android Chrome: "Add to Home Screen" prompt appears
  □ On iOS Safari: Share → Add to Home Screen works
  □ After install: opens in standalone mode (no browser bar)
  □ Service worker registered (check DevTools → Application)
  □ Offline: cached pages load without internet

SEO
  □ https://aethlife.vercel.app/sitemap.xml loads correctly
  □ https://aethlife.vercel.app/robots.txt loads correctly
  □ Share link on WhatsApp → shows AethLife preview card
  □ Share link on Twitter → shows OG image and title
  □ Google Search Console → sitemap shows "Success"
  □ Vercel Dashboard → Deployments → all green ✓

SECURITY
  □ /dashboard without login → redirects to /auth/login
  □ /api/receipts/scan without auth → returns 401
  □ /api/insights/generate without auth → returns 401
  □ Entering wrong promo code → clear error message (not internal error)


================================================================
 PART 16 — TROUBLESHOOTING
================================================================

ERROR: App shows blank white page at localhost:3000
─────────────────────────────────────────────────────
Cause:   Usually a JavaScript error or missing env variable
Fix:     Open browser DevTools (F12) → Console tab
         Read the error message shown in red
         Most common: environment variable not set

ERROR: "NEXT_PUBLIC_SUPABASE_URL is not defined"
─────────────────────────────────────────────────
Cause:   .env.local missing or not found
Fix:     1. Make sure the file is named exactly: .env.local
            (not env.local, not .env.local.txt)
         2. Make sure it's in the ROOT of your project folder
            (same level as package.json, not inside any subfolder)
         3. Restart the dev server: Ctrl+C then npm run dev

ERROR: "Invalid login credentials" on sign in
─────────────────────────────────────────────
Cause:   Wrong email/password OR user doesn't exist
Fix:     Try creating a new account first

ERROR: Google OAuth gives "redirect_uri_mismatch"
──────────────────────────────────────────────────
Cause:   The callback URL in Google Cloud doesn't match Supabase
Fix:     1. Go to Supabase → Authentication → Providers → Google
         2. Copy the "Callback URL" shown there exactly
         3. Go to Google Cloud → Credentials → your OAuth client
         4. Delete existing redirect URIs
         5. Add the EXACT URL from Supabase (character for character)
         6. Save and wait 5 minutes to take effect

ERROR: Google sign-in shows "Access blocked: App not verified"
──────────────────────────────────────────────────────────────
Cause:   App is in Testing mode and user isn't a test user
Fix:     Short term: user clicks "Advanced" → "Go to AethLife (unsafe)"
         Long term: Publish the app (Part 3.6) or add user as test user

ERROR: Vercel build fails
──────────────────────────
Cause:   TypeScript error or missing import
Fix:     Run: npm run build locally first
         Read the error, fix the file it points to
         Then push to GitHub — Vercel auto-redeploys

ERROR: API routes return 500 in production but work locally
────────────────────────────────────────────────────────────
Cause:   Missing environment variable in Vercel
Fix:     Vercel Dashboard → Project → Settings → Environment Variables
         Compare against your .env.local — add any missing ones
         Vercel auto-redeploys after saving env vars (or push to GitHub)

ERROR: Receipt scanning fails
──────────────────────────────
Cause:   Groq API key invalid OR all keys rate limited
Fix:     Check GROQ_API_KEY_1 is correct in Vercel env vars
         Check Vercel Dashboard → Project → Deployments → Functions tab
         Look for "[AethLife] Groq key" log messages

ERROR: Promo code says "invalid" when you type it correctly
────────────────────────────────────────────────────────────
Cause:   PROMO_CODE env var not set in Vercel (only in .env.local)
Fix:     Vercel Dashboard → Project → Settings → Environment Variables
         Add PROMO_CODE and PROMO_CODE_EXPIRES
         Push to GitHub to trigger redeploy

ERROR: Aurpay checkout returns "Payment system not configured"
──────────────────────────────────────────────────────────────
Cause:   AURPAY_API_KEY or AURPAY_MERCHANT_ID not in Vercel
Fix:     Vercel Dashboard → Project → Settings → Environment Variables
         Add AURPAY_MERCHANT_ID and AURPAY_API_KEY
         Push to GitHub to trigger redeploy

ERROR: Premium not activating after Aurpay payment
────────────────────────────────────────────────────
Cause:   Webhook URL not set in Aurpay OR webhook secret wrong
Fix:     1. Check Aurpay dashboard → Integration → confirm webhook URL
         2. Check Vercel Dashboard → Project → Deployments → Functions
            Look for "[AethLife] Aurpay webhook received:"
         3. Verify AURPAY_WEBHOOK_SECRET matches what's in Aurpay
         4. Check the subscriptions table in Supabase for new rows

ERROR: Emails not sending
──────────────────────────
Cause:   RESEND_API_KEY wrong or domain not verified
Fix:     1. Check RESEND_API_KEY is in Vercel env vars
         2. Go to resend.com → Logs → check for errors
         3. Temporarily change FROM address in lib/email/templates.ts:
            const FROM = `AethLife <onboarding@resend.dev>`;
         4. Push to GitHub → Vercel auto-redeploys

ERROR: Migration fails with "already exists"
──────────────────────────────────────────────
Cause:   You already ran the migration before
Fix:     This is fine — it means tables already exist. Ignore it.
         If you see actual errors (red text with message), check Part 2.4

ERROR: "Extension already exists" during migration
────────────────────────────────────────────────────
Cause:   UUID extension already installed by Supabase by default
Fix:     This is completely fine — ignore it. Continue.


================================================================
 PART 17 — QUICK REFERENCE
================================================================

YOUR APP
────────
Local development:    http://localhost:3000
Production:           https://aethlife.vercel.app
Webhook URL:          https://aethlife.vercel.app/api/webhooks/payment?provider=aurpay
Sitemap:              https://aethlife.vercel.app/sitemap.xml
Robots:               https://aethlife.vercel.app/robots.txt

DASHBOARDS
──────────
Supabase:             https://supabase.com/dashboard
Vercel:               https://vercel.com/dashboard
Google Cloud:         https://console.cloud.google.com
Firebase (FCM only):  https://console.firebase.google.com
Groq:                 https://console.groq.com
Resend:               https://resend.com
Aurpay:               https://dashboard.aurpay.net
Google Search Console: https://search.google.com/search-console

DEPLOY COMMANDS
───────────────
Deploy:               git add . && git commit -m "msg" && git push
                      (Vercel auto-deploys on every GitHub push)
View logs:            Vercel Dashboard → Project → Deployments → Functions
Force redeploy:       Vercel Dashboard → Deployments → Redeploy

USEFUL TERMINAL COMMANDS
─────────────────────────
Start dev server:     npm run dev
Build for production: npm run build
Type check:           npm run type-check
Install packages:     npm install
Node version:         node --version
Git push (= deploy):  git add . && git commit -m "update" && git push

AURPAY CREDENTIALS
──────────────────
Merchant ID:     mct-f348378b2c8b
API Key:         iv8fceE1R9PQNDLE5wweG5CZAvTCiLhk8p248mkxu00
Callback Token:  WGJ8OYB188R5RLMUSB45R
Callback Secret: (click eye icon at dashboard.aurpay.net/integration/callback)

CONTACT
───────
Platform:   AethLife
Company:    EMEMZYVISUALS DIGITALS
Owner:      Ememzyvisuals@gmail.com
Support:    info@aethlife.vercel.app  (later: info@aethlife.xyz)
Twitter:    @ememzyvisuals
Instagram:  @ememzyvisuals
Facebook:   @ememzyvisuals

================================================================
 END OF GUIDE
================================================================
