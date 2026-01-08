import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface Profile {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
}

interface CollabRequest {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: string;
  created_at: string;
  sender?: Profile | Profile[];
  receiver?: Profile | Profile[];
}

// mapper to handle joint results that might be object or array
const extractProfile = (profileResult: Profile | Profile[] | undefined): Profile | undefined => {
  if (!profileResult) return undefined;
  if (Array.isArray(profileResult)) return profileResult[0];
  return profileResult;
};

export function useCollabRequests(userId: string | undefined) {
  return useQuery({
    queryKey: ["collab-requests", userId],
    queryFn: async () => {
      if (!userId) return { incoming: [], outgoing: [], active: [] };

      // 1. Fetch raw requests (no joins yet to avoid FK issues)
      const { data: incomingRaw, error: incError } = await supabase
        .from("collab_requests")
        .select("*")
        .eq("receiver_id", userId)
        .order("created_at", { ascending: false });

      if (incError) throw incError;

      const { data: outgoingRaw, error: outError } = await supabase
        .from("collab_requests")
        .select("*")
        .eq("sender_id", userId)
        .order("created_at", { ascending: false });

      if (outError) throw outError;

      // 2. Extract all unique User IDs needed
      const incoming = (incomingRaw || []) as CollabRequest[];
      const outgoing = (outgoingRaw || []) as CollabRequest[];

      const userIds = new Set<string>();
      incoming.forEach(r => userIds.add(r.sender_id));
      outgoing.forEach(r => userIds.add(r.receiver_id));

      // 3. Fetch profiles for these IDs
      const { data: profiles, error: profileError } = await supabase
        .from("profiles")
        .select("id, username, full_name, avatar_url")
        .in("id", Array.from(userIds));

      if (profileError) throw profileError;

      // 4. Create a lookup map
      const profileMap = new Map<string, Profile>();
      profiles?.forEach(p => profileMap.set(p.id, p));

      // 5. Attach profiles to requests
      const incMapped = incoming.map(r => ({
        ...r,
        sender: profileMap.get(r.sender_id) || { id: r.sender_id, username: "Unknown", full_name: "Unknown User", avatar_url: null }
      }));

      const outMapped = outgoing.map(r => ({
        ...r,
        receiver: profileMap.get(r.receiver_id) || { id: r.receiver_id, username: "Unknown", full_name: "Unknown User", avatar_url: null }
      }));

      const pendingInc = incMapped.filter((r) => r.status === 'pending');
      const pendingOut = outMapped.filter((r) => r.status === 'pending');
      const active = [
        ...incMapped.filter((r) => r.status === 'accepted'),
        ...outMapped.filter((r) => r.status === 'accepted')
      ];

      return {
        incoming: pendingInc,
        outgoing: pendingOut,
        active
      };
    },
    enabled: !!userId,
  });
}

export function useUpdateCollabStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ requestId, status, userId }: { requestId: string, status: 'accepted' | 'rejected', userId: string }) => {
      const { error } = await supabase
        .from("collab_requests")
        .update({ status })
        .eq("id", requestId);
      if (error) throw error;
      return { userId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["collab-requests", data.userId] });
    },
  });
}
