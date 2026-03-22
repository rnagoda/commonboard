-- Reset and rebuild schema
-- Safe to run on a fresh project with no production data

-- Drop tables (order matters due to foreign keys)
DROP TABLE IF EXISTS emergency_alert_organizations CASCADE;
DROP TABLE IF EXISTS org_claims CASCADE;
DROP TABLE IF EXISTS user_follows CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;
DROP TABLE IF EXISTS category_shortcuts CASCADE;
DROP TABLE IF EXISTS emergency_alerts CASCADE;
DROP TABLE IF EXISTS org_updates CASCADE;
DROP TABLE IF EXISTS organization_categories CASCADE;
DROP TABLE IF EXISTS organizations CASCADE;
DROP TABLE IF EXISTS categories CASCADE;

-- Drop enums
DROP TYPE IF EXISTS org_status CASCADE;
DROP TYPE IF EXISTS org_update_type CASCADE;
DROP TYPE IF EXISTS alert_severity CASCADE;
DROP TYPE IF EXISTS alert_urgency CASCADE;
DROP TYPE IF EXISTS alert_source CASCADE;
DROP TYPE IF EXISTS claim_status CASCADE;
DROP TYPE IF EXISTS location_level CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS update_updated_at CASCADE;
DROP FUNCTION IF EXISTS get_org_follower_count CASCADE;
