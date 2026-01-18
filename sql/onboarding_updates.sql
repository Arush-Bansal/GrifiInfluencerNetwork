-- Add services column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS services text[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_completed boolean DEFAULT false;

-- Optional: Migrate existing boolean flags to the services array if desired
-- UPDATE profiles 
-- SET services = array_remove(ARRAY[
--   CASE WHEN service_brand THEN 'Brand Partnerships' END,
--   CASE WHEN service_ugc THEN 'UGC Creation' END,
--   CASE WHEN service_appearances THEN 'Performances' END
-- ], NULL)
-- WHERE services IS NULL;
