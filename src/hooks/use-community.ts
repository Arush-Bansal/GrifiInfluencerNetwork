import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

export type CommunityPost = Database["public"]["Tables"]["community_posts"]["Row"] & {
  profiles: { username: string | null } | null;
};

export type CommunityMember = Database["public"]["Tables"]["community_members"]["Row"] & {
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

export function useUserCommunities(userId: string | undefined) {
  return useQuery({
    queryKey: ["user-communities", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("community_members")
        .select("community_id, communities:community_id(*)")
        .eq("user_id", userId as string);
      
      if (error) throw error;
      return (data || []).map((m: { communities: any }) => m.communities); // eslint-disable-line @typescript-eslint/no-explicit-any
    },
    enabled: !!userId,
  });
}

export function useSubmitCommunityPost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ communityId, authorId, content }: { communityId: string, authorId: string, content: string }) => {
      const { error } = await supabase
        .from("community_posts")
        .insert({
          community_id: communityId,
          author_id: authorId,
          content,
          status: 'pending'
        });
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["community-posts", variables.communityId, "pending"] });
    },
  });
}

export function useAllCommunities() {
  return useQuery({
    queryKey: ["all-communities"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("communities")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as unknown as any[]; // eslint-disable-line @typescript-eslint/no-explicit-any
    },
  });
}

export function useJoinCommunity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ communityId, userId }: { communityId: string, userId: string }) => {
      const { error } = await supabase
        .from("community_members")
        .insert({ community_id: communityId, user_id: userId, role: 'member' });
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["community-membership", variables.communityId, variables.userId] });
      queryClient.invalidateQueries({ queryKey: ["community-members", variables.communityId] });
    },
  });
}

export function useLeaveCommunity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ communityId, userId }: { communityId: string, userId: string }) => {
      const { error } = await supabase
        .from("community_members")
        .delete()
        .eq("community_id", communityId)
        .eq("user_id", userId);
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["community-membership", variables.communityId, variables.userId] });
      queryClient.invalidateQueries({ queryKey: ["community-members", variables.communityId] });
    },
  });
}

export function useFollowCommunity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ communityId, userId, follow }: { communityId: string, userId: string, follow: boolean }) => {
      if (follow) {
        const { error } = await supabase
          .from("community_followers")
          .insert({ community_id: communityId, user_id: userId });
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("community_followers")
          .delete()
          .eq("community_id", communityId)
          .eq("user_id", userId);
        if (error) throw error;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["community-follow", variables.communityId, variables.userId] });
    },
  });
}

export function useModerateCommunityPost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ postId, moderatorId, status }: { postId: string, communityId: string, status: 'approved' | 'rejected', moderatorId: string }) => {
      const { error } = await supabase
        .from("community_posts")
        .update({ status, moderated_by: moderatorId, moderated_at: new Date().toISOString() })
        .eq("id", postId);
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["community-posts", variables.communityId] });
    },
  });
}

export function useUpdateMemberRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ communityId, memberUserId, newRole }: { communityId: string, memberUserId: string, newRole: 'admin' | 'moderator' | 'member' }) => {
      const { error } = await supabase
        .from("community_members")
        .update({ role: newRole })
        .eq("community_id", communityId)
        .eq("user_id", memberUserId);
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["community-members", variables.communityId] });
      queryClient.invalidateQueries({ queryKey: ["community-membership", variables.communityId, variables.memberUserId] });
    },
  });
}

export function useCreateCommunity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ name, description, userId }: { name: string, description: string, userId: string }) => {
      // 1. Create the community
      const { data: community, error: communityError } = await supabase
        .from("communities")
        .insert({
          name: name.trim(),
          description: description.trim(),
          created_by: userId,
        })
        .select()
        .single();

      if (communityError) throw communityError;

      // 2. Add creator as admin
      const { error: memberError } = await supabase
        .from("community_members")
        .insert({
          community_id: community.id,
          user_id: userId,
          role: 'admin'
        });

      if (memberError) throw memberError;
      
      return community;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-communities"] });
    },
  });
}
