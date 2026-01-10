import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface FeedPost {
  id: string;
  content: string;
  created_at: string;
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
      try {
        // 1. Get IDs of people I follow
        const { data: followsData } = await supabase
          .from("follows")
          .select("following_id")
          .eq("follower_id", userId);
        
        const followedIds = (followsData || []).map(f => f.following_id);
        
        // 2. Get IDs of my connection (accepted collaborations)
        const { data: collabsData } = await supabase
          .from("collab_requests")
          .select("sender_id, receiver_id")
          .eq("status", "accepted")
          .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`);
        
        const connectionIds = (collabsData || []).map(c => 
          c.sender_id === userId ? c.receiver_id : c.sender_id
        );

        // All IDs we are allowed to see: self + followed + connected
        const allowedAuthorIds = [...new Set([userId, ...followedIds, ...connectionIds])].filter(Boolean);

        if (allowedAuthorIds.length === 0) return [];

        // 3. Fetch posts from these specific users
        const { data, error } = await supabase
          .from("posts")
          .select(`
            id,
            content,
            image_url,
            created_at,
            author_id,
            author:author_id(username, avatar_url)
          `)
          .in("author_id", allowedAuthorIds)
          .order("created_at", { ascending: false })
          .limit(25);

        if (error) {
          console.error("Feed query error:", error.message || error);
          // Fallback: Fetch without profile join
          const { data: fallbackData } = await supabase
            .from("posts")
            .select("id, content, image_url, created_at, author_id")
            .in("author_id", allowedAuthorIds)
            .order("created_at", { ascending: false })
            .limit(25);
          
          return (fallbackData || []).map(p => ({
            ...p,
            author_username: 'user',
            author_avatar: undefined
          })) as FeedPost[];
        }

        return (data || []).map((p: any) => ({
          id: p.id,
          content: p.content,
          created_at: p.created_at,
          author_id: p.author_id,
          author_username: p.author?.username || 'user',
          author_avatar: p.author?.avatar_url || undefined,
          image_url: p.image_url || undefined
        })) as FeedPost[];
      } catch (err) {
        console.error("Feed error:", err);
        return []; // Return empty array on error to break loop
      }
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });
}
