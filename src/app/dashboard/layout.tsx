"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { BottomNav } from "@/components/dashboard/BottomNav";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { AuthChangeEvent } from "@supabase/supabase-js";
import { Logo } from "@/components/brand/Logo";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, profile, role, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isOnboardingPage = pathname === "/dashboard/onboarding";

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      router.push("/auth");
      return;
    }

    // Immediate check for recovery hash
    if (typeof window !== 'undefined' && window.location.hash.includes('type=recovery')) {
      router.push("/auth/update-password");
      return;
    }

    // Listen for password recovery event even on the dashboard
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: AuthChangeEvent) => {
      if (event === "PASSWORD_RECOVERY") {
        router.push("/auth/update-password");
      }
    });

    if (profile) {
      // Check for onboarding completion
      const isIncomplete = !profile.username || !profile.full_name || !profile.niche || !profile.platform;
      
      if (isIncomplete && !isOnboardingPage) {
        router.push("/dashboard/onboarding");
      } else if (!isIncomplete && isOnboardingPage) {
        router.push("/dashboard");
      }
    } else if (!isOnboardingPage) {
      // No profile yet, definitely needs onboarding
      router.push("/dashboard/onboarding");
    }

    return () => subscription.unsubscribe();
  }, [user, profile, isLoading, isOnboardingPage, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <div className="animate-bounce">
          <Logo size={48} />
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
        profile={profile ?? null} 
        className="hidden lg:flex" 
      />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <DashboardHeader user={user} profile={profile ?? null} />

        {/* Main Content Area */}
        <main className="flex-1 overflow-x-hidden pt-16 lg:pt-0 pb-20 lg:pb-0">
          {children}
        </main>

        {/* Mobile Bottom Nav */}
        <BottomNav className="lg:hidden" />
      </div>
    </div>
  );
}
