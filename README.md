# 🌈 JoyJump v4 — Phase 1: Foundation & Security

> Built for Dhruvee · Class 3 · Mount St. Mary's School, Delhi Cantt

---

## What changed in v4 (Phase 1)

### 1. UUID child identity — data integrity fixed
Every child now gets a permanent UUID generated at first launch and stored in
`localStorage`. This UUID is used as the database key for all Supabase writes.

**Before (v3):** `childId = child.name` → two children named "Dhruvee" would
corrupt each other's data.

**Now (v4):** `childId = "a3f8c2d1-..."` → cryptographically unique per device,
never collides.

### 2. localStorage key corrected
Store key was `joyjump-v2` even in v3. Now correctly `joyjump-v4`. Fresh
install will start clean. Existing v3 users will see a clean start (intentional
— prevents stale state migration issues).

### 3. Production-grade Supabase schema
The v3 schema had `using (true)` RLS — any user could read/write any child's
data. v4 schema:

- Proper RLS: parents see only their own children's data
- `attempt_logs` table: full attempt history, never overwritten
- `session_logs` table: time-on-task per session
- `upsert_progress()` RPC: best score wins, but every attempt logged
- `web_vitals` table: Core Web Vitals performance baseline
- Demo policies included with clear `REMOVE BEFORE PRODUCTION` comments

### 4. Progress library rebuilt
`lib/progress.js` now uses the `upsert_progress` RPC. Every lesson completion
creates two records:
- Updates the best-score row in `progress` (for display)
- Inserts a fresh row in `attempt_logs` (for analytics)

Sessions are logged to `session_logs` with start time, end time, duration,
and lessons completed count.

### 5. Session Time Guardian — 20-minute safety limit
Every session is now monitored:

- **17 minutes:** A gentle nudge appears: "3 minutes left! Finish your lesson
  and take a break."
- **20 minutes:** A full-screen break screen appears with a 2-minute minimum
  countdown before the child can resume.
- The break screen suggests an eye-rest exercise and shows a water reminder.
- After the break, a fresh 20-minute session begins.

This follows child screen-time recommendations (WHO, AAP guidelines) and will
be required for any future app-store submission.

### 6. Web Vitals baseline
`lib/vitals.js` captures LCP, FID, CLS, FCP, TTFB. In development they log to
console. In production they POST to Supabase `web_vitals` table so you can
monitor real performance on Dhruvee's actual tablet.

---

## Deploy (unchanged from v3)

### Step 1 — Upload to GitHub
Extract `joyjump-v4.tar.gz` → contents of `joyjump4` folder → push to GitHub.

### Step 2 — Run Supabase schema
Supabase → SQL Editor → paste `supabase-schema-v4.sql` → Run.

This replaces the v3 schema. The new schema is backwards-compatible for
demo mode (anon writes still work until you add Auth in Phase 1b).

### Step 3 — Deploy on Vercel
Import repo → add env vars → Deploy. No config changes from v3.

---

## Phase roadmap

| Phase | Focus | Status |
|-------|-------|--------|
| **1** | Foundation, Security, Session Safety | ✅ **This version** |
| 1b | Supabase Auth (magic link, parent login) | Next |
| 2 | Real character illustrations (Lottie/SVG) | Planned |
| 3 | Content depth: 3 lessons per topic | Planned |
| 4 | Adaptive difficulty, spaced repetition | Planned |
| 5 | Narrative arc, coins shop, social features | Planned |
| 6 | Multi-child, multi-grade, school deployment | Planned |

---

## Content (unchanged from v3)

**4 worlds fully playable:**
- 🏔️ Math Mountain — 20 lessons, 11 topics (Class 3 Maths)
- 🌲 Story Forest — 11 lessons, 11 topics (English Grammar)
- 🔬 Science Ocean — 8 lessons, 8 topics (Class 3 Science)
- 🏵️ Hindi World — 8 lessons, 8 topics (Hindi Grammar)

**7 game types:** Tap Correct, Touch Drag Match, Speed Challenge,
Sorting, Memory Match (3D flip), Sequence, Counting Basket

**47 lessons · 141 quiz questions · 4,500+ lines of code**

---

*Next.js 14.2.35 · Tailwind · Framer Motion · Supabase · Web Audio API*
