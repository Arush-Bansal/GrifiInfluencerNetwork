"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/integrations/supabase/client";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { BottomNav } from "@/components/dashboard/BottomNav";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Loader2 } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const isOnboardingPage = pathname === "/dashboard/onboarding";

  useEffect(() => {
    const loadUserData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push("/auth");
        return;
      }

      setUser(session.user);
      setRole(session.user.user_metadata?.role || "influencer");

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();

        if (data && !error) {
          setProfile(data);
          
          // Check for onboarding completion
          const isIncomplete = !data.username || !data.full_name || !data.niche || !data.platform;
          
          if (isIncomplete && !isOnboardingPage) {
            router.push("/dashboard/onboarding");
          } else if (!isIncomplete && isOnboardingPage) {
            router.push("/dashboard");
          }
        } else if (!isOnboardingPage) {
          // No profile yet, definitely needs onboarding
          router.push("/dashboard/onboarding");
        }
      } catch (err) {
        console.error("Error fetching profile", err);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        setUser(session.user);
        setRole(session.user.user_metadata?.role || "influencer");
      } else {
        router.push("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [router, isOnboardingPage]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center animate-bounce shadow-xl shadow-primary/20">
          <span className="text-primary-foreground font-bold text-2xl">G</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground animate-pulse">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm font-medium">Securing session...</span>
        </div>
      </div>
    );
  }

  // If on onboarding page, render without sidebar/header/bottomnav
  if (isOnboardingPage) {
    return (
      <div className="min-h-screen bg-background">
        <main className="flex-1 w-full h-full">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Laptop Sidebar */}
      <Sidebar 
        user={user} 
        role={role} 
        profile={profile} 
        className="hidden lg:flex" 
      />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <DashboardHeader user={user} profile={profile} />

        {/* Main Content Area */}
        <main className="flex-1 overflow-x-hidden pt-16 lg:pt-0 pb-20 lg:pb-0">
          {children}
        </main>

        {/* Mobile Bottom Nav */}
        <BottomNav role={role} className="lg:hidden" />
      </div>
    </div>
  );
}
