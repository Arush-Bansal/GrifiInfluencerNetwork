import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useSearchProfiles(query: string, filters: any, enabled = false) { // eslint-disable-line @typescript-eslint/no-explicit-any
  return useQuery({
    queryKey: ["search-profiles", query, filters],
    queryFn: async () => {
      let queryBuilder = supabase
        .from("profiles")
        .select("id, full_name, username, avatar_url, bio, niche, platform, followers, engagement_rate, is_verified");

      if (query.trim()) {
        queryBuilder = queryBuilder.or(`full_name.ilike.%${query}%,username.ilike.%${query}%`);
      }

      if (filters.niches && filters.niches.length > 0) {
        queryBuilder = queryBuilder.in('niche', filters.niches);
      }
      
      if (filters.platforms && filters.platforms.length > 0) {
        queryBuilder = queryBuilder.in('platform', filters.platforms);
      }
      
      if (filters.minFollowers) {
        const followers = parseInt(filters.minFollowers.replace(/,/g, ''));
        if (!isNaN(followers)) {
          queryBuilder = queryBuilder.gte('followers', followers);
        }
      }
      
      if (filters.minEngagement) {
        const engagement = parseFloat(filters.minEngagement);
        if (!isNaN(engagement)) {
          queryBuilder = queryBuilder.gte('engagement_rate', engagement);
        }
      }

      const { data, error } = await queryBuilder.limit(20);
      if (error) throw error;
      return data as any[]; // eslint-disable-line @typescript-eslint/no-explicit-any
    },
    enabled,
  });
}

export function useSearchSuggestions(query: string, enabled: boolean) {
  return useQuery({
    queryKey: ["search-suggestions", query],
    queryFn: async () => {
      if (!query.trim()) {
        const { data } = await supabase
          .from("profiles")
          .select("id, full_name, username, avatar_url, bio, is_verified")
          .limit(5);
        return data as any[]; // eslint-disable-line @typescript-eslint/no-explicit-any
      }

      const { data } = await supabase
        .from("profiles")
        .select("id, full_name, username, avatar_url, bio, is_verified")
        .or(`full_name.ilike.%${query}%,username.ilike.%${query}%`)
        .limit(5);
      
      return data as any[]; // eslint-disable-line @typescript-eslint/no-explicit-any
    },
    enabled,
    staleTime: 1000 * 60, // 1 minute
  });
}
