-- Add analytics columns to profiles table for rebranding
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS page_visits INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS email_copy_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS insta_copy_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS yt_copy_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS twitter_copy_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS public_email TEXT;

-- Comment for clarity
COMMENT ON COLUMN profiles.page_visits IS 'Count of visits to the user public profile page';
COMMENT ON COLUMN profiles.email_copy_count IS 'Count of times the email address was copied';
COMMENT ON COLUMN profiles.insta_copy_count IS 'Count of times the Instagram link was copied';
COMMENT ON COLUMN profiles.yt_copy_count IS 'Count of times the YouTube link was copied';
COMMENT ON COLUMN profiles.twitter_copy_count IS 'Count of times the Twitter link was copied';

-- RPC to increment stats safely
CREATE OR REPLACE FUNCTION increment_profile_stat(profile_id UUID, stat_column TEXT)
RETURNS VOID AS $$
BEGIN
  EXECUTE format('UPDATE profiles SET %I = COALESCE(%I, 0) + 1 WHERE id = %L', stat_column, stat_column, profile_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
