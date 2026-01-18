
// UI-friendly profile type
export interface DashboardProfile {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string;
  bio: string;
  niche: string;
  platform: string;
  followers: string;
  engagement_rate: string;
  location: string;
  website: string;
  banner_url: string;
  service_brand: boolean;
  service_ugc: boolean;
  service_appearances: boolean;
  is_verified: boolean;
  youtube_url?: string | null;
  instagram_url?: string | null;
  twitter_url?: string | null;
  page_visits?: number;
  email_copy_count?: number;
  insta_copy_count?: number;
  yt_copy_count?: number;
  twitter_copy_count?: number;
  public_email?: string | null;
  services?: string[] | null;
}

export interface FeaturedReel {
  id: string;
  profile_id: string;
  video_url: string;
  thumbnail_url: string | null;
  title: string | null;
  created_at: string | null;
}

export interface PastCollaboration {
  id: string;
  profile_id: string;
  brand_name: string;
  brand_logo_url: string | null;
  created_at: string | null;
}
