import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useProfile(username: string) {
  return useQuery({
    queryKey: ["profile", username],
    queryFn: async () => {
      if (!username) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("username", username)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!username,
  });
}

export function useUserPosts(userId?: string) {
  return useQuery({
    queryKey: ["user-posts", userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from("posts" as any)
        .select("*")
        .eq("author_id", userId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
}

export function useFollowStatus(followerId?: string, followingId?: string) {
  return useQuery({
    queryKey: ["follow-status", followerId, followingId],
    queryFn: async () => {
      if (!followerId || !followingId) return false;
      const { data, error } = await supabase
        .from("follows" as any)
        .select("id")
        .eq("follower_id", followerId)
        .eq("following_id", followingId)
        .maybeSingle();
      if (error) throw error;
      return !!data;
    },
    enabled: !!followerId && !!followingId,
  });
}
