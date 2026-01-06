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
      // Fetch Personal Posts
      const { data, error } = await supabase
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

      if (error) throw error;

      // Type guard or explicit mapping helper can clarify this
      type RawPost = {
        id: string;
        content: string;
        image_url: string | null;
        created_at: string;
        author_id: string;
        profiles: { username: string | null; avatar_url: string | null } | null;
      };

      const personalPosts: FeedPost[] = (data as unknown as RawPost[]).map((p) => ({
        id: p.id,
        content: p.content,
        created_at: p.created_at,
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
