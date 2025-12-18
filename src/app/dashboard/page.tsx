"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Navbar } from "@/components/dashboard/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { User, Zap, TrendingUp, Users, Bot } from "lucide-react";
import { UnifiedFeed } from "@/components/dashboard/UnifiedFeed";
import { CreatePost } from "@/components/dashboard/CreatePost";
import { BrandCampaigns } from "@/components/campaigns/BrandCampaigns";
import { InfluencerCampaigns } from "@/components/campaigns/InfluencerCampaigns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { User as SupabaseUser } from "@supabase/supabase-js";

import { ContextSidebar } from "@/components/dashboard/ContextSidebar";

const Dashboard = () => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({
    niche: "",
    followers: "",
    platform: "",
    engagementRate: "",
    username: "",
  });
  const [role, setRole] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const loadUserData = async (session: any) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      
      if (!currentUser) {
        setLoading(false);
        router.push("/auth");
        return;
      }

      // Initial state from metadata
      const metadata = currentUser.user_metadata || {};
      let profileData = {
        niche: metadata.niche || "",
        followers: metadata.followers || "",
        platform: metadata.platform || "",
        engagementRate: metadata.engagementRate || "",
        username: metadata.username || "",
      };

      try {
        // Fetch latest from DB to be sure
        const { data, error } = await supabase
          .from("profiles")
          .select("niche, followers, platform, engagement_rate, username")
          .eq("id", currentUser.id)
          .single();

        if (data && !error) {
          profileData = {
            niche: data.niche || profileData.niche,
            followers: data.followers || profileData.followers,
            platform: data.platform || profileData.platform,
            engagementRate: data.engagement_rate || profileData.engagementRate, // snake_case from DB
            username: data.username || profileData.username,
          };
        }
      } catch (err) {
        console.error("Error fetching profile", err);
      }

      setProfile(profileData);
      setRole(currentUser.user_metadata?.role || "influencer");
      setLoading(false);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      loadUserData(session);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      loadUserData(session);
    });

    return () => subscription.unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid lg:grid-cols-12 gap-8">
        {/* Main Content (Center) */}
        <div className="lg:col-span-8 space-y-8">
          {/* Welcome Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-accent/30 rounded-2xl border border-border/50">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Hello, {profile.username || user?.email?.split('@')[0]}!
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                {role === 'brand' 
                  ? "Here's what's happening with your campaigns today." 
                  : "Discover new opportunities to grow your influence."}
              </p>
            </div>
            
            {profile.username ? (
              <Button variant="outline" size="sm" onClick={() => window.open(`/u/${profile.username}`, '_blank')}>
                <User className="w-4 h-4 mr-2" />
                Preview Public Profile
              </Button>
            ) : (
               <Button size="sm" onClick={() => router.push("/dashboard/profile")}>
                Setup Your Identity
              </Button>
            )}
          </div>

          <Tabs defaultValue="feed" className="space-y-6">
            <TabsList className="bg-transparent border-b border-border rounded-none p-0 h-auto gap-8">
              <TabsTrigger 
                value="feed" 
                className="data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none shadow-none px-0 py-3 text-sm font-medium transition-all"
              >
                Global Feed
              </TabsTrigger>
              <TabsTrigger 
                value="campaigns" 
                className="data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none shadow-none px-0 py-3 text-sm font-medium transition-all"
              >
                {role === 'brand' ? 'My Campaigns' : 'Discover Campaigns'}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="feed" className="animate-in fade-in slide-in-from-bottom-2 duration-300 outline-none">
                <div className="space-y-6">
                   <CreatePost 
                     userId={user?.id || ""} 
                     userProfile={{ username: profile.username }}
                     onPostCreated={() => window.location.reload()}
                   />
                   <UnifiedFeed userId={user?.id || ""} />
                </div>
            </TabsContent>

            <TabsContent value="campaigns" className="animate-in fade-in slide-in-from-bottom-2 duration-300 outline-none">
              {role === 'brand' ? (
                <BrandCampaigns brandId={user?.id || ""} />
              ) : (
                <InfluencerCampaigns influencerId={user?.id || ""} />
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Contextual Sidebar (Right) */}
        <ContextSidebar 
          role={role} 
          profile={profile} 
          className="lg:col-span-4 hidden lg:block" 
        />
      </div>
    </div>
  );
};

export default Dashboard;

