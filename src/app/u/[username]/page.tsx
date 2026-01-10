"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Loader2, 
  MapPin, 
  Link as LinkIcon, 
  Calendar, 
  Edit, 
  Share2, 
  Briefcase, 
  Users, 
  Star, 
  UserPlus, 
  UserMinus, 
  Clock,
  Check,
  Camera,
  X,
  Save,
  Play,
  Trash2,
  Plus,
  Video
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { SuggestCollabModal } from "@/components/collabs/SuggestCollabModal";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { BottomNav } from "@/components/dashboard/BottomNav";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { 
  Card, 
  CardContent 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useProfile, useUserPosts, useFollowStatus, useUpdateProfile, useUploadImage, useFeaturedReels, useManageFeaturedReels } from "@/hooks/use-profile";
import { useQueryClient, useMutation, UseMutationResult } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import Image from "next/image";
import { mapToDashboardProfile } from "@/lib/view-models";
import { DashboardProfile, FeaturedReel } from "@/types/dashboard";


interface Profile extends DashboardProfile {
  join_date: string;
}

interface Post {
  id: string;
  created_at: string;
  content: string;
  author_id: string;
  image_url?: string | null;
}

const PublicNavbar = () => (
  <nav className="h-16 border-b border-border bg-background flex items-center justify-between px-6 sticky top-0 z-50">
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
        <span className="text-primary-foreground font-bold">G</span>
      </div>
      <span className="font-bold text-lg tracking-tight">GRIFI</span>
    </div>
    <div className="flex items-center gap-2">
      <Button variant="ghost" size="sm" asChild>
        <Link href="/auth">Login</Link>
      </Button>
      <Button size="sm" asChild>
        <Link href="/auth">Sign Up</Link>
      </Button>
    </div>
  </nav>
);

import { PublicProfileSkeleton } from "@/components/skeletons";

export default function PublicProfilePage() {
  const params = useParams();
  const username = params.username as string;
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { user: currentUser, profile: rawViewerProfile, role: viewerRole } = useAuth();
  const viewerProfile = mapToDashboardProfile(rawViewerProfile);

  // Queries
  const { data: profileData, isLoading: loadingProfile } = useProfile(username);
  
  const profile: Profile | null = profileData ? {
    id: profileData.id,
    username: profileData.username || username,
    full_name: profileData.full_name || username,
    avatar_url: profileData.avatar_url || "",
    bio: profileData.bio || "No bio yet.",
    niche: profileData.niche || "General",
    followers: profileData.followers || "0",
    platform: profileData.platform || "None",
    engagement_rate: profileData.engagement_rate || "0",
    location: profileData.location || "Earth",
    website: profileData.website || "",
    banner_url: profileData.banner_url || "",
    join_date: profileData.updated_at || new Date().toISOString(),
    service_brand: profileData.service_brand ?? true,
    service_ugc: profileData.service_ugc ?? true,
    service_appearances: profileData.service_appearances ?? false,
    is_verified: profileData.is_verified ?? false,
  } : null;

  const { data: userPosts = [] } = useUserPosts(profile?.id);
  const { data: featuredReels = [] } = useFeaturedReels(profile?.id);
  const { addReel, deleteReel } = useManageFeaturedReels();

  const isOwnProfile = currentUser?.id === profile?.id;
  const { data: isFollowing } = useFollowStatus(currentUser?.id, profile?.id);

  // Mutations
  const followMutation = useMutation({
    mutationFn: async () => {
      if (!currentUser || !profile) return;
      if (isFollowing) {
        const { error } = await supabase
          .from("follows")
          .delete()
          .eq("follower_id", currentUser.id)
          .eq("following_id", profile.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("follows")
          .insert({
            follower_id: currentUser.id,
            following_id: profile.id
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["follow-status", currentUser?.id, profile?.id] });
      toast({ 
        title: isFollowing ? "Unfollowed" : "Following", 
        description: isFollowing ? `You are no longer following @${profile?.username}` : `You are now following @${profile?.username}` 
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Something went wrong.",
        variant: "destructive"
      });
    }
  });

  const updateProfileMutation = useUpdateProfile();
  const uploadImageMutation = useUploadImage();

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    full_name: "",
    bio: "",
    location: "",
    website: "",
    niche: "",
    followers: "",
    platform: "",
    engagement_rate: "",
    avatar_url: "",
    banner_url: "",
    service_brand: true,
    service_ugc: true,
    service_appearances: false,
    is_verified: false,
  });

  useEffect(() => {
    if (profileData && !isEditing) {
      const timer = setTimeout(() => {
        setEditForm({
          full_name: profileData.full_name || "",
          bio: profileData.bio || "",
          location: profileData.location || "",
          website: profileData.website || "",
          niche: profileData.niche || "",
          followers: profileData.followers || "",
          platform: profileData.platform || "",
          engagement_rate: profileData.engagement_rate || "",
          avatar_url: profileData.avatar_url || "",
          banner_url: profileData.banner_url || "",
          service_brand: profileData.service_brand ?? true,
          service_ugc: profileData.service_ugc ?? true,
          service_appearances: profileData.service_appearances ?? false,
          is_verified: profileData.is_verified ?? false,
        });
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [profileData, isEditing]);

  const handleSave = async () => {
    if (!currentUser) return;
    try {
      await updateProfileMutation.mutateAsync({
        userId: currentUser.id,
        updates: {
          full_name: editForm.full_name,
          bio: editForm.bio,
          location: editForm.location,
          website: editForm.website,
          niche: editForm.niche,
          followers: editForm.followers,
          platform: editForm.platform,
          engagement_rate: editForm.engagement_rate,
          avatar_url: editForm.avatar_url,
          banner_url: editForm.banner_url,
          service_brand: editForm.service_brand,
          service_ugc: editForm.service_ugc,
          service_appearances: editForm.service_appearances,
          is_verified: editForm.is_verified,
        },
        authUpdates: {
          full_name: editForm.full_name,
        }
      });
      setIsEditing(false);
      toast({ title: "Profile updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["profile", username] });
    } catch (error: unknown) {
      const err = error as Error;
      toast({ 
        title: "Update failed", 
        description: err.message,
        variant: "destructive"
      });
    }
  };

  const handleImageUpload = async (file: File, type: 'avatar' | 'banner') => {
    if (!currentUser) return;
    uploadImageMutation.mutate({
      file,
      userId: currentUser.id,
      bucket: 'profiles',
      type
    }, {
      onSuccess: ({ publicUrl }) => {
        setEditForm(prev => ({ ...prev, [type === 'avatar' ? 'avatar_url' : 'banner_url']: publicUrl }));
        toast({ title: `${type === 'avatar' ? 'Avatar' : 'Banner'} uploaded` });
      }
    });
  };

  if (loadingProfile) {
    return <PublicProfileSkeleton />;
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <PublicNavbar />
        <div className="flex-1 flex flex-col items-center justify-center space-y-4 px-6 text-center">
          <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mb-2">
             <Users className="w-10 h-10 text-muted-foreground/50" />
          </div>
          <h2 className="text-3xl font-black italic">USER NOT FOUND</h2>
          <p className="text-muted-foreground max-w-md">The profile @{username} doesn&apos;t seem to exist or has been moved.</p>
          <Button onClick={() => router.push("/")} className="font-bold rounded-xl h-11 px-8">Back to Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {currentUser ? (
        <div className="flex min-h-screen">
          <Sidebar 
            user={currentUser} 
            role={viewerRole} 
            profile={viewerProfile} 
            className="hidden lg:flex" 
          />

          <div className="flex-1 flex flex-col min-w-0">
            <DashboardHeader user={currentUser} profile={viewerProfile} />

            <main className="flex-1 overflow-x-hidden pt-16 lg:pt-0 pb-20 lg:pb-0">
              <ProfileContent 
                profile={profile} 
                isOwnProfile={isOwnProfile} 
                isFollowing={!!isFollowing}
                followMutation={followMutation}
                userPosts={userPosts}
                featuredReels={featuredReels}
                addReel={addReel}
                deleteReel={deleteReel}
                isEditing={isEditing}
                setIsEditing={setIsEditing}
                editForm={editForm}
                setEditForm={setEditForm}
                handleSave={handleSave}
                saving={updateProfileMutation.isPending}
                handleImageUpload={handleImageUpload}
                uploadingImage={uploadImageMutation.isPending}
                toast={toast}
              />
            </main>

            <BottomNav className="lg:hidden" />
          </div>
        </div>
      ) : (
        <div className="flex flex-col min-h-screen">
          <PublicNavbar />
          <ProfileContent
            profile={profile}
            isOwnProfile={isOwnProfile}
            isFollowing={!!isFollowing}
            followMutation={followMutation}
            userPosts={userPosts}
            featuredReels={featuredReels}
            addReel={addReel}
            deleteReel={deleteReel}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
            editForm={editForm}
            setEditForm={setEditForm}
            handleSave={handleSave}
            saving={updateProfileMutation.isPending}
            handleImageUpload={handleImageUpload}
            uploadingImage={uploadImageMutation.isPending}
            toast={toast}
          />
          <footer className="mt-auto border-t border-border py-10 bg-muted">
            <div className="container mx-auto px-6 text-center">
              <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mb-1">Discover more on Grifi</p>
              <p className="text-[10px] text-muted-foreground font-medium">The Professional Identity Layer for Creators</p>
              <Button variant="link" className="mt-4 text-primary font-bold text-xs uppercase tracking-tight" asChild>
                <Link href="/auth">Join the network &rarr;</Link>
              </Button>
            </div>
          </footer>
        </div>
      )}
    </div>
  );
}

interface EditForm {
  full_name: string;
  bio: string;
  location: string;
  website: string;
  niche: string;
  followers: string;
  platform: string;
  engagement_rate: string;
  avatar_url: string;
  banner_url: string;
  service_brand: boolean;
  service_ugc: boolean;
  service_appearances: boolean;
  is_verified: boolean;
  [key: string]: string | boolean | null | undefined;
}

interface ProfileContentProps {
  profile: Profile;
  isOwnProfile: boolean;
  isFollowing: boolean;
  followMutation: UseMutationResult<void, Error, void, unknown>;
  userPosts: Post[];
  isEditing: boolean;
  setIsEditing: (val: boolean) => void;
  editForm: EditForm;
  setEditForm: (val: EditForm) => void;
  handleSave: () => Promise<void>;
  saving: boolean;
  handleImageUpload: (file: File, type: 'avatar' | 'banner') => Promise<void>;
  uploadingImage: boolean;
  featuredReels: FeaturedReel[];
  addReel: UseMutationResult<FeaturedReel, Error, { profileId: string; videoUrl: string; title?: string }>;
  deleteReel: UseMutationResult<void, Error, { reelId: string; profileId: string }>;
  toast: (options: { title?: string; description?: string; variant?: "default" | "destructive" }) => void;
}

const ProfileContent = ({ 
  profile, 
  isOwnProfile, 
  isFollowing, 
  followMutation, 
  userPosts, 
  isEditing,
  setIsEditing,
  editForm,
  setEditForm,
  handleSave,
  saving,
  handleImageUpload,
  uploadingImage,
  featuredReels,
  addReel,
  deleteReel,
  toast
}: ProfileContentProps) => {
  const [newReelUrl, setNewReelUrl] = useState("");
  const [newReelTitle, setNewReelTitle] = useState("");
  const [showAddReel, setShowAddReel] = useState(false);

  const handleAddReel = async () => {
    if (!newReelUrl) return;
    try {
      await addReel.mutateAsync({
        profileId: profile.id,
        videoUrl: newReelUrl,
        title: newReelTitle
      });
      setNewReelUrl("");
      setNewReelTitle("");
      setShowAddReel(false);
      toast({
        title: "Reel added",
        description: "Your featured reel has been added successfully."
      });
    } catch (error: unknown) {
      const err = error as Error;
      toast({
        title: "Error",
        description: err.message || "Failed to add reel",
        variant: "destructive"
      });
    }
  };

  const handleDeleteReel = async (reelId: string) => {
    try {
      await deleteReel.mutateAsync({ reelId, profileId: profile.id });
      toast({
        title: "Reel removed",
        description: "The reel has been removed from your profile."
      });
    } catch (error: unknown) {
      const err = error as Error;
      toast({
        title: "Error",
        description: err.message || "Failed to remove reel",
        variant: "destructive"
      });
    }
  };

  return (
    <main className="min-h-screen bg-muted/50 pb-20">
      {/* Muted Banner Section */}
      <section className="relative h-48 md:h-64 overflow-hidden bg-muted border-b border-border">
        {(isEditing ? editForm.banner_url : profile.banner_url) ? (
          <Image 
            src={isEditing ? editForm.banner_url : profile.banner_url} 
            alt="Profile Banner" 
            fill
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-muted/30" />
        )}
        
        {isOwnProfile && (
          <div className="absolute top-4 right-4 flex gap-2">
            {isEditing ? (
              <Button 
                variant="outline" 
                size="sm" 
                className="bg-background/80 backdrop-blur-sm shadow-sm"
                onClick={() => document.getElementById('banner-upload')?.click()}
                disabled={uploadingImage}
              >
                {uploadingImage ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Camera className="w-4 h-4 mr-2" />}
                Change Banner
              </Button>
            ) : (
              <Button 
                onClick={() => setIsEditing(true)} 
                variant="outline" 
                size="sm" 
                className="bg-background/80 backdrop-blur-sm shadow-sm"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            )}
            <input 
              type="file" 
              id="banner-upload" 
              className="hidden" 
              accept="image/*" 
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImageUpload(file, 'banner');
              }}
            />
          </div>
        )}
      </section>

      {/* Profile Header Card (Floating & Centered) */}
      <div className="container mx-auto px-4 max-w-4xl relative">
        <Card className="border border-border shadow-sm -mt-20 relative z-10 overflow-visible bg-card rounded-xl">
          <CardContent className="pt-0 pb-10 px-6 md:px-12 text-center">
            {/* Centered Avatar */}
            <div className="relative -mt-16 mb-6 inline-block group">
              <Avatar className="w-32 h-32 border-4 border-background shadow-md ring-1 ring-border relative z-10">
                <AvatarImage src={(isEditing ? editForm.avatar_url : profile.avatar_url) || undefined} alt={profile.full_name} className="object-cover" />
                <AvatarFallback className="text-3xl font-semibold bg-muted text-muted-foreground">
                  {profile.full_name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              {isEditing && (
                <div 
                  className="absolute inset-0 z-20 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  onClick={() => document.getElementById('avatar-upload')?.click()}
                >
                  <Camera className="w-8 h-8 text-white" />
                </div>
              )}
              {!isEditing && profile.is_verified && (
                <div className="absolute -bottom-1 -right-1 z-20">
                  <Badge className="bg-primary text-primary-foreground border-none px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                    <Star className="w-3 h-3 fill-primary-foreground" />
                    <span className="font-semibold text-[10px]">Verified</span>
                  </Badge>
                </div>
              )}
              <input 
                type="file" 
                id="avatar-upload" 
                className="hidden" 
                accept="image/*" 
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageUpload(file, 'avatar');
                }}
              />
            </div>

            {/* Name & Username */}
            <div className="space-y-1 mb-8">
              {isEditing ? (
                <div className="max-w-xs mx-auto space-y-2">
                  <Input 
                    value={editForm.full_name} 
                    onChange={(e) => setEditForm({...editForm, full_name: e.target.value})} 
                    className="text-center font-bold text-xl h-10"
                    placeholder="Display Name"
                  />
                  <p className="text-sm text-muted-foreground font-medium">@{profile.username}</p>
                </div>
              ) : (
                <>
                  <h1 className="text-2xl font-bold tracking-tight text-foreground">
                    {profile.full_name}
                  </h1>
                  <p className="text-sm text-muted-foreground font-medium">@{profile.username}</p>
                </>
              )}
              
              <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 pt-3">
                {isEditing ? (
                  <div className="flex gap-2 w-full max-w-md mx-auto">
                    <div className="relative flex-1">
                      <MapPin className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                      <Input 
                        value={editForm.location} 
                        onChange={(e) => setEditForm({...editForm, location: e.target.value})} 
                        className="pl-8 h-8 text-xs"
                        placeholder="Location"
                      />
                    </div>
                    <div className="relative flex-1">
                      <LinkIcon className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                      <Input 
                        value={editForm.website} 
                        onChange={(e) => setEditForm({...editForm, website: e.target.value})} 
                        className="pl-8 h-8 text-xs"
                        placeholder="Website URL"
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                      <MapPin className="w-3.5 h-3.5" /> {profile.location}
                    </span>
                    {profile.website && (
                      <a href={profile.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline transition-colors">
                        <LinkIcon className="w-3.5 h-3.5" /> Website
                      </a>
                    )}
                    <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                      <Calendar className="w-3.5 h-3.5" /> Joined {new Date(profile.join_date).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Primary Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              {isOwnProfile ? (
                isEditing ? (
                  <>
                    <Button 
                      onClick={handleSave} 
                      disabled={saving} 
                      className="w-full sm:w-auto font-semibold rounded-lg h-10 px-8 shadow-md"
                    >
                      {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                      Save Changes
                    </Button>
                    <Button 
                      onClick={() => setIsEditing(false)} 
                      variant="ghost" 
                      className="w-full sm:w-auto font-semibold rounded-lg h-10 px-6"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button onClick={() => setIsEditing(true)} variant="outline" className="w-full sm:w-auto font-semibold rounded-lg h-10 px-8">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                )
              ) : (
                <>
                  <Button 
                    variant={isFollowing ? "outline" : "default"} 
                    className={cn(
                      "w-full sm:w-auto font-semibold rounded-lg h-10 px-8 text-sm",
                      !isFollowing && "shadow-sm"
                    )}
                    onClick={() => followMutation.mutate()}
                    disabled={followMutation.isPending}
                  >
                    {followMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : isFollowing ? (
                      <>
                        <UserMinus className="w-4 h-4 mr-2" />
                        Unfollow
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Follow
                      </>
                    )}
                  </Button>
                  <SuggestCollabModal 
                    receiverId={profile.id} 
                    receiverName={profile.full_name}
                    trigger={
                      <Button variant="outline" className="w-full sm:w-auto font-semibold rounded-lg h-10 border-border hover:bg-muted text-sm px-6 text-foreground">
                        Connect
                      </Button>
                    }
                  />
                </>
              )}
              {!isEditing && (
                <Button variant="ghost" size="icon" className="h-10 w-10 border border-border hover:bg-muted rounded-lg text-muted-foreground">
                  <Share2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          {[
            { label: 'Followers', value: profile.followers, icon: Users, key: 'followers' },
            { label: 'Engagement', value: `${profile.engagement_rate}%`, icon: Star, key: 'engagement_rate' },
            { label: 'Platform', value: profile.platform, icon: Share2, key: 'platform' },
            { label: 'Niche', value: profile.niche, icon: Briefcase, key: 'niche' }
          ].map((stat, i) => (
            <div key={i} className="bg-card p-6 rounded-lg border border-border text-center space-y-1 shadow-sm hover:border-muted-foreground/20 transition-colors">
              <div className="w-8 h-8 mx-auto rounded-lg bg-muted flex items-center justify-center mb-1">
                <stat.icon className="w-4 h-4 text-muted-foreground" />
              </div>
              {isEditing ? (
                <div className="relative">
                  {stat.key === 'platform' ? (
                    <Select value={editForm.platform} onValueChange={(v) => setEditForm({ ...editForm, platform: v })}>
                      <SelectTrigger className="h-7 text-[10px] font-bold">
                        <SelectValue placeholder="Platform" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="instagram">Instagram</SelectItem>
                        <SelectItem value="youtube">YouTube</SelectItem>
                        <SelectItem value="tiktok">TikTok</SelectItem>
                        <SelectItem value="twitter">Twitter/X</SelectItem>
                        <SelectItem value="linkedin">LinkedIn</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : stat.key === 'niche' ? (
                    <Select value={editForm.niche} onValueChange={(v) => setEditForm({ ...editForm, niche: v })}>
                      <SelectTrigger className="h-7 text-[10px] font-bold">
                        <SelectValue placeholder="Niche" />
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
                  ) : (
                    <Input 
                      value={editForm[stat.key]} 
                      onChange={(e) => setEditForm({...editForm, [stat.key]: e.target.value})} 
                      className="h-7 text-sm font-bold text-center px-1"
                    />
                  )}
                </div>
              ) : (
                <div className="text-xl font-bold text-foreground tracking-tight">{stat.value}</div>
              )}
              <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-12 mt-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            <section className="space-y-4">
              <div className="flex items-center gap-4">
                <h3 className="font-bold text-lg tracking-tight text-foreground text-left">Biography</h3>
                <div className="h-px flex-1 bg-border" />
              </div>
              <div className="p-6 bg-muted border border-border rounded-lg">
                {isEditing ? (
                  <Textarea 
                    value={editForm.bio} 
                    onChange={(e) => setEditForm({...editForm, bio: e.target.value})} 
                    className="min-h-[120px] text-sm font-medium leading-relaxed"
                    placeholder="Write your bio..."
                  />
                ) : (
                  <p className="text-foreground leading-relaxed whitespace-pre-wrap text-sm font-medium">
                    {profile.bio || "No bio information provided yet."}
                  </p>
                )}
              </div>
            </section>

            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <h3 className="font-bold text-lg tracking-tight text-foreground flex items-center gap-2">
                    Featured Reels <Badge variant="outline" className="rounded-full text-[10px] px-2 font-bold text-muted-foreground">{featuredReels.length}</Badge>
                  </h3>
                  <div className="h-px flex-1 bg-border" />
                </div>
                {isEditing && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setShowAddReel(!showAddReel)}
                    className="ml-4"
                  >
                    {showAddReel ? <X className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                    {showAddReel ? "Cancel" : "Add Reel"}
                  </Button>
                )}
              </div>

              {isEditing && showAddReel && (
                <Card className="border-dashed border-2 border-primary/20 bg-primary/5">
                  <CardContent className="p-6 space-y-4">
                    <div className="grid gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Video URL</label>
                        <Input 
                          placeholder="Instagram or TikTok reel URL" 
                          value={newReelUrl}
                          onChange={(e) => setNewReelUrl(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Title (Optional)</label>
                        <Input 
                          placeholder="Performance at..." 
                          value={newReelTitle}
                          onChange={(e) => setNewReelTitle(e.target.value)}
                        />
                      </div>
                    </div>
                    <Button 
                      className="w-full" 
                      onClick={handleAddReel}
                      disabled={addReel.isPending || !newReelUrl}
                    >
                      {addReel.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                      Add to Featured Reels
                    </Button>
                  </CardContent>
                </Card>
              )}

              {featuredReels.length === 0 ? (
                <div className="p-12 text-center bg-muted/30 border border-dashed border-border rounded-lg">
                  <Video className="w-8 h-8 mx-auto text-muted-foreground/30 mb-2" />
                  <p className="text-muted-foreground font-bold text-sm">No featured reels yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {featuredReels.map((reel: FeaturedReel) => (
                    <div key={reel.id} className="group relative aspect-[9/16] bg-secondary/30 rounded-2xl overflow-hidden shadow-lg border border-border/50 transition-all hover:scale-[1.02] hover:shadow-xl">
                      {/* Placeholder background with gradient */}
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-secondary/10" />
                      
                      <div className="absolute inset-0 flex flex-col items-center justify-center transition-all">
                        <div className="w-16 h-16 rounded-full bg-background/80 backdrop-blur-md flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                          <Play className="w-8 h-8 text-primary fill-primary/20 ml-1" />
                        </div>
                        <a 
                          href={reel.video_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="absolute inset-0 z-10"
                        />
                      </div>
                      
                      <div className="absolute bottom-0 inset-x-0 p-6 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-20">
                        <p className="text-white font-black text-base leading-tight mb-1 drop-shadow-sm">{reel.title || "Featured Reel"}</p>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-[9px] uppercase tracking-widest bg-white/10 text-white/80 border-white/20 px-2 py-0 border-none font-black italic">
                            Watch Now
                          </Badge>
                        </div>
                      </div>

                      {isEditing && (
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-3 right-3 h-9 w-9 opacity-0 group-hover:opacity-100 transition-all z-30 rounded-xl shadow-lg hover:rotate-6"
                          onClick={() => handleDeleteReel(reel.id)}
                          disabled={deleteReel.isPending}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg tracking-tight text-foreground flex items-center gap-2">
                  Recent Activity <Badge variant="outline" className="rounded-full text-[10px] px-2 font-bold text-muted-foreground">{userPosts.length}</Badge>
                </h3>
              </div>
              {userPosts.length === 0 ? (
                <div className="p-12 text-center bg-muted border border-dashed border-border rounded-lg">
                  <p className="text-muted-foreground font-bold text-sm">No posts yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {userPosts.map((post: Post) => (
                    <div key={post.id} className="p-6 bg-card rounded-lg border border-border hover:border-muted-foreground/20 transition-all shadow-sm group">
                      <div className="flex items-center gap-2 mb-4">
                        <Clock className="w-3.5 h-3.5 text-muted-foreground/50" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                          {new Date(post.created_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                      <p className="text-foreground text-sm leading-relaxed font-medium">{post.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Sidebar info */}
          <div className="space-y-8">
            <div className="sticky top-24 space-y-8">
              <Card className="border border-border shadow-sm bg-card rounded-xl overflow-hidden">
                <CardContent className="p-8 space-y-6">
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold tracking-tight text-foreground">
                      Work with {profile.full_name?.split(' ')[0]}
                    </h3>
                    <p className="text-xs text-muted-foreground font-medium tracking-tight">Available for collaboration</p>
                  </div>
                  
                  <div className="space-y-2">
                    {[
                      { label: 'Brand Partnerships', key: 'service_brand' },
                      { label: 'UGC Content Creation', key: 'service_ugc' },
                      { label: 'Public Appearances', key: 'service_appearances' }
                    ].map((service, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-muted border border-border">
                        <span className="font-semibold text-xs text-foreground/80">{service.label}</span>
                        {isEditing ? (
                          <Switch 
                            checked={!!editForm[service.key]} 
                            onCheckedChange={(val) => setEditForm({...editForm, [service.key]: val})}
                          />
                        ) : (
                          profile[service.key as keyof Profile] ? (
                            <Check className="w-3.5 h-3.5 text-primary" />
                          ) : (
                            <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">N/A</span>
                          )
                        )}
                      </div>
                    ))}
                  </div>

                  <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-10 rounded-lg font-bold text-sm shadow-sm transition-all">
                    Send Inquiry
                  </Button>
                </CardContent>
              </Card>

              <div className="p-8 bg-secondary/20 rounded-[2.5rem] border border-border/50 space-y-4">
                <h4 className="font-black text-sm uppercase tracking-widest text-muted-foreground">Networking</h4>
                <p className="text-sm font-bold text-foreground leading-relaxed italic opacity-60">
                  &ldquo;Expanding horizons through creative partnerships and authentic storytelling...&rdquo;
                </p>
                <Button variant="link" className="p-0 h-auto font-black text-primary text-xs uppercase tracking-widest">
                  Browse More Creators &rarr;
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};
