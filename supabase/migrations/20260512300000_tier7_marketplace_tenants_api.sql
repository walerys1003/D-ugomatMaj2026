-- Tier 7: marketplace, tenants, public API, webhooks (zad. 347, 348, 349, 350)

-- ============================================================================
-- TENANTS / MEMBERS / INVITATIONS — zad. 347
-- ============================================================================
CREATE TABLE IF NOT EXISTS tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kind TEXT NOT NULL CHECK (kind IN ('personal','family','company')),
  name TEXT NOT NULL,
  owner_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nip TEXT,
  regon TEXT,
  member_limit INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_tenants_owner ON tenants (owner_user_id);

CREATE TABLE IF NOT EXISTS tenant_members (
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner','admin','member','viewer','lawyer')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  invited_by_user_id UUID REFERENCES auth.users(id),
  PRIMARY KEY (tenant_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_tenant_members_user ON tenant_members (user_id);

CREATE TABLE IF NOT EXISTS tenant_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  invitee_email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin','member','viewer','lawyer')),
  invited_by_user_id UUID NOT NULL REFERENCES auth.users(id),
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_tenant_invites_email ON tenant_invitations (invitee_email) WHERE accepted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_tenant_invites_token ON tenant_invitations (token) WHERE accepted_at IS NULL;

ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_invitations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tenants_member_select ON tenants;
CREATE POLICY tenants_member_select ON tenants FOR SELECT USING (
  EXISTS (SELECT 1 FROM tenant_members tm WHERE tm.tenant_id = tenants.id AND tm.user_id = auth.uid())
);
DROP POLICY IF EXISTS tenants_owner_update ON tenants;
CREATE POLICY tenants_owner_update ON tenants FOR UPDATE USING (owner_user_id = auth.uid());

DROP POLICY IF EXISTS tenant_members_self_select ON tenant_members;
CREATE POLICY tenant_members_self_select ON tenant_members FOR SELECT USING (
  user_id = auth.uid()
  OR EXISTS (SELECT 1 FROM tenant_members tm WHERE tm.tenant_id = tenant_members.tenant_id AND tm.user_id = auth.uid())
);

-- ============================================================================
-- MARKETPLACE TEMPLATES — zad. 350
-- ============================================================================
CREATE TABLE IF NOT EXISTS marketplace_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES auth.users(id),
  author_display_name TEXT,
  case_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  body_markdown TEXT NOT NULL,
  tags TEXT[] NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('draft','submitted','in_review','approved','rejected','deprecated')),
  rating_avg NUMERIC(3,2),
  rating_count INT NOT NULL DEFAULT 0,
  usage_count INT NOT NULL DEFAULT 0,
  review_notes TEXT,
  reviewer_id UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_marketplace_status ON marketplace_templates (status, case_type);
CREATE INDEX IF NOT EXISTS idx_marketplace_popular ON marketplace_templates (usage_count DESC) WHERE status = 'approved';

CREATE TABLE IF NOT EXISTS marketplace_template_ratings (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  template_id UUID NOT NULL REFERENCES marketplace_templates(id) ON DELETE CASCADE,
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, template_id)
);

ALTER TABLE marketplace_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_template_ratings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS marketplace_public_read ON marketplace_templates;
CREATE POLICY marketplace_public_read ON marketplace_templates FOR SELECT USING (status = 'approved');
DROP POLICY IF EXISTS marketplace_author_manage ON marketplace_templates;
CREATE POLICY marketplace_author_manage ON marketplace_templates FOR ALL USING (author_id = auth.uid()) WITH CHECK (author_id = auth.uid());

DROP POLICY IF EXISTS marketplace_ratings_user ON marketplace_template_ratings;
CREATE POLICY marketplace_ratings_user ON marketplace_template_ratings FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- RPC: atomic usage_count increment
CREATE OR REPLACE FUNCTION increment_template_usage(p_template_id UUID)
RETURNS VOID
LANGUAGE SQL
AS $$
  UPDATE marketplace_templates SET usage_count = usage_count + 1, updated_at = NOW() WHERE id = p_template_id;
$$;

-- ============================================================================
-- ORGANIZATIONS + API KEYS + WEBHOOKS — zad. 348, 349
-- ============================================================================
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  nip TEXT,
  owner_user_id UUID NOT NULL REFERENCES auth.users(id),
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free','starter','pro','enterprise')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  key_prefix TEXT NOT NULL,
  key_hash TEXT NOT NULL UNIQUE,
  scopes TEXT[] NOT NULL,
  rate_limit_per_minute INT NOT NULL DEFAULT 60,
  revoked_at TIMESTAMPTZ,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_api_keys_org ON api_keys (organization_id) WHERE revoked_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_api_keys_hash ON api_keys (key_hash);

CREATE TABLE IF NOT EXISTS webhook_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  events TEXT[] NOT NULL,
  secret_hash TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  failure_count INT NOT NULL DEFAULT 0,
  last_delivery_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_webhook_subs_org ON webhook_subscriptions (organization_id) WHERE active;

-- Internal secret storage (encrypted at rest at infra layer)
CREATE TABLE IF NOT EXISTS webhook_secrets (
  subscription_id UUID PRIMARY KEY REFERENCES webhook_subscriptions(id) ON DELETE CASCADE,
  raw_secret TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS org_owner_select ON organizations;
CREATE POLICY org_owner_select ON organizations FOR SELECT USING (owner_user_id = auth.uid());
DROP POLICY IF EXISTS org_owner_modify ON organizations;
CREATE POLICY org_owner_modify ON organizations FOR ALL USING (owner_user_id = auth.uid()) WITH CHECK (owner_user_id = auth.uid());

DROP POLICY IF EXISTS api_keys_org_admin ON api_keys;
CREATE POLICY api_keys_org_admin ON api_keys FOR ALL USING (
  EXISTS (SELECT 1 FROM organizations o WHERE o.id = api_keys.organization_id AND o.owner_user_id = auth.uid())
);

DROP POLICY IF EXISTS webhook_subs_org_admin ON webhook_subscriptions;
CREATE POLICY webhook_subs_org_admin ON webhook_subscriptions FOR ALL USING (
  EXISTS (SELECT 1 FROM organizations o WHERE o.id = webhook_subscriptions.organization_id AND o.owner_user_id = auth.uid())
);
