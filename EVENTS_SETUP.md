# Events Database Setup

## Overview
Events are now stored in the Supabase database and fully integrated with the admin dashboard. Users can create, edit, delete, publish, and manage events through the dashboard interface.

## Setup Steps

### 1. Run Database Schema
Run `sql/events-schema.sql` in Supabase SQL Editor (after `sql/simple-schema.sql` and `sql/import-clubs.sql`):
- Creates the `events` table
- Sets up Row Level Security (RLS) policies
- Creates indexes for performance
- Adds automatic `updated_at` timestamp trigger

### 2. Database Schema Details

**Events Table:**
- `id` - UUID primary key
- `organization_id` - Links event to organization
- `title` - Event title
- `description` - Event description
- `date` - Event date (DATE)
- `time` - Event time (TIME)
- `location` - Optional location
- `category` - Event category
- `link_url` - Optional registration/info link
- `link_text` - Optional link button text
- `status` - 'draft' or 'published'
- `created_at` - Timestamp
- `updated_at` - Auto-updated timestamp
- `created_by` - User who created the event

**RLS Policies:**
- Published events are viewable by everyone
- Organizations can view all their events (including drafts)
- Organizations can create, update, and delete their own events

## Features

### Dashboard Integration
- ✅ Load events from database on dashboard load
- ✅ Create new events (single or recurring)
- ✅ Edit existing events
- ✅ Delete events
- ✅ Publish/unpublish events
- ✅ Bulk operations (publish, unpublish, delete, duplicate)
- ✅ Draft/Published status system

### Event Management
- **Create**: Save as draft or publish immediately
- **Edit**: Update any event details
- **Delete**: Remove events (with confirmation)
- **Duplicate**: Copy events as drafts
- **Recurring Events**: Create daily, weekly, or monthly recurring events

## About `src/data/events.js`

The `src/data/events.js` file has been commented out (test data is now disabled). The file still exports `eventCategories` which is used by:
- `src/pages/Events.jsx` - Public events page (for category filtering)
- `src/pages/Clubs.jsx` - Club details page (for related events display)

**Note**: The public Events page (`/events`) currently shows an empty list since test events are disabled. To show real events from the database, you'll need to update `Events.jsx` to fetch published events using `getPublishedEvents()` from `src/lib/events.js`.

## Testing

1. Sign in to the dashboard
2. Create a test event (save as draft)
3. Publish the event
4. Edit the event
5. Delete the event
6. Test recurring events
7. Test bulk operations

All events are now persisted in the database and will survive page refreshes!

