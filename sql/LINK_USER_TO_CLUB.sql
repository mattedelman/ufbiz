-- How to Link a User to a Club/Organization
-- ⚠️ IMPORTANT: You MUST replace the placeholders below with actual values!

-- ============================================
-- STEP 1: Find Your User ID
-- ============================================
-- Run this query first to see all users and their IDs:
SELECT id, email, created_at 
FROM auth.users 
ORDER BY created_at DESC;

-- Copy the UUID (id) of the user you want to link
-- Example UUID format: a99f7050-d188-4565-9b5d-595bafb30399

-- ============================================
-- STEP 2: Find Your Organization ID
-- ============================================
-- Run this query to see all organizations:
SELECT id, name FROM organizations ORDER BY name;

-- Copy the UUID (id) of the organization you want to link the user to
-- Or note the organization name to use in the query below

-- ============================================
-- STEP 3: Link User to Organization
-- ============================================
-- ⚠️⚠️⚠️ STOP! DO NOT RUN THIS YET! ⚠️⚠️⚠️
-- You MUST replace the placeholder values below with REAL data from Steps 1 & 2!
-- 
-- Example of what it should look like AFTER you replace the values:
-- INSERT INTO user_profiles (id, email, organization_id)
-- VALUES (
--   'a99f7050-d188-4565-9b5d-595bafb30399',  -- Real UUID from Step 1
--   'admin@algogators.com',  -- Real email address
--   (SELECT id FROM organizations WHERE name = 'AlgoGators Investment Fund' LIMIT 1)  -- Real org name
-- )
-- ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, organization_id = EXCLUDED.organization_id;

-- Option A: Link using organization name (RECOMMENDED - easier)
-- ⚠️ STEP 1: Uncomment the block below (remove /* and */)
-- ⚠️ STEP 2: Replace the 3 placeholder values with your actual data
-- ⚠️ STEP 3: Then run it

/*
INSERT INTO user_profiles (id, email, organization_id)
VALUES (
  'PASTE_USER_UUID_HERE',  -- ⚠️ Replace: Copy UUID from Step 1 above (e.g., 'a99f7050-d188-4565-9b5d-595bafb30399')
  'PASTE_EMAIL_HERE',  -- ⚠️ Replace: User's email (e.g., 'admin@example.com')
  (SELECT id FROM organizations WHERE name = 'PASTE_ORG_NAME_HERE' LIMIT 1)  -- ⚠️ Replace: Org name from Step 2 (e.g., 'AlgoGators Investment Fund')
)
ON CONFLICT (id) DO UPDATE
SET 
  email = EXCLUDED.email,
  organization_id = EXCLUDED.organization_id;
*/

-- If Option A doesn't work, use Option B below (comment out Option A first):
-- Option B: Link using organization UUID
-- INSERT INTO user_profiles (id, email, organization_id)
-- VALUES (
--   'YOUR_USER_UUID_FROM_STEP_1',  -- ⚠️ Replace: User UUID from Step 1
--   'user@example.com',  -- ⚠️ Replace: User's actual email
--   'YOUR_ORG_UUID_FROM_STEP_2'  -- ⚠️ Replace: Organization UUID from Step 2
-- )
-- ON CONFLICT (id) DO UPDATE
-- SET 
--   email = EXCLUDED.email,
--   organization_id = EXCLUDED.organization_id;

-- ============================================
-- VERIFY: Check if user is linked
-- ============================================
-- Run this to see all linked users:
-- SELECT 
--   up.id as user_id,
--   up.email,
--   o.name as organization_name,
--   o.id as organization_id
-- FROM user_profiles up
-- LEFT JOIN organizations o ON up.organization_id = o.id
-- ORDER BY o.name;

