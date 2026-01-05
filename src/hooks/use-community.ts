import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

type CommunityPost = Database["public"]["Tables"]["community_posts"]["Row"] & {
  profiles: { username: string | null } | null;
};

type CommunityMember = Database["public"]["Tables"]["community_members"]["Row"] & {
  profiles: { username: string | null } | null;
};

export function useCommunity(communityId: string) {
  return useQuery({
    queryKey: ["community", communityId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("communities")
        .select("*")
        .eq("id", communityId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!communityId,
  });
}

export function useCommunityPosts(communityId: string, status: 'approved' | 'pending' = 'approved') {
  return useQuery({
    queryKey: ["community-posts", communityId, status],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("community_posts")
        .select("*, profiles:author_id(username)")
        .eq("community_id", communityId)
        .eq("status", status)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as unknown as CommunityPost[];
    },
    enabled: !!communityId,
  });
}

export function useCommunityMembers(communityId: string) {
  return useQuery({
    queryKey: ["community-members", communityId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("community_members")
        .select("*, profiles:user_id(username)")
        .eq("community_id", communityId);
      if (error) throw error;
      return data as unknown as CommunityMember[];
    },
    enabled: !!communityId,
  });
}

export function useUserMembership(communityId: string, userId?: string) {
  return useQuery({
    queryKey: ["community-membership", communityId, userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data, error } = await supabase
        .from("community_members")
        .select("*")
        .eq("community_id", communityId)
        .eq("user_id", userId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!communityId && !!userId,
  });
}

export function useUserFollowStatus(communityId: string, userId?: string) {
  return useQuery({
    queryKey: ["community-follow", communityId, userId],
    queryFn: async () => {
      if (!userId) return false;
      const { data, error } = await supabase
        .from("community_followers")
        .select("*")
        .eq("community_id", communityId)
        .eq("user_id", userId)
        .maybeSingle();
      if (error) throw error;
      return !!data;
    },
    enabled: !!communityId && !!userId,
  });
}
