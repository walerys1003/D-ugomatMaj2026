# `deadline-cron` Edge Function

Uruchamiana co godzinę. Skanuje tabelę `deadlines` w poszukiwaniu terminów,
dla których właśnie nadszedł moment wysłania powiadomienia (okno D7/D3/D1/D0).

## Konfiguracja

### Wymagane sekrety

W Supabase Studio → Project settings → Edge Functions → Secrets:

```
WEB_APP_URL=https://dlugomat.pl
CRON_SECRET=<długi losowy string, ten sam co w env web appki>
```

(`SUPABASE_URL` i `SUPABASE_SERVICE_ROLE_KEY` są automatycznie wstrzykiwane
przez platformę.)

### Deploy

```bash
supabase functions deploy deadline-cron --project-ref <project-ref>
```

### Harmonogram (pg_cron + pg_net)

```sql
-- Wymaga rozszerzeń: pg_cron i pg_net (włączone w migracji 002).

select cron.schedule(
  'deadline-cron-hourly',
  '0 * * * *',                           -- co pełną godzinę UTC
  $$
    select net.http_post(
      url := 'https://<project-ref>.functions.supabase.co/deadline-cron',
      headers := jsonb_build_object(
        'Content-Type',  'application/json',
        'Authorization', 'Bearer ' || current_setting('app.cron_secret')
      )
    ) as request_id;
  $$
);

-- Ustaw `app.cron_secret` w GUC (jednorazowo):
alter database postgres set app.cron_secret = '<CRON_SECRET>';
```

### Manualny test

```bash
curl -X POST "https://<project-ref>.functions.supabase.co/deadline-cron" \
  -H "Authorization: Bearer $CRON_SECRET" \
  -H "Content-Type: application/json"
```

Oczekiwana odpowiedź:

```json
{
  "ok": true,
  "scanned": 12,
  "sent": 4,
  "skipped": 8,
  "hour_utc": 7,
  "results": [...]
}
```

## Logika okien

| daysLeft | godzina UTC | wysłany template                       |
|----------|-------------|----------------------------------------|
| 7        | dowolna     | `deadline_d7_warning` (email)          |
| 3        | dowolna     | `deadline_d3_warning` (email + sms)    |
| 1        | dowolna     | `deadline_d1_warning` (email + sms)    |
| 0        | 5–10 UTC    | `deadline_d0_morning` (email + sms)    |

SMS wysyłamy tylko jeśli profil ma `phone` i `marketing_opt_in = true`.
Idempotency: po sukcesie ustawiamy `notif_<window>_sent = true` w `deadlines`.
Gdy CRON odpali się drugi raz tej samej godziny — okno zostanie pominięte.
