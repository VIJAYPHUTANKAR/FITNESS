# Deploying FitCalc to Netlify (Without GitHub)

This guide explains how to deploy the FitCalc Next.js App Router project directly from your local computer to Netlify using the **Netlify CLI**, without needing a GitHub repository or Git remote.

---

## Why Netlify CLI?

FitCalc is a full-stack Next.js application that uses:
- Next.js Server Components & Middleware (`src/middleware.ts`)
- Server-side route handlers (`/api/foods/search`)
- Supabase SSR cookie authentication (`@supabase/ssr`)

Because these features require a backend runtime (Netlify Edge / Serverless Functions), you cannot simply drag-and-drop an HTML folder into "Netlify Drop". The **Netlify CLI** (`netlify deploy --build --prod`) automatically builds the Next.js runtime bundle and deploys the entire app, functions, and assets to Netlify directly from your local terminal.

---

## Step-by-Step Instructions

### Step 1: Install Netlify CLI Globally

Open your terminal (PowerShell or Command Prompt) and run:

```bash
npm install -g netlify-cli
```

Verify the installation:
```bash
netlify --version
```

---

### Step 2: Log in to Netlify

Authenticate your local machine with your Netlify account:

```bash
netlify login
```

- A browser window will automatically open.
- Click **"Authorize"** to grant Netlify CLI access to your account.
- Return to your terminal.

---

### Step 3: Link or Create a New Netlify Site

From the project root (`c:\Users\gaura\OneDrive\Desktop\fitness`), run:

```bash
netlify init --manual
```

You will be asked a few questions interactively:
1. **What would you like to do?**  
   Select: `Create & configure a new site`
2. **Team:**  
   Select your Netlify team account.
3. **Site name (optional):**  
   Enter a unique name (e.g. `fitcalc-tracker`) or leave blank for a randomly generated name.

Netlify will create the site and display your Site ID and Admin URL.

---

### Step 4: Add Supabase Environment Variables

Your app needs your Supabase URL and Anon Key to function in production. You can set them using the CLI or via the Netlify Web Dashboard.

#### Using CLI:
```bash
netlify env:set NEXT_PUBLIC_SUPABASE_URL "https://your-project-ref.supabase.co"
netlify env:set NEXT_PUBLIC_SUPABASE_ANON_KEY "your-anon-key"
```

#### Or Using Netlify Dashboard:
1. Open your site on [app.netlify.com](https://app.netlify.com).
2. Go to **Site configuration** > **Environment variables**.
3. Add:
   - `NEXT_PUBLIC_SUPABASE_URL` = `https://your-project-ref.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `your-supabase-anon-key`

---

### Step 5: Build and Deploy to Production

Run the one-step build & deploy command:

```bash
netlify deploy --build --prod
```

Netlify CLI will:
1. Automatically read `netlify.toml` and load `@netlify/plugin-nextjs`.
2. Run `npm run build` locally to compile the Next.js application.
3. Package all static assets and serverless functions.
4. Upload directly to Netlify's global CDN and serverless network.
5. Provide you with your live **Website URL** (e.g. `https://fitcalc-tracker.netlify.app`).

---

### Step 6: Update Supabase Auth Redirect URLs

To ensure login and sign-up redirects work on your new Netlify domain:
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard) -> Select your project.
2. Navigate to **Authentication** > **URL Configuration**.
3. Set **Site URL** to your Netlify URL (e.g. `https://fitcalc-tracker.netlify.app`).
4. Under **Redirect URLs**, add:
   - `https://fitcalc-tracker.netlify.app/**`
   - `https://fitcalc-tracker.netlify.app/auth/callback`

---

## Future Updates (Re-deploying)

Whenever you make code changes and want to update your live Netlify site without GitHub, simply re-run:

```bash
netlify deploy --build --prod
```
