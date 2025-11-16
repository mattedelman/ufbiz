# Organization Editing Setup

This document explains how to set up the organization editing functionality that allows users to edit and save their organization's information.

## Database Setup

Before users can edit organization information, you need to run the SQL policy in Supabase to allow organizations to update their own data.

### Step 1: Run the SQL Policy

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Run the SQL from `sql/update-organization-policy.sql`:

```sql
-- Policy to allow organizations to update their own data
-- Users linked to an organization can update that organization's information

DROP POLICY IF EXISTS "Organizations can update their own data" ON organizations;

CREATE POLICY "Organizations can update their own data"
  ON organizations FOR UPDATE
  USING (
    id IN (
      SELECT organization_id 
      FROM user_profiles 
      WHERE id = auth.uid()
    )
  )
  WITH CHECK (
    id IN (
      SELECT organization_id 
      FROM user_profiles 
      WHERE id = auth.uid()
    )
  );
```

This policy ensures that:
- Only users who are linked to an organization can update that organization's data
- Users can only update the organization they belong to (via their `user_profiles.organization_id`)

## Features

Once set up, users can edit:
- **Description** - Text area for organization description
- **Categories** - Multi-select from available categories
- **Website** - Organization website URL
- **Email** - Contact email address
- **Photo** - Image URL (not file upload)

## How It Works

1. User clicks the organization profile button in the dashboard header
2. Modal opens showing current organization information
3. User clicks "Edit" button
4. Form fields become editable
5. User makes changes and clicks "Save"
6. Changes are saved to the database via `updateOrganization()` function
7. Success message is displayed
8. Organization data is refreshed in the dashboard

## Backend Function

The `updateOrganization()` function in `src/lib/admin.js` handles the database update:

```javascript
export async function updateOrganization(organizationId, organizationData) {
  const { data, error } = await supabase
    .from('organizations')
    .update({
      description: organizationData.description || null,
      category: organizationData.category || null,
      website: organizationData.website || null,
      email: organizationData.email || null,
      image: organizationData.image || null
    })
    .eq('id', organizationId)
    .select()
    .single()

  if (error) {
    console.error('Update organization error:', error)
    throw error
  }
  return data
}
```

## Security

The Row Level Security (RLS) policy ensures that:
- Only authenticated users can update organizations
- Users can only update organizations they are linked to
- The policy checks both `USING` (for SELECT) and `WITH CHECK` (for INSERT/UPDATE) clauses

## Testing

After setting up the policy:
1. Log in as a user linked to an organization
2. Go to the dashboard
3. Click on the organization profile button
4. Click "Edit"
5. Make some changes
6. Click "Save"
7. Verify the changes are saved and displayed

If you get a permission error, make sure:
- The SQL policy has been run in Supabase
- The user is properly linked to an organization in the `user_profiles` table
- The organization ID matches between `user_profiles.organization_id` and `organizations.id`

