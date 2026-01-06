import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, updates, authUpdates }: { userId: string, updates: any, authUpdates?: any }) => { // eslint-disable-line @typescript-eslint/no-explicit-any
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
      return data as unknown as any[]; // eslint-disable-line @typescript-eslint/no-explicit-any
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

export function useUploadImage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ file, userId, bucket, type }: { file: File, userId: string, bucket: string, type: 'avatar' | 'banner' }) => {
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
