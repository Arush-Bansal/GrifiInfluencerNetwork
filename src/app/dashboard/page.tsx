"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { User, LogOut, Zap, TrendingUp, Users, Bot } from "lucide-react";
import type { User as SupabaseUser } from "@supabase/supabase-js";

interface SponsorMatch {
  brandName: string;
  industry: string;
  matchScore: number;
  reason: string;
  estimatedDealValue: string;
}

const Dashboard = () => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [matches, setMatches] = useState<SponsorMatch[]>([]);
  const [matchLoading, setMatchLoading] = useState(false);
  const [profile, setProfile] = useState({
    niche: "",
    followers: "",
    platform: "",
    engagementRate: "",
  });
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
      if (!session?.user) {
        router.push("/auth");
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
      if (!session?.user) {
        router.push("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      localStorage.clear();
      sessionStorage.clear();
      router.push("/auth");
      router.refresh();
    }
  };

  const findMatches = async () => {
    if (!profile.niche || !profile.followers || !profile.platform) {
      toast({
        title: "Missing Information",
        description: "Please fill in all profile fields to find matches.",
        variant: "destructive",
      });
      return;
    }

    setMatchLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/ai-match`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          influencerData: {
            ...profile,
            userId: user?.id,
            email: user?.email,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 429) {
          toast({
            title: "Rate Limited",
            description: "Too many requests. Please try again in a moment.",
            variant: "destructive",
          });
          return;
        }
        if (response.status === 402) {
          toast({
            title: "Credits Required",
            description: "Please add credits to continue using AI features.",
            variant: "destructive",
          });
          return;
        }
        throw new Error(errorData.error || "Failed to find matches");
      }

      const data = await response.json();
      setMatches(data.matches || []);
      toast({
        title: "Matches Found!",
        description: `Found ${data.matches?.length || 0} potential sponsors for you.`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to find matches. Please try again.",
        variant: "destructive",
      });
    } finally {
      setMatchLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary/30">
      {/* Header */}
      <header className="bg-background border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
              <span className="text-primary-foreground font-semibold text-lg">G</span>
            </div>
            <span className="text-xl font-semibold tracking-tight">GRIFI</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">{user?.email}</span>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout} className="text-muted-foreground hover:text-foreground">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold mb-2 text-foreground">Welcome to Grifi</h1>
          <p className="text-muted-foreground">Complete your profile to start finding sponsor matches.</p>
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
                  <div className="text-2xl font-semibold">{matches.length}</div>
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

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Profile Form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Your Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="niche">Content Niche</Label>
                <Select value={profile.niche} onValueChange={(v) => setProfile({ ...profile, niche: v })}>
                  <SelectTrigger className="mt-1.5 w-full">
                    <SelectValue placeholder="Select your niche" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tech">Technology</SelectItem>
                    <SelectItem value="lifestyle">Lifestyle</SelectItem>
                    <SelectItem value="gaming">Gaming</SelectItem>
                    <SelectItem value="fitness">Fitness</SelectItem>
                    <SelectItem value="beauty">Beauty</SelectItem>
                    <SelectItem value="food">Food</SelectItem>
                    <SelectItem value="travel">Travel</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="platform">Main Platform</Label>
                <Select value={profile.platform} onValueChange={(v) => setProfile({ ...profile, platform: v })}>
                  <SelectTrigger className="mt-1.5 w-full">
                    <SelectValue placeholder="Select platform" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="instagram">Instagram</SelectItem>
                    <SelectItem value="youtube">YouTube</SelectItem>
                    <SelectItem value="tiktok">TikTok</SelectItem>
                    <SelectItem value="twitter">Twitter/X</SelectItem>
                    <SelectItem value="linkedin">LinkedIn</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="followers">Follower Count</Label>
                <Input
                  id="followers"
                  type="text"
                  value={profile.followers}
                  onChange={(e) => setProfile({ ...profile, followers: e.target.value })}
                  placeholder="e.g., 50,000"
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="engagement">Engagement Rate (%)</Label>
                <Input
                  id="engagement"
                  type="text"
                  value={profile.engagementRate}
                  onChange={(e) => setProfile({ ...profile, engagementRate: e.target.value })}
                  placeholder="e.g., 4.5"
                  className="mt-1.5"
                />
              </div>

              <Button 
                onClick={findMatches} 
                className="w-full mt-2"
                disabled={matchLoading}
              >
                {matchLoading ? (
                  <>Finding Matches...</>
                ) : (
                  <>
                    <Bot className="w-4 h-4 mr-2" />
                    Find AI Matches
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Matches Results */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Sponsor Matches</CardTitle>
            </CardHeader>
            <CardContent>
              {matches.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4 text-muted-foreground/50">
                    <Bot className="w-6 h-6" />
                  </div>
                  <p className="font-medium mb-1">No matches yet</p>
                  <p className="text-sm">Complete your profile and click "Find AI Matches"</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {matches.map((match, index) => (
                    <div 
                      key={index} 
                      className="p-4 border rounded-lg bg-card hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-foreground">{match.brandName}</h3>
                          <p className="text-sm text-muted-foreground">{match.industry}</p>
                        </div>
                        <div className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                          {match.matchScore}% Match
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{match.reason}</p>
                      <div className="flex items-center justify-between pt-2 border-t mt-3">
                        <span className="text-sm font-medium text-foreground">{match.estimatedDealValue}</span>
                        <Button size="sm" variant="secondary" className="h-8">
                          Contact
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;

