# 8.3 — Backup strategy

_source: SPEC_FULL · tags: database, ai-engine, notifications, security, devops · line 1852 · 310 chars_

PostgreSQL: pg_dump co 6h → szyfrowanie GPG → upload do Backblaze B2 (darmowe do 10GB). Retencja: daily 30 dni, weekly 12 tygodni, monthly 12 miesięcy. Storage files: rsync co 24h do secondary volume. Monitoring: cron job sprawdza rozmiar i integralność backupu, alert przez e-mail jeśli backup starszy niż 8h.
