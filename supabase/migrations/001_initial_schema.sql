-- CommonBoard Initial Schema
-- Run this in the Supabase SQL Editor

-- =============================================================================
-- ENUMS
-- =============================================================================

CREATE TYPE org_status AS ENUM ('active', 'inactive', 'pending');
CREATE TYPE org_update_type AS ENUM ('general', 'capacity', 'closure', 'hours_change');
CREATE TYPE alert_severity AS ENUM ('extreme', 'severe', 'moderate', 'minor');
CREATE TYPE alert_urgency AS ENUM ('immediate', 'expected', 'future');
CREATE TYPE alert_source AS ENUM ('nws', 'fema', 'colorado_oem', 'county');
CREATE TYPE claim_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE location_level AS ENUM ('county', 'city', 'zip', 'gps');

-- =============================================================================
-- CATEGORIES
-- =============================================================================

CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed initial categories
INSERT INTO categories (name, slug, display_order) VALUES
  ('Food Assistance', 'food-assistance', 1),
  ('Housing', 'housing', 2),
  ('Shelters', 'shelters', 3),
  ('Legal Aid', 'legal-aid', 4),
  ('Emergency / Disaster', 'emergency-disaster', 5),
  ('Health & Mental Health', 'health-mental-health', 6),
  ('Volunteer Opportunities', 'volunteer', 7),
  ('Financial Assistance', 'financial-assistance', 8),
  ('Transportation', 'transportation', 9),
  ('Education & Job Training', 'education-job-training', 10),
  ('Childcare & Family Services', 'childcare-family', 11),
  ('Substance Use & Recovery', 'substance-use-recovery', 12);

-- =============================================================================
-- ORGANIZATIONS
-- =============================================================================

CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  slug TEXT NOT NULL UNIQUE,
  address TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  service_area JSONB, -- { counties: [], cities: [], zips: [] }
  hours JSONB, -- structured hours per day
  timezone TEXT NOT NULL DEFAULT 'America/Denver',
  phone TEXT,
  email TEXT,
  website TEXT,
  languages_served TEXT[] NOT NULL DEFAULT '{English}',
  eligibility_criteria TEXT,
  target_audience TEXT[] NOT NULL DEFAULT '{general}',
  services TEXT[] NOT NULL DEFAULT '{}',
  status org_status NOT NULL DEFAULT 'pending',
  claimed BOOLEAN NOT NULL DEFAULT false,
  claimed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  last_verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_organizations_status ON organizations(status);
CREATE INDEX idx_organizations_slug ON organizations(slug);

-- =============================================================================
-- ORGANIZATION <-> CATEGORY (many-to-many)
-- =============================================================================

CREATE TABLE organization_categories (
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (organization_id, category_id)
);

CREATE INDEX idx_org_categories_category ON organization_categories(category_id);

-- =============================================================================
-- ORG UPDATES
-- =============================================================================

CREATE TABLE org_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL DEFAULT '',
  type org_update_type NOT NULL DEFAULT 'general',
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_org_updates_org ON org_updates(organization_id);
CREATE INDEX idx_org_updates_pinned ON org_updates(is_pinned) WHERE is_pinned = true;
CREATE INDEX idx_org_updates_created ON org_updates(created_at DESC);

-- =============================================================================
-- EMERGENCY ALERTS (Tier 1)
-- =============================================================================

CREATE TABLE emergency_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source alert_source NOT NULL,
  external_id TEXT,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  severity alert_severity NOT NULL,
  urgency alert_urgency NOT NULL,
  affected_area JSONB, -- { counties: [], zips: [], geometry: {} }
  active_from TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_emergency_alerts_external ON emergency_alerts(source, external_id)
  WHERE external_id IS NOT NULL;
CREATE INDEX idx_emergency_alerts_active ON emergency_alerts(active_from, expires_at);

-- =============================================================================
-- CATEGORY SHORTCUTS (Tier 3)
-- =============================================================================

CREATE TABLE category_shortcuts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trigger_phrase TEXT NOT NULL,
  display_label TEXT NOT NULL,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  additional_filters JSONB,
  priority_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed initial shortcuts
INSERT INTO category_shortcuts (trigger_phrase, display_label, category_id, priority_order) VALUES
  ('I see smoke', 'Fire & Smoke Resources',
    (SELECT id FROM categories WHERE slug = 'emergency-disaster'), 1),
  ('I need food tonight', 'Food Assistance Now',
    (SELECT id FROM categories WHERE slug = 'food-assistance'), 2),
  ('I need a place to stay', 'Shelters & Housing',
    (SELECT id FROM categories WHERE slug = 'shelters'), 3),
  ('I''m in danger', 'Emergency & Safety Resources',
    (SELECT id FROM categories WHERE slug = 'emergency-disaster'), 4),
  ('I need legal help', 'Legal Aid',
    (SELECT id FROM categories WHERE slug = 'legal-aid'), 5);

-- =============================================================================
-- USER PROFILES (extends Supabase auth.users)
-- =============================================================================

CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  location_preference_level location_level,
  location_preference_value TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================================================
-- USER FOLLOWS
-- =============================================================================

CREATE TABLE user_follows (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, organization_id)
);

CREATE INDEX idx_user_follows_org ON user_follows(organization_id);

-- =============================================================================
-- ORG CLAIMS
-- =============================================================================

CREATE TABLE org_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status claim_status NOT NULL DEFAULT 'pending',
  evidence TEXT NOT NULL DEFAULT '',
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMPTZ
);

CREATE INDEX idx_org_claims_status ON org_claims(status) WHERE status = 'pending';

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

-- Organizations: publicly readable, only admins and claiming org reps can modify
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Organizations are publicly readable"
  ON organizations FOR SELECT
  USING (true);

CREATE POLICY "Org reps can update their claimed orgs"
  ON organizations FOR UPDATE
  USING (auth.uid() = claimed_by);

-- Categories: publicly readable
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Categories are publicly readable"
  ON categories FOR SELECT
  USING (true);

-- Organization categories: publicly readable
ALTER TABLE organization_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org categories are publicly readable"
  ON organization_categories FOR SELECT
  USING (true);

-- Org updates: publicly readable, org reps can insert for their orgs
ALTER TABLE org_updates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org updates are publicly readable"
  ON org_updates FOR SELECT
  USING (true);

CREATE POLICY "Org reps can create updates for their orgs"
  ON org_updates FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM organizations
      WHERE id = organization_id
      AND claimed_by = auth.uid()
    )
  );

-- Emergency alerts: publicly readable
ALTER TABLE emergency_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Emergency alerts are publicly readable"
  ON emergency_alerts FOR SELECT
  USING (true);

-- Category shortcuts: publicly readable
ALTER TABLE category_shortcuts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Category shortcuts are publicly readable"
  ON category_shortcuts FOR SELECT
  USING (true);

-- User profiles: users can read/update their own
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- User follows: users manage their own, org follower counts are public
ALTER TABLE user_follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own follows"
  ON user_follows FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can follow orgs"
  ON user_follows FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unfollow orgs"
  ON user_follows FOR DELETE
  USING (auth.uid() = user_id);

-- Org claims: users can read/create their own
ALTER TABLE org_claims ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own claims"
  ON org_claims FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can submit claims"
  ON org_claims FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- =============================================================================
-- FUNCTIONS
-- =============================================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Get follower count for an org (public, doesn't expose who follows)
CREATE OR REPLACE FUNCTION get_org_follower_count(org_id UUID)
RETURNS BIGINT AS $$
  SELECT count(*) FROM user_follows WHERE organization_id = org_id;
$$ LANGUAGE sql SECURITY DEFINER;
