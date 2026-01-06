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

      // 1. Incoming requests
      const { data: incoming, error: incError } = await supabase
        .from("collab_requests")
        .select("*, sender:profiles!collab_requests_sender_id_fkey(id, username, full_name, avatar_url)")
        .eq("receiver_id", userId)
        .order("created_at", { ascending: false });

      if (incError) throw incError;

      // 2. Outgoing requests
      const { data: outgoing, error: outError } = await supabase
        .from("collab_requests")
        .select("*, receiver:profiles!collab_requests_receiver_id_fkey(id, username, full_name, avatar_url)")
        .eq("sender_id", userId)
        .order("created_at", { ascending: false });

      if (outError) throw outError;

      // Map to consistent format
      const incMapped = ((incoming as unknown as CollabRequest[]) || []).map((r) => ({
        ...r,
        sender: extractProfile(r.sender)
      }));

      const outMapped = ((outgoing as unknown as CollabRequest[]) || []).map((r) => ({
        ...r,
        receiver: extractProfile(r.receiver)
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
