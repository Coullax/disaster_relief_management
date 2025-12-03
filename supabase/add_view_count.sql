-- Add view_count column to listings table
-- This tracks how many times each listing has been viewed

-- Add the column if it doesn't exist
ALTER TABLE public.listings 
ADD COLUMN IF NOT EXISTS view_count integer DEFAULT 0 NOT NULL;

-- Create an index on view_count for efficient sorting
CREATE INDEX IF NOT EXISTS idx_listings_view_count 
ON public.listings(view_count);

-- Function to increment view count
CREATE OR REPLACE FUNCTION increment_listing_view_count(listing_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE public.listings
  SET view_count = view_count + 1
  WHERE id = listing_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION increment_listing_view_count(uuid) TO anon, authenticated;
