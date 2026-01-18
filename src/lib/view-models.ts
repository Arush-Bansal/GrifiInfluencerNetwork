
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
  };
}
