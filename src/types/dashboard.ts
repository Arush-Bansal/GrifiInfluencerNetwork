
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
  // Add derived fields or specific types if needed
}
