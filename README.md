# Momentum

Momentum is a personal daily performance tracker built with Next.js.
It helps you log your day across work, gym, and diet, then turns your inputs into a simple daily score and trend view.

## Features

- Daily check-in flow with focused prompts
- Weighted daily score (0-100) from core habits
- Dashboard with score breakdown and weekly signals
- History page with recent trend and entry ledger
- Local-first persistence for fast usage
- Optional Supabase auth + cloud sync when keys are configured

## Tech Stack

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- Vitest + Testing Library

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Run development server:

```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000)

## Optional Supabase Setup

Momentum now works in two modes:

- Local mode: no setup required, accounts and entries stay in the browser
- Cloud mode: configure Supabase to get cross-device sign-in and synced entries

1. Copy `.env.example` to `.env.local`
2. Set:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

3. In Supabase Auth, enable email/password sign-in
4. If you want immediate sign-up without email confirmation, disable email confirmation in your Supabase auth settings
5. Create this table in Supabase SQL editor:

```sql
create table if not exists public.daily_entries (
  user_id uuid not null references auth.users(id) on delete cascade,
  date text not null,
  work integer not null,
  gym integer not null,
  diet integer not null,
  notes text,
  top_priorities text,
  intended_workout text,
  intended_diet_goal text,
  planned_tasks text,
  completed_tasks text,
  blockers text,
  deep_work_hours integer default 0,
  focus_rating integer default 0,
  total integer not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, date)
);

alter table public.daily_entries enable row level security;

create policy "Users can read their entries"
on public.daily_entries
for select
using (auth.uid() = user_id);

create policy "Users can insert their entries"
on public.daily_entries
for insert
with check (auth.uid() = user_id);

create policy "Users can update their entries"
on public.daily_entries
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete their entries"
on public.daily_entries
for delete
using (auth.uid() = user_id);
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run test` - Run tests once
- `npm run test:watch` - Run tests in watch mode

## Project Structure

- `app/` - Next.js app routes/pages
- `components/` - UI and client components
- `lib/` - Business logic, types, and storage helpers
- `test/` - Unit and component tests
