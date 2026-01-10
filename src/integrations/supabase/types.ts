
// This file acts as a clean interface for your application types.
// The raw database schema is in ./database.types.ts (do not edit that file manually).

import { Tables, TablesInsert, TablesUpdate } from './database.types';

export * from './database.types';

// --- Domain Entities ---

export type Profile = Tables<'profiles'>;
export type ProfileInsert = TablesInsert<'profiles'>;
export type ProfileUpdate = TablesUpdate<'profiles'>;

export type Post = Tables<'posts'>;
export type PostInsert = TablesInsert<'posts'>;
export type PostUpdate = TablesUpdate<'posts'>;

export type Follow = Tables<'follows'>;
export type FollowInsert = TablesInsert<'follows'>;
export type FollowUpdate = TablesUpdate<'follows'>;

export type Community = Tables<'communities'>;
export type CommunityInsert = TablesInsert<'communities'>;
export type CommunityUpdate = TablesUpdate<'communities'>;

export type CommunityMember = Tables<'community_members'>;
export type CommunityMemberInsert = TablesInsert<'community_members'>;
export type CommunityMemberUpdate = TablesUpdate<'community_members'>;

export type CommunityFollower = Tables<'community_followers'>;
export type CommunityPost = Tables<'community_posts'>;
export type CommunityPostInsert = TablesInsert<'community_posts'>;
export type CommunityPostUpdate = TablesUpdate<'community_posts'>;

export type CollabRequest = Tables<'collab_requests'>;
export type CollabRequestInsert = TablesInsert<'collab_requests'>;
export type CollabRequestUpdate = TablesUpdate<'collab_requests'>;

export type Message = Tables<'messages'>;
export type MessageInsert = TablesInsert<'messages'>;
export type MessageUpdate = TablesUpdate<'messages'>;

export type Campaign = Tables<'campaigns'>;
export type CampaignInsert = TablesInsert<'campaigns'>;
export type CampaignUpdate = TablesUpdate<'campaigns'>;

export type CampaignApplication = Tables<'campaign_applications'>;
export type CampaignApplicationInsert = TablesInsert<'campaign_applications'>;
export type CampaignApplicationUpdate = TablesUpdate<'campaign_applications'>;

export type FeaturedReel = Tables<'featured_reels'>;
export type FeaturedReelInsert = TablesInsert<'featured_reels'>;
export type FeaturedReelUpdate = TablesUpdate<'featured_reels'>;
