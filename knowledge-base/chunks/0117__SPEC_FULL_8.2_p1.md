# 8.2#p1 — Docker Compose (self-hosted Supabase) (part 1)

_source: SPEC_FULL · tags: backend, database, ai-engine, notifications, devops · line 1667 · 3247 chars_

# docker-compose.yml (supabase self-hosted)
version: '3.8'

services:
  # PostgreSQL 15 + pgvector
  db:
    image: supabase/postgres:15.1.1.61
    container_name: dlugomat-db
    restart: unless-stopped
    ports:
      - '${POSTGRES_PORT:-5432}:5432'
    environment:
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB:-dlugomat}
      JWT_SECRET: ${JWT_SECRET}
      JWT_EXP: ${JWT_EXP:-3600}
    volumes:
      - db-data:/var/lib/postgresql/data
      - ./supabase/migrations:/docker-entrypoint-initdb.d/migrations
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U postgres']
      interval: 10s
      timeout: 5s
      retries: 5

  # Supabase Auth (GoTrue)
  auth:
    image: supabase/gotrue:v2.151.0
    container_name: dlugomat-auth
    restart: unless-stopped
    depends_on:
      db:
        condition: service_healthy
    environment:
      GOTRUE_API_HOST: 0.0.0.0
      GOTRUE_API_PORT: 9999
      API_EXTERNAL_URL: ${API_EXTERNAL_URL}
      GOTRUE_DB_DRIVER: postgres
      GOTRUE_DB_DATABASE_URL: postgres://supabase_auth_admin:${POSTGRES_PASSWORD}@db:5432/${POSTGRES_DB}
      GOTRUE_SITE_URL: ${SITE_URL}
      GOTRUE_URI_ALLOW_LIST: ${ADDITIONAL_REDIRECT_URLS}
      GOTRUE_JWT_SECRET: ${JWT_SECRET}
      GOTRUE_JWT_EXP: ${JWT_EXP}
      GOTRUE_JWT_DEFAULT_GROUP_NAME: authenticated
      GOTRUE_EXTERNAL_EMAIL_ENABLED: 'true'
      GOTRUE_MAILER_AUTOCONFIRM: 'false'
      GOTRUE_SMTP_HOST: ${SMTP_HOST}
      GOTRUE_SMTP_PORT: ${SMTP_PORT:-587}
      GOTRUE_SMTP_USER: ${SMTP_USER}
      GOTRUE_SMTP_PASS: ${SMTP_PASS}
      GOTRUE_SMTP_ADMIN_EMAIL: ${SMTP_ADMIN_EMAIL}
      GOTRUE_MAILER_URLPATHS_INVITE: /auth/v1/verify
      GOTRUE_MAILER_URLPATHS_CONFIRMATION: /auth/v1/verify
      GOTRUE_MAILER_URLPATHS_RECOVERY: /auth/v1/verify
      GOTRUE_MAILER_URLPATHS_EMAIL_CHANGE: /auth/v1/verify
    ports:
      - '${AUTH_PORT:-9999}:9999'

  # Supabase REST (PostgREST)
  rest:
    image: postgrest/postgrest:v12.2.3
    container_name: dlugomat-rest
    restart: unless-stopped
    depends_on:
      db:
        condition: service_healthy
    environment:
      PGRST_DB_URI: postgres://authenticator:${POSTGRES_PASSWORD}@db:5432/${POSTGRES_DB}
      PGRST_DB_SCHEMAS: public,storage
      PGRST_DB_ANON_ROLE: anon
      PGRST_JWT_SECRET: ${JWT_SECRET}
      PGRST_DB_USE_LEGACY_GUCS: 'false'
      PGRST_APP_SETTINGS_JWT_SECRET: ${JWT_SECRET}
      PGRST_APP_SETTINGS_JWT_EXP: ${JWT_EXP}
    ports:
      - '${REST_PORT:-3000}:3000'

  # Supabase Storage
  storage:
    image: supabase/storage-api:v1.0.6
    container_name: dlugomat-storage
    restart: unless-stopped
    depends_on:
      db:
        condition: service_healthy
    environment:
      ANON_KEY: ${ANON_KEY}
      SERVICE_KEY: ${SERVICE_ROLE_KEY}
      POSTGREST_URL: http://rest:3000
      PGRST_JWT_SECRET: ${JWT_SECRET}
      DATABASE_URL: postgres://supabase_storage_admin:${POSTGRES_PASSWORD}@db:5432/${POSTGRES_DB}
      FILE_SIZE_LIMIT: 10485760  # 10MB
      STORAGE_BACKEND: file
      FILE_STORAGE_BACKEND_PATH: /var/lib/storage
      TENANT_ID: stub
      REGION: eu-central-1
      GLOBAL_S3_BUCKET: stub
    volumes:
      - storage-data:/var/lib/storage
    ports:
      - '${STORAGE_PORT:-5000}:5000'
