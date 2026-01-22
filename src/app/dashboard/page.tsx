"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { useQueryClient } from "@tanstack/react-query";
import { UnifiedFeed } from "@/components/dashboard/UnifiedFeed";
import { CreatePost } from "@/components/dashboard/CreatePost";
import { BrandCampaigns } from "@/components/campaigns/BrandCampaigns";
import { InfluencerCampaigns } from "@/components/campaigns/InfluencerCampaigns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatsDashboard } from "@/components/dashboard/StatsDashboard";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { mapToDashboardProfile } from "@/lib/view-models";

import { DashboardSkeleton } from "@/components/skeletons";

const DashboardContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { user, profile: serverProfile, role, isLoading: loading } = useAuth();
  
  const currentTab = searchParams.get("tab") || "feed";

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth");
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return <DashboardSkeleton />;
  }

  const profile = mapToDashboardProfile(serverProfile);

  if (loading) {
    return <DashboardSkeleton />;
  }

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("tab", value);
    router.push(`/dashboard?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] relative overflow-hidden">
        <div className="absolute inset-0 bg-noise opacity-5 pointer-events-none" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 max-w-full relative z-10">
      <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Main Content (Center) */}
        <div className="lg:col-span-8 space-y-6 sm:space-y-8 min-w-0">
          {/* Welcome Section */}
          <div className="p-8 sm:p-12 bg-white rounded-[3rem] shadow-[0_32px_64px_-15px_rgba(0,0,0,0.05)] border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-8 overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:opacity-10 transition-opacity duration-700">
                <Sparkles size={120} />
            </div>
            <div className="min-w-0 flex-1 relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Member Dashboard</span>
                <div className="w-1 h-1 bg-slate-300 rounded-full" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">2026 Edition</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 lg:truncate">
                Welcome back, {profile.username || user?.email?.split('@')[0]}
              </h1>
              <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mt-3 lg:truncate">
                {role === 'brand' 
                  ? "Managing your elite campaign network." 
                  : "Discovering legendary growth opportunities."}
              </p>
            </div>
            
            <div className="shrink-0 relative z-10">
              <Link href={`/u/${profile.username || ""}`}>
                <Button variant="outline" className="rounded-full h-12 px-8 font-black text-slate-900 border-slate-100 hover:bg-slate-50 shadow-sm transition-all active:scale-95">
                    VIEW PUBLIC PAGE
                </Button>
              </Link>
            </div>
          </div>

          {role === 'brand' ? (
            <Tabs value={currentTab} onValueChange={handleTabChange} className="space-y-10 max-w-full">
              <div className="border-b border-slate-100 -mx-4 px-4 sm:mx-0 sm:px-0">
                <div className="overflow-x-auto no-scrollbar scroll-smooth">
                  <TabsList className="bg-transparent rounded-none p-0 h-auto flex justify-start gap-8 sm:gap-12 border-none min-w-max pb-[2px]">
                    <TabsTrigger 
                      value="feed" 
                      className="data-[state=active]:bg-transparent data-[state=active]:text-slate-900 data-[state=active]:border-b-4 data-[state=active]:border-primary rounded-none shadow-none px-0 py-4 text-xs font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap opacity-40 data-[state=active]:opacity-100"
                    >
                      GLOBAL NETWORK
                    </TabsTrigger>
                    <TabsTrigger 
                      value="campaigns" 
                      className="data-[state=active]:bg-transparent data-[state=active]:text-slate-900 data-[state=active]:border-b-4 data-[state=active]:border-primary rounded-none shadow-none px-0 py-4 text-xs font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap opacity-40 data-[state=active]:opacity-100"
                    >
                      ELITE CAMPAIGNS
                    </TabsTrigger>
                  </TabsList>
                </div>
              </div>

              <TabsContent value="feed" className="animate-in fade-in slide-in-from-bottom-2 duration-300 outline-none">
                  <div className="space-y-6">
                    <div className="hidden lg:block">
                      <CreatePost 
                        userId={user?.id || ""} 
                        userProfile={{ username: profile.username }}
                        onPostCreated={() => {
                          queryClient.invalidateQueries({ queryKey: ["feed"] });
                        }}
                      />
                    </div>
                    <UnifiedFeed userId={user?.id || ""} />
                  </div>
              </TabsContent>

              <TabsContent value="campaigns" className="animate-in fade-in slide-in-from-bottom-2 duration-300 outline-none">
                <BrandCampaigns brandId={user?.id || ""} />
              </TabsContent>
            </Tabs>
          ) : (
            <div className="space-y-12">
              <StatsDashboard profile={profile} />
              
              <div className="pt-8">
                <div className="flex items-center gap-2 mb-6 ml-2">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Active Ventures</span>
                    <h2 className="text-2xl font-black tracking-tight text-slate-900">Your Campaigns</h2>
                </div>
                <InfluencerCampaigns influencerId={user?.id || ""} />
              </div>
            </div>
          )}
        </div>

        {/* Contextual Sidebar (Right) */}
        {/* <ContextSidebar 
          role={role} 
          profile={profile} 
          className="lg:col-span-4 hidden lg:block" 
        /> */}
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
    return (
        <Suspense fallback={<DashboardSkeleton />}>
            <DashboardContent />
        </Suspense>
    )
}

export default Dashboard;

