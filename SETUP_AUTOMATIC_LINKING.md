# Automatic User Linking Setup

## Overview
This system automatically creates user profiles when users are created in Supabase Auth, and provides an admin interface to link them to organizations.

## Setup Steps

### 1. Run Database Schema
Run `sql/simple-schema.sql` in Supabase SQL Editor (if you haven't already):
- Creates `organizations` table
- Creates `user_profiles` table
- Sets up Row Level Security (RLS) policies

### 2. Import Organizations
Run `sql/import-clubs.sql` in Supabase SQL Editor:
- Imports all organizations from `clubs.js` into the database

### 3. Run Auto-Link Trigger
Run `sql/auto-link-users.sql` in Supabase SQL Editor:
- Creates a trigger that automatically creates a `user_profile` when a user is created in Supabase Auth
- This means you don't need to manually create profiles anymore!

## How It Works

### Automatic Profile Creation
1. **Create a user in Supabase Auth** (Dashboard → Authentication → Users → Add User)
2. **Profile is automatically created** - The trigger creates a `user_profile` entry with the user's email
3. **Organization is NULL** - The user needs to be linked to an organization

### Linking Users (Admin Interface)
1. **Sign in to the dashboard** as an admin
2. **Go to "Link Users" tab** in the dashboard
3. **See unlinked users** - All users without an organization are listed
4. **Select organization** - Choose which organization to link each user to
5. **Click "Link User"** - The user is now linked and can sign in!

## Manual Linking (Alternative)
If you prefer to link users manually via SQL, use `sql/LINK_USER_TO_CLUB.sql` (but the admin interface is much easier!).

## Notes
- Users must be linked to an organization before they can sign in
- The admin interface requires you to be signed in as a user who is already linked
- All authenticated users can view and link users (this is an admin tool)

