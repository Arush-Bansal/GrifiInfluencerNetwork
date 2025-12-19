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
import { User, Loader2, Save, Camera, Link as LinkIcon, MapPin, Check, XCircle } from "lucide-react";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { SocialVerification } from "@/components/dashboard/SocialVerification";

const ProfilePage = () => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  // Profile State
  const [profile, setProfile] = useState({
    username: "",
    full_name: "",
    bio: "",
    location: "",
    website: "",
    niche: "",
    followers: "",
    platform: "",
    engagementRate: "",
    banner_url: "",
  });

  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'unavailable'>('idle');

  useEffect(() => {
    const fetchUserAndProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        router.push("/auth");
        return;
      }

      setUser(session.user);
      
      try {
        // Try to fetch from 'profiles' table first for most up-to-date data
        // Explicitly selecting fields to avoid type errors if table schema varies
        const { data: profileData, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();

        const metadata = session.user.user_metadata || {};
        
        if (profileData && !error) {
          setProfile({
            username: profileData.username || metadata.username || "",
            full_name: profileData.full_name || metadata.full_name || "",
            bio: profileData.bio || metadata.bio || "",
            location: profileData.location || metadata.location || "",
            website: profileData.website || metadata.website || "",
            niche: profileData.niche || metadata.niche || "",
            followers: profileData.followers || metadata.followers || "",
            platform: profileData.platform || metadata.platform || "",
            engagementRate: profileData.engagement_rate || metadata.engagementRate || "", // Map db snake_case to state camelCase
            banner_url: profileData.banner_url || metadata.banner_url || "",
          });
        } else {
          // Fallback to metadata
          setProfile({
            username: metadata.username || "",
            full_name: metadata.full_name || "",
            bio: metadata.bio || "",
            location: metadata.location || "",
            website: metadata.website || "",
            niche: metadata.niche || "",
            followers: metadata.followers || "",
            platform: metadata.platform || "",
            engagementRate: metadata.engagementRate || "",
            banner_url: metadata.banner_url || "",
          });
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndProfile();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session?.user && !loading) {
        router.push("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [router, loading]);

  // Username validation effect
  useEffect(() => {
    const checkUsername = async () => {
      if (!profile.username || profile.username.length < 3) {
        setUsernameStatus('idle');
        return;
      }

      // Don't check if it's the current user's own username (already saved)
      // We check against metadata OR the initially loaded profile data if possible. 
      // Simplified: if it matches user metadata username, it's theirs.
      if (user?.user_metadata?.username === profile.username) {
         setUsernameStatus('available'); 
         return;
      }
      
      setUsernameStatus('checking');
      
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("username")
          .eq("username", profile.username)
          .maybeSingle();

        if (error) throw error;
        
        if (data) {
          setUsernameStatus('unavailable');
        } else {
          setUsernameStatus('available');
        }
      } catch (error) {
      }
    };

    const timeoutId = setTimeout(() => {
        checkUsername();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [profile.username, user]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'banner') => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 5MB.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${type}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { data, error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('profiles')
        .getPublicUrl(filePath);

      if (type === 'avatar') {
        // Update both Auth metadata and Database
        const { error: authError } = await supabase.auth.updateUser({
          data: { avatar_url: publicUrl }
        });
        if (authError) throw authError;

        const { error: dbError } = await supabase
          .from('profiles')
          .update({ avatar_url: publicUrl })
          .eq('id', user.id);
        if (dbError) throw dbError;

        toast({ title: "Photo Updated", description: "Your profile photo has been updated." });
      } else {
        setProfile(prev => ({ ...prev, banner_url: publicUrl }));
        // Just update state for now, handleSave will persist to DB
        toast({ title: "Banner Uploaded", description: "Click Save Changes to persist your new background image." });
      }

      // Refresh local user state
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) setUser(session.user);

    } catch (error: any) {
      console.error(`Error uploading ${type}:`, error);
      toast({
        title: "Upload Failed",
        description: error.message || `Failed to upload your ${type}.`,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };


  const handleSave = async () => {
    if (!user) return;
    
    if (usernameStatus === 'unavailable') {
        toast({
            title: "Username Taken",
            description: "Please choose a different username before saving.",
            variant: "destructive"
        });
        return;
    }

    setSaving(true);

    try {
      // 1. Update Auth Metadata (User Identity)
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          username: profile.username,
          full_name: profile.full_name,
          niche: profile.niche,
          followers: profile.followers,
          platform: profile.platform,
          engagementRate: profile.engagementRate,
          // Storing extra fields in metadata as backup
          bio: profile.bio,
          location: profile.location,
          website: profile.website,
          banner_url: profile.banner_url,
          avatar_url: user.user_metadata?.avatar_url,
        }
      });

      if (authError) throw authError;

      // 2. Upsert to 'profiles' table (Public Data)
      // Sanitization: Convert empty strings to null for fields that might be numeric or optional
      const dbPayload = {
          id: user.id,
          username: profile.username,
          full_name: profile.full_name || null,
          bio: profile.bio || null,
          location: profile.location || null,
          website: profile.website || null,
          niche: profile.niche || null,
          followers: profile.followers || null,
          platform: profile.platform || null,
          engagement_rate: profile.engagementRate || null,
          banner_url: profile.banner_url || null,
          updated_at: new Date().toISOString(),
          avatar_url: user.user_metadata?.avatar_url
      };

      const { error: dbError } = await supabase
        .from("profiles")
        .upsert(dbPayload);

      if (dbError) {
        console.error("Error updating profiles table:", JSON.stringify(dbError, null, 2));
        // If it's a specific type error or constraint violation, we want to know.
        toast({
          title: "Warning: Profile Sync Issue",
          description: `Saved to account, but public profile sync failed. ${dbError.message || dbError.details || ''}`,
          variant: "destructive", // Changed to destructive to draw attention, though data is partially saved
        });
      } else {
         toast({
            title: "Profile Updated",
            description: "Your profile information has been saved successfully.",
         });
      }
      
      // Refresh user to update local state from new metadata
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) setUser(session.user);

    } catch (error: any) {
      console.error("Critical error saving profile:", error);
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
      <main className="container mx-auto px-4 py-8">
        {/* Sticky Action Header */}
        <div className="sticky top-16 lg:top-0 z-20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 -mx-4 px-4 py-4 mb-6 border-b flex items-center justify-between sm:static sm:bg-transparent sm:backdrop-blur-none sm:border-none sm:mx-0 sm:px-0 sm:mb-8 sm:py-0">
          <div>
            <h1 className="text-xl sm:text-3xl font-bold text-foreground">Profile Settings</h1>
            <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">Manage your public profile and account details.</p>
          </div>
          <Button 
            onClick={handleSave} 
            disabled={saving || usernameStatus === 'unavailable'} 
            size="sm"
            className="shadow-lg shadow-primary/20"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            <span className="inline">Save Changes</span>
          </Button>
        </div>

        <div className="grid gap-8">
          {/* Account Information Card */}
          <Card>
            <CardHeader>
              <CardTitle>Public Information</CardTitle>
              <CardDescription>This information will be displayed on your public profile.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Banner Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Profile Background</Label>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-xs h-8 text-primary"
                    onClick={() => document.getElementById('banner-upload')?.click()}
                  >
                    <Camera className="w-3.5 h-3.5 mr-1.5" />
                    {profile.banner_url ? 'Change' : 'Upload'}
                  </Button>
                </div>
                <div className="relative h-32 sm:h-40 w-full rounded-xl overflow-hidden bg-secondary border-2 border-dashed border-border group">
                  {profile.banner_url ? (
                    <img src={profile.banner_url} alt="Profile Banner" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/5 via-primary/10 to-primary/20 flex items-center justify-center">
                      <p className="text-muted-foreground text-xs font-medium">No background image set</p>
                    </div>
                  )}
                  {/* Desktop Hover Overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:flex items-center justify-center">
                    <input
                      type="file"
                      id="banner-upload"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'banner')}
                    />
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      className="font-bold shadow-lg"
                      onClick={() => document.getElementById('banner-upload')?.click()}
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      {profile.banner_url ? 'Change Background' : 'Upload Background'}
                    </Button>
                  </div>
                  {/* Mobile Input (Functional without hover) */}
                  <input
                    type="file"
                    id="banner-upload-mobile"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'banner')}
                  />
                </div>
                <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest text-center">Recommended: 1200x400</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start pt-4 border-t border-border mt-2">
                <div className="flex flex-col items-center gap-3 shrink-0">
                  <div className="h-24 w-24 sm:h-28 sm:w-28 rounded-full bg-secondary flex items-center justify-center border-4 border-background shadow-xl relative overflow-hidden group">
                    {user?.user_metadata?.avatar_url ? (
                      <img src={user.user_metadata.avatar_url} alt="Avatar" className="h-full w-full object-cover" />
                    ) : (
                      <User className="h-12 w-12 text-muted-foreground" />
                    )}
                    <div 
                      className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                      onClick={() => document.getElementById('avatar-upload')?.click()}
                    >
                      <Camera className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="relative w-full">
                    <input
                      type="file"
                      id="avatar-upload"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'avatar')}
                    />
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full text-xs font-semibold h-8" 
                      onClick={() => document.getElementById('avatar-upload')?.click()}
                    >
                      <Camera className="w-3.5 h-3.5 mr-2" />
                      Change Photo
                    </Button>
                  </div>
                </div>
                
                <div className="flex-1 space-y-4 w-full">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <div className="relative">
                        <Input 
                          id="username" 
                          placeholder="username" 
                          value={profile.username} 
                          onChange={(e) => {
                             // Simple regex to allow only valid url chars
                             const val = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '');
                             setProfile({ ...profile, username: val });
                          }} 
                          className={
                            usernameStatus === 'unavailable' ? 'border-destructive focus-visible:ring-destructive pr-10' : 
                            usernameStatus === 'available' ? 'border-green-500 focus-visible:ring-green-500 pr-10' : 'pr-10'
                          }
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          {usernameStatus === 'checking' && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                          {usernameStatus === 'available' && <Check className="h-4 w-4 text-green-500" />}
                          {usernameStatus === 'unavailable' && <XCircle className="h-4 w-4 text-destructive" />}
                        </div>
                      </div>
                      <div className="flex justify-between">
                         <p className="text-xs text-muted-foreground">grifi.in/u/{profile.username || "username"}</p>
                         {usernameStatus === 'unavailable' && <p className="text-xs text-destructive font-medium">Username taken</p>}
                         {usernameStatus === 'available' && <p className="text-xs text-green-600 font-medium">Username available</p>}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="full_name">Display Name</Label>
                      <Input 
                        id="full_name" 
                        placeholder="Your full name" 
                        value={profile.full_name} 
                        onChange={(e) => setProfile({ ...profile, full_name: e.target.value })} 
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <textarea 
                      id="bio"
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="Tell us about yourself..."
                      value={profile.bio}
                      onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input 
                          id="location" 
                          className="pl-9"
                          placeholder="City, Country" 
                          value={profile.location} 
                          onChange={(e) => setProfile({ ...profile, location: e.target.value })} 
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="website">Website</Label>
                      <div className="relative">
                        <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input 
                          id="website" 
                          className="pl-9"
                          placeholder="https://yourwebsite.com" 
                          value={profile.website} 
                          onChange={(e) => setProfile({ ...profile, website: e.target.value })} 
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Influencer Profile Card */}
          <Card>
            <CardHeader>
              <CardTitle>Influencer Profile</CardTitle>
              <CardDescription>These details help brands find you.</CardDescription>
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

          {/* Verification Center */}
          <SocialVerification user={user} />

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={saving || usernameStatus === 'unavailable'} size="lg">
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
