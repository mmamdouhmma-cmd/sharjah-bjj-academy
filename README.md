# MATS — BJJ Academy Manager

A full-stack BJJ student management app with Supabase backend and Vercel deployment.

## Features
- Student management (add/edit/delete/renew memberships)
- Kids & adult belt systems with stripe tracking
- Attendance tracking with day-by-day history
- Progress evaluation (Fighter Rating, Technical, Physical)
- Financial tracking with invoices and monthly sales charts
- Arabic/English language toggle
- Dark/Light theme

---

## 🗄️ Step 1: Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Once the project is ready, go to **SQL Editor** → **New Query**
3. Paste the entire contents of `supabase-schema.sql` and click **Run**
4. Go to **Settings** → **API** and copy:
   - **Project URL** (e.g. `https://abcdef.supabase.co`)
   - **anon/public key** (the long JWT string)

---

## 🚀 Step 2: Deploy to Vercel

### Option A: Deploy via GitHub (Recommended)

1. Push this project to a GitHub repository:
   ```bash
   cd bjj-mats
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USER/bjj-mats.git
   git push -u origin main
   ```

2. Go to [vercel.com](https://vercel.com) → **New Project** → Import your GitHub repo

3. In the **Environment Variables** section, add:
   | Name | Value |
   |------|-------|
   | `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key |

4. Click **Deploy**

### Option B: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy (from project root)
cd bjj-mats
vercel

# Set environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY

# Redeploy with env vars
vercel --prod
```

---

## 💻 Local Development

```bash
# Install dependencies
npm install

# Create .env.local from example
cp .env.local.example .env.local
# Edit .env.local with your Supabase credentials

# Run dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
bjj-mats/
├── app/
│   ├── globals.css          # Global styles + theme variables
│   ├── layout.js            # Root layout
│   └── page.js              # Main app (all pages + Supabase integration)
├── lib/
│   ├── supabase.js          # Supabase client
│   ├── db.js                # Database operations (CRUD)
│   ├── i18n.js              # Arabic/English translations
│   └── constants.js         # Belts, physical/technical items, etc.
├── supabase-schema.sql      # Database schema (run in Supabase SQL Editor)
├── .env.local.example       # Environment variable template
├── next.config.js
├── tailwind.config.js
├── vercel.json
└── package.json
```

---

## 🔒 Security Note

The current Supabase policies allow public access (no auth required). For production, you should:

1. Add Supabase Auth (email/password or magic link)
2. Update RLS policies to restrict access to authenticated users
3. Add `user_id` columns to all tables for multi-tenant support
