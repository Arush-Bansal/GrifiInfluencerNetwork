-- Function to delete the current user's account and all associated data
-- This is intended for developer mode use only.
CREATE OR REPLACE FUNCTION delete_own_user()
RETURNS void AS $$
DECLARE
  current_user_id uuid;
BEGIN
  current_user_id := auth.uid();
  
  -- Manual cleanup of related records to avoid FK constraint violations
  -- We delete from all 'public' tables that might reference the user before deleting from auth.users.
  DELETE FROM public.campaign_applications WHERE influencer_id = current_user_id;
  DELETE FROM public.campaigns WHERE brand_id = current_user_id;
  DELETE FROM public.collab_requests WHERE sender_id = current_user_id OR receiver_id = current_user_id;
  DELETE FROM public.featured_reels WHERE profile_id = current_user_id;
  DELETE FROM public.follows WHERE follower_id = current_user_id OR following_id = current_user_id;
  DELETE FROM public.messages WHERE sender_id = current_user_id OR receiver_id = current_user_id OR curr_user_id = current_user_id;
  DELETE FROM public.past_collaborations WHERE profile_id = current_user_id;
  DELETE FROM public.posts WHERE author_id = current_user_id;
  DELETE FROM public.profiles WHERE id = current_user_id;
  
  -- Finally delete from auth.users
  DELETE FROM auth.users WHERE id = current_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant access to authenticated users
GRANT EXECUTE ON FUNCTION delete_own_user() TO authenticated;
