# View Count Feature - Migration Instructions

## Overview
This migration adds a view count tracking system to ensure fair visibility for all listings. Listings with fewer views appear first, helping those who need help get equal attention.

## Database Migration

You need to run the SQL migration to add the `view_count` column to your database.

### Option 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Click on "SQL Editor" in the left sidebar
3. Create a new query
4. Copy and paste the contents of `supabase/add_view_count.sql`
5. Click "Run" to execute the migration

### Option 2: Using Supabase CLI

If you have Supabase CLI installed:

```bash
# Make sure you're logged in
supabase login

# Link your project (if not already linked)
supabase link --project-ref your-project-ref

# Run the migration
supabase db push
```

Or directly execute the SQL file:

```bash
supabase db execute -f supabase/add_view_count.sql
```

## What the Migration Does

1. **Adds `view_count` column** - Tracks how many times each listing has been viewed
2. **Creates an index** - Optimizes sorting by view count
3. **Creates a function** - `increment_listing_view_count(uuid)` to safely increment the count
4. **Sets default value** - All existing listings start with view_count = 0

## How It Works

### Algorithm: Fair Visibility System

**The Problem**: In disaster relief scenarios, newer listings often get more attention while older (but still valid) listings get buried.

**The Solution**: View count-based sorting

1. **Primary Sort**: By `view_count` (ascending) - lowest view count first
2. **Secondary Sort**: By `created_at` (descending) - newest first among equal view counts

**Example**:
- Listing A: 0 views (created yesterday) → Position 1
- Listing B: 0 views (created today) → Position 2  
- Listing C: 5 views (created last week) → Position 3
- Listing D: 10 views (created today) → Position 4

**Benefits**:
- ✅ Every listing gets fair visibility
- ✅ Less-viewed items automatically move to the top
- ✅ Self-balancing system - popular items don't monopolize attention
- ✅ Encourages users to explore different listings

### When View Count Increments

The view count increases by 1 when:
- A user clicks on a listing card and views the detail page
- The page fully loads (component mounts)

The view count does NOT increase when:
- Just browsing the listing cards on the home page
- Reloading the same listing page (each page view counts)

## Features Implemented

### 1. Tabs for Filtering
- **All Listings** - Shows everything
- **Request Help** - Shows only "need" listings
- **Offer Help** - Shows only "offer" listings

### 2. View Count Display
- Small badge showing 👁️ {count} on each listing card
- Only shows if view_count > 0

### 3. Automatic Sorting
- Listings with 0 views always appear first
- Among 0-view listings, newest appear first
- Higher view count listings gradually move down

### 4. User Feedback
- Info badge on homepage: "📊 Listings with fewer views appear first to ensure fair visibility"
- Shows "Showing X of Y listings" counter

## Testing

After running the migration, you can test:

1. **View the home page** - All listings should load normally
2. **Click the tabs** - Filter between All/Request Help/Offer Help
3. **Click a listing** - View the detail page
4. **Go back to home** - The view count should increment
5. **Create new listing** - It should appear at the top (0 views)

## Troubleshooting

### Error: "function increment_listing_view_count does not exist"
- The SQL migration hasn't been run yet
- Run the migration using one of the methods above

### View count not incrementing
- Check browser console for errors
- Verify the function was created successfully in Supabase dashboard
- Check RPC permissions (anon and authenticated should have EXECUTE permission)

### Listings not sorting correctly
- Check if the index was created: `idx_listings_view_count`
- Verify `view_count` column exists and has default value 0
- Check Supabase logs for query errors

## Files Modified

- ✅ `supabase/add_view_count.sql` - New migration file
- ✅ `types/database.types.ts` - Added view_count to types
- ✅ `lib/actions/listings.ts` - Added sorting and increment function
- ✅ `components/listing-type-tabs.tsx` - New tabs component
- ✅ `components/listing-card.tsx` - Added view count badge
- ✅ `app/page.tsx` - Added tabs and info badge
- ✅ `app/listings/[id]/page.tsx` - Auto-increment on view

## Next Steps

1. Run the SQL migration
2. Test the features in your browser
3. Monitor view counts to ensure the system is working
4. Optional: Add analytics to track how view counts affect engagement
