# scheduled-cleanup — Supabase Edge Function

Daily housekeeping worker for ephemeral / retention-bound tables.

## What it deletes

| Task                       | Table                      | Cutoff       | Filter                |
|---                         |---                         |---           |---                    |
| `idempotency_records`      | `idempotency_records`      | > 24 h       | —                     |
| `webhook_deliveries_old`   | `webhook_deliveries`       | > 30 d       | `status='delivered'`  |
| `analytics_events_old`     | `analytics_events`         | > 90 d       | —                     |
| `rate_limit_log_old`       | `rate_limit_log`           | > 24 h       | —                     |
| `webauthn_challenges_old`  | `webauthn_challenges`      | > 10 min     | —                     |
| `impersonation_expired`    | `impersonation_sessions`   | `expires_at` past | —                |
| `email_queue_sent_old`     | `email_queue`              | > 7 d        | `status='sent'`       |

## Trigger

Runs daily at 03:15 UTC via Supabase Cron:

```sql
select cron.schedule(
  'scheduled-cleanup-daily',
  '15 3 * * *',
  $$
    select net.http_post(
      url := 'https://<project-ref>.functions.supabase.co/scheduled-cleanup',
      headers := jsonb_build_object(
        'Authorization', 'Bearer ' || current_setting('app.cron_secret')
      )
    );
  $$
);
```

## Deploy

```bash
supabase functions deploy scheduled-cleanup --no-verify-jwt
supabase secrets set CRON_SECRET=<random-64-char>
```

## Output

```json
{
  "ok": true,
  "duration_ms": 423,
  "total_deleted": 1289,
  "details": {
    "idempotency_records":      { "deleted": 412 },
    "webhook_deliveries_old":   { "deleted": 87 },
    "analytics_events_old":     { "deleted": 612 },
    "rate_limit_log_old":       { "deleted": 178 },
    "webauthn_challenges_old":  { "deleted": 0 },
    "impersonation_expired":    { "deleted": 0 },
    "email_queue_sent_old":     { "deleted": 0 }
  }
}
```

Failures on individual tables (e.g. table missing) are returned per-task
without aborting the run. Total summary optionally persisted to
`scheduled_cleanup_runs` table for observability dashboards.
