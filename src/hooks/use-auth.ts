import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";

export function useAuth() {
  const [sessionUser, setSessionUser] = useState<User | null>(null);
  const [isSessionLoading, setIsSessionLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSessionUser(session?.user ?? null);
      setIsSessionLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSessionUser(session?.user ?? null);
      setIsSessionLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const { data: profile, isLoading: isProfileLoading, error: profileError } = useQuery({
    queryKey: ["viewer-profile", sessionUser?.id],
    queryFn: async () => {
      if (!sessionUser) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", sessionUser.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!sessionUser,
  });

  const role = sessionUser?.user_metadata?.role || "influencer";

  return {
    user: sessionUser,
    profile,
    role,
    isLoading: isSessionLoading || (!!sessionUser && isProfileLoading),
    error: profileError,
  };
}
