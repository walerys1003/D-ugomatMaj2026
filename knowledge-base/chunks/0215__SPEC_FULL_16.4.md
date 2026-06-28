# 16.4 — Environment Variables

_source: SPEC_FULL · tags: database, ocr, payments, notifications, devops · line 2372 · 981 chars_

# .env.local.example

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
SUPABASE_DB_URL=postgresql://...

# AI (APIPod)
APIPOD_API_KEY=sk-...
APIPOD_BASE_URL=https://api.apipod.ai/v1
ANTHROPIC_API_KEY=sk-ant-...  # direct fallback

# Stripe
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# AWS SES
AWS_SES_ACCESS_KEY_ID=AKIA...
AWS_SES_SECRET_ACCESS_KEY=...
AWS_SES_REGION=eu-west-1
AWS_SES_FROM_EMAIL=powiadomienia@dlugomat.pl

# SMS
SMSAPI_TOKEN=...
SMSAPI_FROM=Dlugomat

# OCR
AWS_TEXTRACT_ACCESS_KEY_ID=AKIA...
AWS_TEXTRACT_SECRET_ACCESS_KEY=...
AWS_TEXTRACT_REGION=eu-central-1

# Fakturownia
FAKTUROWNIA_API_TOKEN=...
FAKTUROWNIA_PREFIX=dlugomat

# Analytics
NEXT_PUBLIC_POSTHOG_KEY=phc_...
NEXT_PUBLIC_POSTHOG_HOST=https://eu.i.posthog.com

# App
NEXT_PUBLIC_APP_URL=https://dlugomat.pl
NEXT_PUBLIC_APP_NAME=Długomat
NODE_ENV=production
