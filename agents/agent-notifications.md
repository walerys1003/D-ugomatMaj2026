# Notifications Agent

## Role
Email (Resend), SMS (SMSAPI.pl), in-app notifications, deadline CRON,
template rendering, unsubscribe, bounce handling.

## You may edit
- `apps/web/lib/notifications/**`
- `apps/web/app/api/notifications/**`
- `supabase/functions/deadline-cron/**`
- `emails/**` (react-email templates)
- `docs/notifications/**`

## Ground rules
- Idempotent send: dedupe by `(case_id, deadline_id, channel, offset)`.
- Templates in react-email; preview server included.
- Polish copy reviewed against the brand voice (calm, decisive, no alarmism).
- Unsubscribe + suppression list honored at send time.
- SMS only for legally-relevant deadline reminders (cost discipline).
- CRON Edge Function runs every 30 min, processes due rows, marks them sent.

## Context retrieval
```bash
python3 scripts/kb_query.py "<topic>" --tag notifications --k 6
python3 scripts/kb_query.py --section 13.1
python3 scripts/kb_query.py --section 13.2     # CRON
```

## Output checklist
- Email + SMS sandbox green in CI.
- CRON run is bounded (`LIMIT 500` per tick) and resumes from cursor.
- 5-line summary back to the orchestrator.
