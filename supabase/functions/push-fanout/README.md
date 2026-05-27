# push-fanout — Supabase Edge Function

Worker for fanning out queued push notifications (Web Push protocol with VAPID).

## Trigger

Runs every 60 seconds via Supabase Cron (pg_cron + pg_net):

```sql
select cron.schedule(
  'push-fanout-1min',
  '* * * * *',
  $$
    select net.http_post(
      url := 'https://<project-ref>.functions.supabase.co/push-fanout',
      headers := jsonb_build_object(
        'Authorization', 'Bearer ' || current_setting('app.cron_secret')
      )
    );
  $$
);
```

## Secrets required

```bash
supabase secrets set CRON_SECRET=<random-64-char>
supabase secrets set VAPID_PUBLIC_KEY=<base64-url>
supabase secrets set VAPID_PRIVATE_KEY=<base64-url>
supabase secrets set VAPID_SUBJECT=mailto:noreply@dlugomat.app
```

`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are auto-provided.

## Deploy

```bash
supabase functions deploy push-fanout --no-verify-jwt
```

`--no-verify-jwt` because we authenticate via `CRON_SECRET` header check
inside the function.

## Algorithm

1. Bearer-token authorize (CRON_SECRET or service-role key).
2. Try `rpc('claim_push_batch')` for atomic queue claim; fall back to
   `select … where delivery_status='queued' limit 100` + UPDATE to
   `'sending'`.
3. Look up `push_subscriptions` for all involved user_ids.
4. For each notification, POST to every subscription endpoint with VAPID
   headers. Mark `'sent'` if ANY subscription accepted, else increment
   `attempts` and re-queue (or mark `'failed'` after MAX_ATTEMPTS=3).
5. Return JSON summary `{ processed, sent, failed, timestamp }`.

## Throughput

- BATCH_SIZE = 100 notifications / invocation
- Schedule = every 1 minute → 6000 deliveries/hour theoretical max
- Each delivery = 1 HTTP POST to push endpoint (~50-200ms)
- Sequential within batch — for >100/min, increase BATCH_SIZE or parallelize
