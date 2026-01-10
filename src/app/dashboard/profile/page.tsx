"use client";

import { useAuth } from "@/hooks/use-auth";
import { useUpdateProfile, useCheckUsername, useUploadImage } from "@/hooks/use-profile";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { User, Loader2, Save, Camera, Link as LinkIcon, MapPin, Check, XCircle } from "lucide-react";

import { ProfileSkeleton } from "@/components/skeletons";

const ProfilePage = () => {
  const router = useRouter();
  const { toast } = useToast();
  const { user, profile: serverProfile, isLoading: initialLoading } = useAuth();
  
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

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (serverProfile) {
      setProfile({
        username: serverProfile.username || "",
        full_name: serverProfile.full_name || "",
        bio: serverProfile.bio || "",
        location: serverProfile.location || "",
        website: serverProfile.website || "",
        niche: serverProfile.niche || "",
        followers: serverProfile.followers || "",
        platform: serverProfile.platform || "",
        engagementRate: serverProfile.engagement_rate || "",
        banner_url: serverProfile.banner_url || "",
      });
    }
  }, [serverProfile]);

  const { data: usernameResult, isFetching: isCheckingUsername } = useCheckUsername(profile.username, serverProfile?.username || undefined);
  const usernameStatus = isCheckingUsername ? 'checking' : 
                   (profile.username === (serverProfile?.username || user?.user_metadata?.username) ? 'available' : 
                   (usernameResult?.available ? 'available' : (profile.username.length >= 3 ? 'unavailable' : 'idle')));

  const updateProfileMutation = useUpdateProfile();
  const uploadImageMutation = useUploadImage();

  useEffect(() => {
    if (!initialLoading && !user) {
      router.push("/auth");
    }
  }, [initialLoading, user, router]);

  if (initialLoading || !user) {
    return <ProfileSkeleton />;
  }

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

    uploadImageMutation.mutate({
      file,
      userId: user.id,
      bucket: 'profiles',
      type
    }, {
      onSuccess: async ({ publicUrl }) => {
        if (type === 'avatar') {
          // Update avatar_url in profiles table
          await updateProfileMutation.mutateAsync({
            userId: user.id,
            updates: { avatar_url: publicUrl }
          });
          toast({ title: "Photo Updated", description: "Your profile photo has been updated." });
        } else {
          setProfile(prev => ({ ...prev, banner_url: publicUrl }));
          toast({ title: "Banner Uploaded", description: "Click Save Changes to persist your new background image." });
        }
      },
      onError: (error: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
        console.error(`Error uploading ${type}:`, error);
        toast({
          title: "Upload Failed",
          description: error.message || `Failed to upload your ${type}.`,
          variant: "destructive",
        });
      }
    });
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
      await updateProfileMutation.mutateAsync({
        userId: user.id,
        updates: {
          username: profile.username,
          full_name: profile.full_name,
          bio: profile.bio,
          location: profile.location,
          website: profile.website,
          niche: profile.niche,
          followers: profile.followers,
          platform: profile.platform,
          engagement_rate: profile.engagementRate,
          banner_url: profile.banner_url,
        },
        authUpdates: {
          username: profile.username,
          full_name: profile.full_name,
        }
      });

      toast({
        title: "Profile Updated",
        description: "Your profile information has been saved successfully.",
      });
    } catch (error: unknown) {
      const err = error as Error;
      console.error("Critical error saving profile:", err);
      toast({
        title: "Error",
        description: err.message || "Failed to update profile.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (initialLoading) {
    return <ProfileSkeleton />;
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
                    <Image 
                      src={profile.banner_url} 
                      alt="Profile Banner" 
                      fill
                      className="object-cover" 
                    />
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
                      <Image 
                        src={user.user_metadata.avatar_url} 
                        alt="Avatar" 
                        fill
                        className="object-cover" 
                      />
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
