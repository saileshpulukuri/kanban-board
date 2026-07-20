# Flowboard — Task Manager Assessment Submission

**Candidate:** [Your First Name] [Your Last Name]  
**Project:** Flowboard Kanban Task Board  
**Stack:** React · TypeScript · Vite · Tailwind CSS · Supabase · @dnd-kit

> Rename this file to `firstname_lastname_task_manager_assessment.pdf` after filling in your name, GitHub URL, and live demo URL.

---

## Overview & design decisions

Flowboard is a polished Kanban board for planning and shipping work. The product goal was not “another todo list,” but a board a team would actually open every day — clear hierarchy, calm color, and frictionless drag-and-drop.

**Design**
- Brand-first header with **Flowboard** as the primary visual signal
- Typography: Instrument Serif (display) + Sora (UI)
- Palette: cool slate neutrals with a teal accent (Linear/Asana energy, not generic purple AI defaults)
- Soft mesh background, glass sticky header, staggered column entrance, drawer slide-in, and elevated drag overlay
- Cards show priority, labels, due urgency, and assignee avatars without clutter

**Architecture**
- React frontend talks to Supabase directly (no custom backend) for speed and free-tier friendliness
- Anonymous guest auth + RLS so each guest only reads/writes their own rows
- If Supabase env vars are missing, the app falls back to a local demo store so reviewers can still experience the full UI

---

## Live app

**URL:** `[paste Vercel / Netlify / Cloudflare Pages URL here]`

---

## GitHub repository

**URL:** `[paste public GitHub repo URL here]`

---

## Database schema

Full SQL lives in the repo at `supabase/schema.sql`. Summary:

| Table | Purpose |
|-------|---------|
| `tasks` | Core work items (`title`, `status`, `priority`, `due_date`, `assignee_id`, `position`, …) |
| `team_members` | Per-guest team roster |
| `labels` | Custom tags |
| `task_labels` | Many-to-many task ↔ label |
| `comments` | Task discussion thread |
| `activity_log` | Timeline of creates, moves, edits, assignments, comments |

**RLS:** enabled on every table; policies scope rows to `auth.uid() = user_id` (and task ownership for `task_labels`).

**Statuses:** `todo` · `in_progress` · `in_review` · `done`

---

## Setup instructions (local)

```bash
git clone [YOUR_REPO]
cd kanban-board
npm install
cp .env.example .env
# Optional: add VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY
npm run dev
```

### Supabase (cloud persistence)

1. Create a free Supabase project  
2. Run `supabase/schema.sql` in the SQL Editor  
3. Enable **Authentication → Providers → Anonymous**  
4. Put the project URL + **anon** key in `.env`  
5. Restart `npm run dev`

Do **not** use or commit the service role key.

---

## Advanced features built

| Feature | How it works |
|---------|----------------|
| Team members & assignees | Sidebar add/remove members; assign on create/detail; avatars on cards |
| Comments | Detail drawer → Comments tab; stored in `comments` |
| Activity log | Timeline of status moves and edits in the drawer |
| Labels / tags | Create labels, multi-assign, filter board by label |
| Due date indicators | Overdue / due-soon badges and left border accents |
| Search & filtering | Header search + priority filter; sidebar assignee/label filters |
| Board summary / stats | Header strip + sidebar pulse cards + completion bar |

---

## Tradeoffs & what I’d improve with more time

- Add Supabase Realtime so multiple tabs stay in sync without refresh  
- Batch column reorder updates in a single RPC / transaction  
- Deeper a11y: keyboard reordering, live regions for drag results  
- Optional shared team boards (today isolation is per guest user)  
- Richer empty onboarding when a brand-new Supabase guest has zero seed data  

---

## What to evaluate

- Design quality and intentional visual system  
- Drag-and-drop board with four required columns  
- Guest auth + RLS-aware schema  
- Loading / empty / error handling  
- Advanced collaboration features above  
