# 8.2#p2 — Docker Compose (self-hosted Supabase) (part 2)

_source: SPEC_FULL · tags: database, ai-engine, devops · line 1667 · 2165 chars_

  # Supabase Realtime
  realtime:
    image: supabase/realtime:v2.29.15
    container_name: dlugomat-realtime
    restart: unless-stopped
    depends_on:
      db:
        condition: service_healthy
    environment:
      PORT: 4000
      DB_HOST: db
      DB_PORT: 5432
      DB_USER: supabase_admin
      DB_PASSWORD: ${POSTGRES_PASSWORD}
      DB_NAME: ${POSTGRES_DB}
      DB_AFTER_CONNECT_QUERY: 'SET search_path TO _realtime'
      DB_ENC_KEY: ${REALTIME_ENC_KEY}
      API_JWT_SECRET: ${JWT_SECRET}
      FLY_ALLOC_ID: fly123
      FLY_APP_NAME: realtime
      SECRET_KEY_BASE: ${REALTIME_SECRET_KEY_BASE}
      ERL_AFLAGS: '-proto_dist inet_tcp'
      ENABLE_TAILSCALE: 'false'
      DNS_NODES: "''"
    ports:
      - '${REALTIME_PORT:-4000}:4000'

  # Kong API Gateway
  kong:
    image: kong:2.8.1
    container_name: dlugomat-kong
    restart: unless-stopped
    depends_on:
      - auth
      - rest
      - storage
      - realtime
    environment:
      KONG_DATABASE: 'off'
      KONG_DECLARATIVE_CONFIG: /var/lib/kong/kong.yml
      KONG_DNS_ORDER: LAST,A,CNAME
      KONG_PLUGINS: request-transformer,cors,key-auth,acl,basic-auth,rate-limiting
      KONG_NGINX_PROXY_PROXY_BUFFER_SIZE: 160k
      KONG_NGINX_PROXY_PROXY_BUFFERS: 64 160k
    volumes:
      - ./supabase/kong.yml:/var/lib/kong/kong.yml:ro
    ports:
      - '${KONG_HTTP_PORT:-8000}:8000'
      - '${KONG_HTTPS_PORT:-8443}:8443'

  # Nginx reverse proxy (SSL termination)
  nginx:
    image: nginx:alpine
    container_name: dlugomat-nginx
    restart: unless-stopped
    depends_on:
      - kong
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
      - certbot-data:/var/www/certbot:ro
    ports:
      - '80:80'
      - '443:443'

  # Certbot for SSL
  certbot:
    image: certbot/certbot
    container_name: dlugomat-certbot
    volumes:
      - ./nginx/ssl:/etc/letsencrypt
      - certbot-data:/var/www/certbot
    entrypoint: "/bin/sh -c 'trap exit TERM; while :; do certbot renew; sleep 12h & wait $${!}; done;'"

volumes:
  db-data:
    driver: local
  storage-data:
    driver: local
  certbot-data:
    driver: local
