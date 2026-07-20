# Flowboard — Kanban Task Board

Polished Kanban board for the Next Play Games Software Development internship assessment.

Inspired by Linear / Asana: drag-and-drop columns, guest sessions, and team collaboration features.

## Features

### Required
- Kanban columns: **To Do**, **In Progress**, **In Review**, **Done**
- Create tasks (title + optional description, priority, due date)
- Drag-and-drop status updates
- Guest accounts via Supabase anonymous auth (or local demo mode)
- Row Level Security schema so users only see their own data
- Loading, empty, and error states

### Advanced
1. **Team members & assignees** — add people, assign to cards, avatar chips
2. **Task comments** — detail drawer with chronological comments
3. **Activity log** — status moves, edits, assignments, comments
4. **Labels / tags** — create labels, assign many-to-many, filter board
5. **Due date indicators** — overdue / due soon badges on cards
6. **Search & filtering** — title search, priority, assignee, label filters
7. **Board summary** — totals, in progress, done, overdue + progress bar

## Tech stack

- React 19 + TypeScript + Vite
- Tailwind CSS v4
- `@dnd-kit` for drag-and-drop
- Supabase (Auth + Postgres + RLS)
- Local demo fallback when env vars are missing

## Quick start (demo mode)

```bash
cd kanban-board
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).  
Without Supabase credentials the app uses **local demo mode** with sample tasks stored in `localStorage`.

## Supabase setup (production / submission)

1. Create a free project at [supabase.com](https://supabase.com)
2. Open **SQL Editor** and run [`supabase/schema.sql`](./supabase/schema.sql)
3. Enable **Authentication → Providers → Anonymous**
4. Copy Project URL and `anon` public key from **Project Settings → API**
5. Create `.env`:

```bash
cp .env.example .env
# fill VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
```

6. Restart the dev server:

```bash
npm run dev
```

**Never commit** your service role key. Only the public anon key belongs in the frontend.

## Scripts

| Command        | Description              |
|----------------|--------------------------|
| `npm run dev`  | Local development server |
| `npm run build`| Production build         |
| `npm run preview` | Preview production build |

## Deploy (Vercel)

1. Push this repo to GitHub
2. Import the project in [Vercel](https://vercel.com)
3. Set env vars `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
4. Deploy — include the live URL in your assessment PDF

## Project structure

```
src/
  components/   UI: board, columns, cards, modals, sidebar
  hooks/        Board state provider
  lib/          Supabase client, API, types, utils
supabase/
  schema.sql    Full database schema + RLS policies
```

## Design notes

- Brand-forward header with **Flowboard** as the hero signal
- Cool slate neutrals + teal accent (not a generic purple todo theme)
- Typography: **Instrument Serif** (display) + **Sora** (UI)
- Soft mesh gradients, glass header, intentional motion on load / drag / drawer
- Mobile-friendly horizontal board scroll + responsive header controls

## Tradeoffs / future work

- Realtime Supabase subscriptions for multi-tab sync
- Reorder persistence across all columns in one transaction
- Keyboard-first board navigation and screen-reader polish
- Shared team workspaces (multi-user boards) beyond per-guest isolation
