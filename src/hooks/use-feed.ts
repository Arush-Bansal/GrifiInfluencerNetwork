import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface FeedPost {
  id: string;
  content: string;
  created_at: string;
  type?: 'community' | 'personal';
  community_id?: string;
  communities?: { name: string };
  profiles?: { username: string; avatar_url: string | null };
  author_id?: string;
  author_username?: string;
  author_avatar?: string;
  image_url?: string | null;
}

export function useFeed(userId: string) {
  return useQuery({
    queryKey: ["feed", userId],
    queryFn: async () => {
      // Fetch Personal Posts
      const { data: personalPostsRaw, error: personalPostsError } = await supabase
        .from("posts")
        .select(`
          id,
          content,
          image_url,
          created_at,
          author_id,
          profiles:author_id(username, avatar_url)
        `)
        .order("created_at", { ascending: false });

      if (personalPostsError) throw personalPostsError;

      const personalPosts: FeedPost[] = (personalPostsRaw as { 
        id: string; 
        content: string; 
        image_url: string | null; 
        created_at: string; 
        author_id: string; 
        profiles: { username: string | null; avatar_url: string | null } | null 
      }[]).map((p) => ({
        id: p.id,
        content: p.content,
        created_at: p.created_at,
        type: 'personal',
        author_id: p.author_id,
        author_username: p.profiles?.username || 'user',
        author_avatar: p.profiles?.avatar_url || undefined,
        image_url: p.image_url || undefined
      }));

      return personalPosts;
    },
    enabled: !!userId,
  });
}

export function useCommunityFeed(userId: string) {
  return useQuery({
    queryKey: ["community-feed", userId],
    queryFn: async () => {
      // 1. Get joined communities
      const { data: memberships } = await supabase
        .from("community_members")
        .select("community_id")
        .eq("user_id", userId);

      // 2. Get followed communities
      const { data: follows } = await supabase
        .from("community_followers")
        .select("community_id")
        .eq("user_id", userId);

      const communityIds = Array.from(new Set([
        ...((memberships as { community_id: string }[])?.map(m => m.community_id) || []),
        ...((follows as { community_id: string }[])?.map(f => f.community_id) || [])
      ]));

      if (communityIds.length === 0) return [];

      // 3. Get posts
      const { data, error } = await supabase
        .from("community_posts")
        .select(`
          id, 
          content, 
          image_url,
          created_at, 
          community_id,
          communities:community_id(name),
          profiles:author_id(username, avatar_url)
        `)
        .in("community_id", communityIds)
        .eq("status", "approved")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as unknown as FeedPost[];
    },
    enabled: !!userId,
  });
}
