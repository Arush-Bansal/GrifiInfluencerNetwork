import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useInfluencerCampaigns() {
  return useQuery({
    queryKey: ["influencer-campaigns"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("campaigns")
        .select("*, brand:brand_id(*)")
        .eq("status", "open")
        .order("created_at", { ascending: false })
        .limit(20);
      
      if (error) throw error;
      return data as unknown as any[]; // eslint-disable-line @typescript-eslint/no-explicit-any
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useAppliedCampaigns(influencerId: string | undefined) {
  return useQuery({
    queryKey: ["applied-campaigns", influencerId],
    queryFn: async () => {
      if (!influencerId) return [];
      const { data, error } = await supabase
        .from("campaign_applications")
        .select("campaign_id")
        .eq("influencer_id", influencerId);
      
      if (error) throw error;
      return (data || []).map(a => a.campaign_id);
    },
    enabled: !!influencerId,
  });
}

export function useApplyToCampaign() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ campaignId, influencerId, message }: { campaignId: string, influencerId: string, message: string }) => {
      const { error } = await supabase
        .from("campaign_applications")
        .insert({
          campaign_id: campaignId,
          influencer_id: influencerId,
          message,
          status: 'pending'
        });
      
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["applied-campaigns", variables.influencerId] });
      queryClient.invalidateQueries({ queryKey: ["campaign-applications", variables.campaignId] });
    },
  });
}

export function useBrandCampaigns(brandId: string | undefined) {
  return useQuery({
    queryKey: ["brand-campaigns", brandId],
    queryFn: async () => {
      if (!brandId) return [];
      const { data, error } = await supabase
        .from("campaigns")
        .select("*")
        .eq("brand_id", brandId)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as unknown as any[]; // eslint-disable-line @typescript-eslint/no-explicit-any
    },
    enabled: !!brandId,
  });
}

export function useCampaignApplications(campaignId: string | undefined) {
  return useQuery({
    queryKey: ["campaign-applications", campaignId],
    queryFn: async () => {
      if (!campaignId) return [];
      const { data, error } = await supabase
        .from("campaign_applications")
        .select("*, profiles:influencer_id(*)")
        .eq("campaign_id", campaignId);
      
      if (error) throw error;
      return data as unknown as any[]; // eslint-disable-line @typescript-eslint/no-explicit-any
    },
    enabled: !!campaignId,
  });
}

export function useUpdateApplicationStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ applicationId, status }: { applicationId: string, campaignId: string, status: 'approved' | 'rejected' }) => {
      const { error } = await supabase
        .from("campaign_applications")
        .update({ status })
        .eq("id", applicationId);
      
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["campaign-applications", variables.campaignId] });
    },
  });
}

export function useCreateCampaign() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (campaign: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
      const { error } = await supabase
        .from("campaigns")
        .insert(campaign);
      
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["brand-campaigns", variables.brand_id] });
      queryClient.invalidateQueries({ queryKey: ["influencer-campaigns"] });
    },
  });
}

export function useMyApplications(influencerId: string | undefined) {
  return useQuery({
    queryKey: ["my-applications", influencerId],
    queryFn: async () => {
      if (!influencerId) return [];
      const { data, error } = await supabase
        .from("campaign_applications")
        .select("*, campaigns(*, brand:brand_id(*))")
        .eq("influencer_id", influencerId)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as unknown as any[]; // eslint-disable-line @typescript-eslint/no-explicit-any
    },
    enabled: !!influencerId,
  });
}
