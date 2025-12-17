"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/dashboard/Navbar";
import { User, Loader2, Save, Camera } from "lucide-react";
import type { User as SupabaseUser } from "@supabase/supabase-js";

const ProfilePage = () => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  // Profile State
  const [profile, setProfile] = useState({
    full_name: "",
    niche: "",
    followers: "",
    platform: "",
    engagementRate: "",
  });

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      
      if (!session?.user) {
        router.push("/auth");
        return;
      }

      // Load profile from metadata if available
      const metadata = session.user.user_metadata || {};
      setProfile({
        full_name: metadata.full_name || "",
        niche: metadata.niche || "",
        followers: metadata.followers || "",
        platform: metadata.platform || "",
        engagementRate: metadata.engagementRate || "",
      });
      
      setLoading(false);
    };

    fetchUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(session.user);
      } else if (!loading) {
        router.push("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [router, loading]);



  const handleSave = async () => {
    if (!user) return;
    setSaving(true);

    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: profile.full_name,
          niche: profile.niche,
          followers: profile.followers,
          platform: profile.platform,
          engagementRate: profile.engagementRate,
        }
      });

      if (error) throw error;

      toast({
        title: "Profile Updated",
        description: "Your profile information has been saved successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary/30">
      <Navbar user={user} />

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold mb-2 text-foreground">Profile Settings</h1>
          <p className="text-muted-foreground">Manage your account settings and influencer profile details.</p>
        </div>

        <div className="grid gap-8">
          {/* Account Information Card */}
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>Your personal account details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-6 items-start">
                <div className="flex flex-col items-center gap-2">
                  <div className="h-24 w-24 rounded-full bg-secondary flex items-center justify-center border-2 border-border relative overflow-hidden">
                    {user?.user_metadata?.avatar_url ? (
                      <img src={user.user_metadata.avatar_url} alt="Avatar" className="h-full w-full object-cover" />
                    ) : (
                      <User className="h-12 w-12 text-muted-foreground" />
                    )}
                  </div>
                  <Button variant="outline" size="sm" className="w-full text-xs" disabled>
                    <Camera className="w-3 h-3 mr-2" />
                    Change Photo
                  </Button>
                </div>
                
                <div className="flex-1 space-y-4 w-full">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" value={user?.email || ""} disabled className="bg-muted text-muted-foreground" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="full_name">Display Name</Label>
                    <Input 
                      id="full_name" 
                      placeholder="Your full name" 
                      value={profile.full_name} 
                      onChange={(e) => setProfile({ ...profile, full_name: e.target.value })} 
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Influencer Profile Card */}
          <Card>
            <CardHeader>
              <CardTitle>Influencer Profile</CardTitle>
              <CardDescription>These details help us match you with the right sponsors.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="niche">Content Niche</Label>
                  <Select value={profile.niche} onValueChange={(v) => setProfile({ ...profile, niche: v })}>
                    <SelectTrigger>
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

                <div className="space-y-2">
                  <Label htmlFor="platform">Main Platform</Label>
                  <Select value={profile.platform} onValueChange={(v) => setProfile({ ...profile, platform: v })}>
                    <SelectTrigger>
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

                <div className="space-y-2">
                  <Label htmlFor="followers">Follower Count</Label>
                  <Input
                    id="followers"
                    value={profile.followers}
                    onChange={(e) => setProfile({ ...profile, followers: e.target.value })}
                    placeholder="e.g., 50,000"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="engagement">Engagement Rate (%)</Label>
                  <Input
                    id="engagement"
                    value={profile.engagementRate}
                    onChange={(e) => setProfile({ ...profile, engagementRate: e.target.value })}
                    placeholder="e.g., 4.5"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={saving} size="lg">
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;
