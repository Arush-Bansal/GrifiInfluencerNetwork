import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TablesUpdate } from "@/integrations/supabase/types";

type ProfileUpdate = TablesUpdate<"profiles">;

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ 
      userId, 
      updates, 
      authUpdates 
    }: { 
      userId: string, 
      updates: ProfileUpdate, 
      authUpdates?: Record<string, unknown> 
    }) => {
      // Update auth metadata if provided
      if (authUpdates) {
        const { error: authError } = await supabase.auth.updateUser({
          data: authUpdates
        });
        if (authError) throw authError;
      }

      // Update profiles table
      const { error } = await supabase
        .from("profiles")
        .upsert({
          id: userId,
          ...updates,
          updated_at: new Date().toISOString(),
        });
      
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["viewer-profile", variables.userId] });
      queryClient.invalidateQueries({ queryKey: ["profile", variables.updates.username] });
    },
  });
}

export function useCheckUsername(username: string, currentUsername?: string) {
  return useQuery({
    queryKey: ["check-username", username],
    queryFn: async () => {
      if (!username || username.length < 3 || username === currentUsername) {
        return { available: true };
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("username")
        .eq("username", username)
        .maybeSingle();

      if (error) throw error;
      return { available: !data };
    },
    enabled: !!username && username.length >= 3 && username !== currentUsername,
  });
}

export function useProfile(username: string | undefined) {
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

export function useUserPosts(userId: string | undefined) {
  return useQuery({
    queryKey: ["user-posts", userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from("posts")
        .select("*, profiles(username, full_name, avatar_url)")
        .eq("author_id", userId)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
}

export function useFollowStatus(followerId: string | undefined, followingId: string | undefined) {
  return useQuery({
    queryKey: ["follow-status", followerId, followingId],
    queryFn: async () => {
      if (!followerId || !followingId) return false;
      const { data, error } = await supabase
        .from("follows")
        .select("*")
        .eq("follower_id", followerId)
        .eq("following_id", followingId)
        .maybeSingle();
      
      if (error) throw error;
      return !!data;
    },
    enabled: !!followerId && !!followingId,
  });
}

export function useConnectionStatus(userId1: string | undefined, userId2: string | undefined) {
  return useQuery({
    queryKey: ["connection-status", userId1, userId2],
    queryFn: async () => {
      if (!userId1 || !userId2) return null;
      console.log("Checking connection status between:", userId1, userId2);
      
      const { data, error } = await supabase
        .from("collab_requests")
        .select("status, created_at")
        .or(`sender_id.eq.${userId1},receiver_id.eq.${userId1}`)
        .or(`sender_id.eq.${userId2},receiver_id.eq.${userId2}`)
        .order("created_at", { ascending: false })
        .limit(1);
      
      if (error) {
        console.error("Error fetching connection status:", error);
        return null;
      }
      
      const status = data?.[0]?.status || null;
      console.log("Found connection status:", status);
      return status;
    },
    enabled: !!userId1 && !!userId2,
  });
}

export function useUploadImage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ file, userId, bucket, type }: { file: File, userId: string, bucket: string, type: string }) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${type}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${userId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);
      
      return { publicUrl, type };
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["viewer-profile", variables.userId] });
    },
  });
}

export function useFeaturedReels(userId: string | undefined) {
  return useQuery({
    queryKey: ["featured-reels", userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from("featured_reels")
        .select("*")
        .eq("profile_id", userId)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
}

export function useManageFeaturedReels() {
  const queryClient = useQueryClient();
  
  const addReel = useMutation({
    mutationFn: async ({ profileId, videoUrl, title, thumbnailUrl }: { profileId: string, videoUrl: string, title?: string, thumbnailUrl?: string }) => {
      const { data, error } = await supabase
        .from("featured_reels")
        .insert({
          profile_id: profileId,
          video_url: videoUrl,
          title: title,
          thumbnail_url: thumbnailUrl
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["featured-reels", variables.profileId] });
    },
  });

  const deleteReel = useMutation({
    mutationFn: async ({ reelId }: { reelId: string, profileId: string }) => {
      const { error } = await supabase
        .from("featured_reels")
        .delete()
        .eq("id", reelId);
      
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["featured-reels", variables.profileId] });
    },
  });

  return { addReel, deleteReel };
}

export function usePastCollaborations(userId: string | undefined) {
  return useQuery({
    queryKey: ["past-collaborations", userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from("past_collaborations")
        .select("*")
        .eq("profile_id", userId)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
}

export function useManagePastCollaborations() {
  const queryClient = useQueryClient();
  
  const addCollaboration = useMutation({
    mutationFn: async ({ profileId, brandName, brandLogoUrl }: { profileId: string, brandName: string, brandLogoUrl?: string }) => {
      const { data, error } = await supabase
        .from("past_collaborations")
        .insert({
          profile_id: profileId,
          brand_name: brandName,
          brand_logo_url: brandLogoUrl
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["past-collaborations", variables.profileId] });
    },
  });

  const deleteCollaboration = useMutation({
    mutationFn: async ({ collabId }: { collabId: string, profileId: string }) => {
      const { error } = await supabase
        .from("past_collaborations")
        .delete()
        .eq("id", collabId);
      
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["past-collaborations", variables.profileId] });
    },
  });

  return { addCollaboration, deleteCollaboration };
}
export function useIncrementStat() {
  return useMutation({
    mutationFn: async ({ profileId, stat }: { profileId: string, stat: 'page_visits' | 'email_copy_count' | 'insta_copy_count' | 'yt_copy_count' | 'twitter_copy_count' }) => {
      const { error } = await (supabase as unknown as { rpc: (name: string, args: Record<string, unknown>) => Promise<{ error: Error | null }> }).rpc('increment_profile_stat', {
        profile_id: profileId,
        stat_column: stat
      });
      
      if (error) {
        console.error("Increment error:", error);
      }
    }
  });
}
