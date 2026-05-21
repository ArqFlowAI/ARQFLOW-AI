-- ARQFLOW AI — Row Level Security Policies
-- Execute after Prisma migration on Supabase

ALTER TABLE IF EXISTS "Organization" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "User" ENABLE ROW LEVEL SECURITY;

-- Helper: get user's organization IDs
CREATE OR REPLACE FUNCTION auth_user_org_ids()
RETURNS SETOF TEXT AS $$
  SELECT "organizationId"::TEXT
  FROM "OrganizationMember"
  WHERE "userId" = (
    SELECT id FROM "User" WHERE "supabaseId" = auth.uid()::TEXT LIMIT 1
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Organization: members can read their orgs
CREATE POLICY "org_select_member" ON "Organization"
  FOR SELECT USING (id IN (SELECT auth_user_org_ids()));

CREATE POLICY "org_update_owner" ON "Organization"
  FOR UPDATE USING (
    id IN (
      SELECT om."organizationId" FROM "OrganizationMember" om
      JOIN "User" u ON u.id = om."userId"
      WHERE u."supabaseId" = auth.uid()::TEXT AND om.role IN ('OWNER', 'ADMIN')
    )
  );

-- Projects scoped to organization
CREATE POLICY "project_org_access" ON "Project"
  FOR ALL USING ("organizationId" IN (SELECT auth_user_org_ids()));

CREATE POLICY "concept_org_access" ON "Concept"
  FOR ALL USING ("organizationId" IN (SELECT auth_user_org_ids()));

CREATE POLICY "render_org_access" ON "Render"
  FOR ALL USING ("organizationId" IN (SELECT auth_user_org_ids()));

CREATE POLICY "budget_org_access" ON "Budget"
  FOR ALL USING ("organizationId" IN (SELECT auth_user_org_ids()));

CREATE POLICY "lead_org_access" ON "Lead"
  FOR ALL USING ("organizationId" IN (SELECT auth_user_org_ids()));

CREATE POLICY "automation_org_access" ON "Automation"
  FOR ALL USING ("organizationId" IN (SELECT auth_user_org_ids()));

-- Storage bucket policies (run in Supabase dashboard)
-- Bucket: renders — path: {orgId}/{userId}/{filename}
-- Bucket: budgets — path: {orgId}/{budgetId}.pdf
-- Bucket: avatars — path: {userId}/avatar
