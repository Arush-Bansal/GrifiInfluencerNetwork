
import { Tables } from "@/integrations/supabase/types";
import { DashboardProfile } from "@/types/dashboard";


/**
 * Maps a raw Supabase profile row to a safe UI DashboardProfile
 */
export function mapToDashboardProfile(profile: Tables<"profiles"> | DashboardProfile | null | undefined): DashboardProfile {
  if (!profile) {
    return {
      id: "",
      username: "",
      full_name: "",
      avatar_url: "",
      bio: "",
      niche: "",
      platform: "",
      followers: "",
      engagement_rate: "",
      location: "",
      website: "",
      banner_url: "",
      service_brand: true,
      service_ugc: true,
      service_appearances: false,
      is_verified: false,
      page_visits: 0,
      email_copy_count: 0,
      insta_copy_count: 0,
      yt_copy_count: 0,
      twitter_copy_count: 0,
      services: [],
    };
  }

  return {
    id: profile.id,
    username: profile.username || "",
    full_name: profile.full_name || "",
    avatar_url: profile.avatar_url || "",
    bio: profile.bio || "",
    niche: profile.niche || "",
    platform: profile.platform || "",
    followers: profile.followers || "0",
    engagement_rate: profile.engagement_rate || "0",
    location: profile.location || "",
    website: profile.website || "",
    banner_url: profile.banner_url || "",
    service_brand: profile.service_brand ?? true,
    service_ugc: profile.service_ugc ?? true,
    service_appearances: profile.service_appearances ?? false,
    is_verified: profile.is_verified ?? false,
    youtube_url: profile.youtube_url || null,
    instagram_url: profile.instagram_url || null,
    twitter_url: profile.twitter_url || null,
    page_visits: profile.page_visits || 0,
    email_copy_count: profile.email_copy_count || 0,
    insta_copy_count: profile.insta_copy_count || 0,
    yt_copy_count: profile.yt_copy_count || 0,
    twitter_copy_count: profile.twitter_copy_count || 0,
    public_email: profile.public_email || null,
    services: profile.services || [],
  };
}
