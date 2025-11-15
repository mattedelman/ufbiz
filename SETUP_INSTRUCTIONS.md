# Supabase Setup Instructions for UFbiz

## Step 1: Create Supabase Project

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in your project details:
   - Name: `ufbiz` (or your preferred name)
   - Database Password: (save this securely!)
   - Region: Choose closest to you
5. Wait for project to be created (takes ~2 minutes)

## Step 2: Get Your Supabase Credentials

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (under "Project URL")
   - **anon/public key** (under "Project API keys")

## Step 3: Set Up Environment Variables

1. Create a `.env` file in the root of your project (same level as `package.json`)
2. Add your Supabase credentials:

```env
VITE_SUPABASE_URL=your_project_url_here
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

**Example:**
```env
VITE_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Step 4: Create Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New Query"
3. Run the SQL files in this order (from the `sql/` folder):
   - `sql/simple-schema.sql` - Creates organizations and user_profiles tables
   - `sql/import-clubs.sql` - Imports all organizations from clubs.js
   - `sql/auto-link-users.sql` - Sets up automatic user profile creation
   - `sql/events-schema.sql` - Creates events table
4. For each file:
   - Copy and paste the entire contents
   - Click "Run" (or press Ctrl+Enter)
   - You should see "Success. No rows returned"

## Step 5: Create Your First User

### Option A: Using Supabase Dashboard

1. Go to **Authentication** → **Users** in your Supabase dashboard
2. Click "Add user" → "Create new user"
3. Enter:
   - Email: `admin@example.com` (or your email)
   - Password: (choose a secure password)
   - Auto Confirm User: ✅ (check this)
4. Click "Create user"
5. Copy the User ID (UUID)

### Option B: Using SQL (Alternative)

```sql
-- First, create the user in auth.users (this is usually done via Supabase Auth)
-- Then link them to an organization:

-- 1. Create an organization
INSERT INTO organizations (name, description, category, email)
VALUES ('Your Organization Name', 'Description here', ARRAY['Category'], 'email@example.com')
RETURNING id;

-- 2. Create user profile (replace USER_ID and ORGANIZATION_ID)
INSERT INTO user_profiles (id, email, organization_id, role)
VALUES ('USER_ID_FROM_AUTH', 'admin@example.com', 'ORGANIZATION_ID_FROM_ABOVE', 'admin');
```

## Step 6: Test the Connection

1. Restart your development server:
   ```bash
   npm run dev
   ```

2. Navigate to `/signin` in your app
3. Try signing in with the credentials you created
4. You should be redirected to the dashboard

## Troubleshooting

### "Missing Supabase environment variables" error
- Make sure your `.env` file is in the root directory
- Check that variable names start with `VITE_`
- Restart your dev server after creating/updating `.env`

### "Invalid email or password" error
- Make sure the user exists in Supabase Auth
- Check that the user profile is linked to an organization
- Verify RLS policies are set up correctly

### "No organization found" error
- Make sure you created a user profile linked to an organization
- Check the `user_profiles` table has a row with your user ID
- Verify the `organization_id` in `user_profiles` matches an organization

### RLS Policy Errors
- Make sure you ran the entire `supabase-schema.sql` file
- Check that RLS is enabled on all tables
- Verify policies are created correctly

## Next Steps

Once everything is working:

1. **Add more organizations**: Insert rows into the `organizations` table
2. **Create more admin users**: Add users via Supabase Auth, then link them to organizations
3. **Test event creation**: Create events through the dashboard
4. **Test publishing**: Publish events and verify they appear on the public Events page

## Security Notes

- The `anon` key is safe to use in the frontend (it's public)
- Never commit your `.env` file to git (it's already in `.gitignore`)
- Row Level Security (RLS) policies protect your data
- Users can only manage events for their own organization

