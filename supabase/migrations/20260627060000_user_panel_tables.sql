-- Audyt 2026-06-27 (iter. panel-coverage): tabele dla modułów panelu
-- użytkownika, które dotąd były makietami (hardcoded dane w UI).
--
-- Dodaje: notes (notatki), favorites (ulubione), messages + message_threads
-- (wiadomości). Wszystkie z RLS owner-only (auth.uid() = user_id).

-- ---------------------------------------------------------------------------
-- notes — notatki użytkownika (opcjonalnie powiązane ze sprawą)
-- ---------------------------------------------------------------------------
create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  case_id uuid,
  title text not null default '',
  body text not null default '',
  tags text[] not null default '{}',
  pinned boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists notes_user_idx on public.notes (user_id, updated_at desc);
create index if not exists notes_case_idx on public.notes (case_id) where case_id is not null;
alter table public.notes enable row level security;

drop policy if exists notes_owner_all on public.notes;
create policy notes_owner_all on public.notes
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- favorites — ulubione zasoby (pisma, orzeczenia, dokumenty, wzory)
-- ---------------------------------------------------------------------------
create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null default 'dokument', -- pismo | orzeczenie | dokument | wzor
  ref_id text not null,                   -- id zasobu (uuid lub slug)
  title text not null,
  subtitle text,
  href text not null,
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  unique (user_id, kind, ref_id)
);
create index if not exists favorites_user_idx on public.favorites (user_id, created_at desc);
alter table public.favorites enable row level security;

drop policy if exists favorites_owner_all on public.favorites;
create policy favorites_owner_all on public.favorites
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- message_threads — wątki konwersacji (z prawnikiem / wsparciem / systemem)
-- ---------------------------------------------------------------------------
create table if not exists public.message_threads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  case_id uuid,
  subject text not null default '',
  counterpart_role text not null default 'support', -- lawyer | support | system
  counterpart_name text not null default 'Wsparcie',
  last_message_at timestamptz not null default now(),
  unread_count integer not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists message_threads_user_idx
  on public.message_threads (user_id, last_message_at desc);
alter table public.message_threads enable row level security;

drop policy if exists message_threads_owner_all on public.message_threads;
create policy message_threads_owner_all on public.message_threads
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- messages — pojedyncze wiadomości w wątku
-- ---------------------------------------------------------------------------
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.message_threads(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  sender text not null default 'user', -- user | lawyer | support | system
  body text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists messages_thread_idx
  on public.messages (thread_id, created_at asc);
alter table public.messages enable row level security;

drop policy if exists messages_owner_all on public.messages;
create policy messages_owner_all on public.messages
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
