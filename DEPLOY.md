# JoyJump v2 — Deploy in 4 Steps (all browser, no installation)

## Step 1 — Extract
Unzip `joyjump-v2-final.tar.gz`.
You get a folder called `joyjump2`. That is your entire app.

## Step 2 — GitHub (2 minutes)
1. Go to github.com → sign up free → click + → New repository
2. Name it `joyjump` → Create repository  
3. On the next screen click **"uploading an existing file"**
4. Drag everything INSIDE the `joyjump2` folder into the upload box
   (not the folder itself — drag the contents)
5. Click **Commit changes**

## Step 3 — Vercel (90 seconds)
1. Go to vercel.com → sign up with GitHub → Add New Project
2. Select your `joyjump` repo → click **Deploy**
3. Done. You get a live URL like `joyjump-abc.vercel.app`

## Step 4 — Supabase (optional — for cloud progress sync)
Without Supabase everything works — progress saves to the browser.
With Supabase, progress syncs across all devices.

1. supabase.com → New project (free tier)
2. Settings → API → copy Project URL and anon key
3. In Vercel → Settings → Environment Variables → add:
   - `NEXT_PUBLIC_SUPABASE_URL`  = your Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your anon key
4. Supabase → SQL Editor → paste supabase-schema.sql → Run
5. Vercel → Deployments → Redeploy

---

## What Dhruvee sees on first open
1. Juno the Rabbit greets her with a welcome animation
2. She types her name
3. She picks her favourite animal friend
4. She gets 5 welcome stars
5. The JoyJump Universe world map appears

## What's fully playable right now
- Math Mountain — complete Class 3 curriculum (11 topics, 20+ lessons)
- Story Forest — complete English Grammar (11 topics)
- Science Ocean — complete Class 3 Science (8 topics)
- 6 game types: Tap Answer, Touch Drag Match, Speed Challenge, 
  Sorting, Memory Match (3D flip cards), Sequence
- Synthesised sounds (no audio files needed)
- Confetti celebrations
- Stars, coins, badges
- Parent dashboard with topic breakdown
- Daily streak tracking
- Mute button (persistent)
- Works offline (localStorage)
- PWA — can be "added to home screen" on any phone/tablet

## Adding Hindi World / Discovery Space
1. Create data/curriculum/hindi-world.json (copy math-mountain.json structure)
2. pages/worlds/hindi.js already exists — just pass the curriculum data
3. No other changes needed
