# 🌈 JoyJump v2 — World-Class Learning Universe for Dhruvee

Built for **Dhruvee**, Class 3, Mount St. Mary's School, Delhi Cantt.
This is a complete rebuild focused on delight, engagement and world-class UX.

---

## What's New in v2

| Feature | v1 | v2 |
|---------|----|----|
| World map | Cards list | Interactive explorable scene with islands, paths, sky |
| Characters | Emoji + text | Animated CSS characters with emotion states |
| Sound | Files (missing) | **Web Audio API synthesiser** — zero files needed, works immediately |
| Drag & Drop | HTML5 drag (breaks on tablet) | **Pointer Events** — works perfectly on any touch screen |
| Micro-feedback | None | Animated overlays on every answer |
| Reward screen | Basic | 3-phase cinematic sequence with confetti |
| Mobile | Partial | Full PWA, safe areas, no-select, touch-optimised |

---

## Quick Start (no installation needed)

### Step 1 — Get the files
Extract `joyjump-v2.tar.gz`. You get a folder called `joyjump2`.

### Step 2 — Push to GitHub
1. Go to [github.com](https://github.com) → Sign up / Sign in
2. Click `+` → New repository → name it `joyjump` → Create
3. Click **"uploading an existing file"**
4. Drag the entire contents of the `joyjump2` folder → Commit

### Step 3 — Deploy on Vercel (free, automatic)
1. Go to [vercel.com](https://vercel.com) → Sign up with GitHub
2. Click **Add New Project** → Import your `joyjump` repo
3. Click **Deploy** — that's it. Live in ~90 seconds.

### Step 4 — Optional: Connect Supabase (cloud progress saving)
1. [supabase.com](https://supabase.com) → New project (free)
2. Settings → API → copy Project URL and anon key
3. In Vercel: Settings → Environment Variables → add:
   - `NEXT_PUBLIC_SUPABASE_URL` = your URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your key
4. Supabase → SQL Editor → paste contents of `supabase-schema.sql` → Run
5. Redeploy in Vercel

**Without Supabase:** Everything still works. Progress saves to the browser (localStorage).

---

## Sound Design
JoyJump v2 uses the **Web Audio API** to synthesise all sounds directly in the browser.
Zero sound files are needed. The sounds include:
- Correct answer: ascending sparkle chord
- Wrong answer: gentle soft thud (never harsh)
- Star earned: magical ascending tones
- Lesson complete: full celebration fanfare with harmony
- Button tap: light pop
- Drag start / snap: tactile feel sounds
- Timer tick: subtle warning at <10 seconds

---

## Adding More Worlds (Story Forest, Science Ocean...)

1. Create `data/curriculum/story-forest.json` (same structure as `math-mountain.json`)
2. Copy `pages/worlds/math.js` → `pages/worlds/story.js`, change the data import
3. Copy `pages/worlds/math/lesson/[lessonId].js` to `pages/worlds/story/lesson/[lessonId].js`
4. The character, world map, lesson engine, reward system all work automatically

---

## Project Structure

```
joyjump2/
├── components/
│   ├── characters/     Character.jsx — animated characters with emotion states
│   ├── games/          TapCorrect, TouchDragMatch, SpeedChallenge, SortingGame, GameRouter
│   ├── layout/         LessonEngine — story → game → quiz → reward flow
│   ├── rewards/        Rewards — flying stars, confetti, RewardScreen, ProgressBar
│   └── world/          WorldMap — the explorable scene
├── data/
│   ├── curriculum/     math-mountain.json — full Class 3 syllabus
│   └── rewards/        badges, stickers, world unlocks
├── lib/
│   ├── store.js        Zustand store — stars, coins, progress, streaks
│   ├── sounds.js       Web Audio API synthesiser — zero files needed
│   ├── confetti.js     canvas-confetti — layered particle system
│   ├── supabase.js     database client
│   └── progress.js     Supabase sync helpers
├── pages/
│   ├── index.js        Home = World Map
│   ├── worlds/math.js  Math Mountain — topic explorer
│   ├── worlds/math/lesson/[lessonId].js  Dynamic lesson page
│   └── dashboard/      Parent dashboard
└── supabase-schema.sql Run in Supabase SQL Editor
```

---

## Curriculum Coverage (Math Mountain — Dhruvee's actual syllabus)

**First Term (April–September 2025)**
- 4-Digit Numbers: place value, comparing, ordering
- Addition: with and without carrying
- Subtraction: with and without borrowing
- Geometry: 2D/3D shapes, lines (line, segment, ray), patterns
- Multiplication: concept, tables (2, 5, 10), word problems
- Division: sharing equally

**Final Term (October–December 2025)**
- Fractions: halves, quarters, thirds
- Money: Rupees and Paise
- Time: reading clocks, hours and minutes
- Measurement: cm, m, km
- Handling Data: tally marks, bar graphs

---

## The One Thing That Makes Dhruvee Come Back

The **world map is the home screen.** Not a menu. Not cards.
Dhruvee opens the app and sees a glowing sky with islands she can tap.
Math Mountain glows orange and pulses with a ring of light.
She taps it, Max the Panda bounces, she enters.

That first 5 seconds is what makes children return.

---

*Built with Next.js · Tailwind · Framer Motion · Web Audio API · Supabase · ❤️*
*Curriculum: Mount St. Mary's School, Delhi Cantt — Class 3, 2025-26*
