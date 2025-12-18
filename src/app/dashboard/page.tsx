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
    <div className="min-h-screen bg-secondary/30">
      <Navbar user={user} username={profile.username} />

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Welcome Section */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold mb-2 text-foreground">Welcome to Grifi</h1>
            <p className="text-muted-foreground">Complete your profile to start finding sponsor matches.</p>
          </div>
          
          {profile.username ? (
            <Button variant="outline" onClick={() => window.open(`/u/${profile.username}`, '_blank')}>
              <User className="w-4 h-4 mr-2" />
              View Public Profile
            </Button>
          ) : (
             <Button onClick={() => router.push("/dashboard/profile")}>
              Setup Public Profile
            </Button>
          )}
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-2xl font-semibold">0</div>
                  <div className="text-muted-foreground text-xs font-medium">Matches</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-2xl font-semibold">0</div>
                  <div className="text-muted-foreground text-xs font-medium">Active Deals</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-2xl font-semibold">$0</div>
                  <div className="text-muted-foreground text-xs font-medium">Total Earned</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-2xl font-semibold">AI</div>
                  <div className="text-muted-foreground text-xs font-medium">Powered</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="feed" className="space-y-8">
          <TabsList className="bg-background/50 border border-border/50 p-1">
            <TabsTrigger value="feed" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all px-6">
              Feed
            </TabsTrigger>
            <TabsTrigger value="campaigns" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all px-6">
              {role === 'brand' ? 'My Campaigns' : 'Discover Campaigns'}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="feed" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="lg:col-span-10 lg:col-start-2 space-y-8">
                 <CreatePost 
                   userId={user?.id || ""} 
                   userProfile={{ username: profile.username }}
                   onPostCreated={() => window.location.reload()} // Simple refresh for now
                 />
                 <UnifiedFeed userId={user?.id || ""} />
              </div>
          </TabsContent>

          <TabsContent value="campaigns" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {role === 'brand' ? (
              <BrandCampaigns brandId={user?.id || ""} />
            ) : (
              <InfluencerCampaigns influencerId={user?.id || ""} />
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;

