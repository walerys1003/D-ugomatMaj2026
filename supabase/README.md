# Supabase (database + auth)

Forward-only migrations live in `migrations/`. Each file is timestamped
(`YYYYMMDDHHMMSS_*.sql`) and ships exactly one logical change. Once a
migration is merged to `main`, **never edit it** — write a new migration.

## Local development (Tier 2.1+)

```bash
# Bring up local Postgres + Auth + Storage + Edge runtime:
supabase start

# Apply migrations:
supabase db reset             # destructive — wipes local DB and replays all
# or
supabase migration up         # additive — applies new migrations only

# Regenerate TypeScript types:
supabase gen types typescript --local --schema public \
  > apps/web/lib/db/types.ts
```

## Conventions

* **RLS enabled** on every table the moment it's created.
* **Default deny** — every policy is explicit `select`/`insert`/`update`/`delete`.
* `auth.uid() = owner_id` is the standard owner check.
* Indexes on every FK and every column used in WHERE clauses.
* Use `uuid` PKs (`gen_random_uuid()`) and `created_at`/`updated_at` timestamps.
* `tg_touch_updated_at` trigger keeps `updated_at` honest on every UPDATE.
* `service_role` is reserved for trusted server jobs (webhooks, CRON).

## What's here so far (Tier 1.6)

| Migration                                | Adds                              |
| ---------------------------------------- | --------------------------------- |
| `20260510120000_init_profiles.sql`       | `public.profiles` + RLS + triggers|
