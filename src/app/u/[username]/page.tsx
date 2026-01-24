"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { ProfileUpdate } from "@/integrations/supabase/types";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Loader2, 
  Users, 
  Check,
  Camera,
  X,
  Save,
  Play,
  Trash2,
  Plus,
  Video,
  Edit,
  Twitter,
  Copy
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { SuggestCollabModal } from "@/components/collabs/SuggestCollabModal";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { BottomNav } from "@/components/dashboard/BottomNav";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { 
  Badge 
 } from "@/components/ui/badge";
 import { useProfile, useFollowStatus, useUpdateProfile, useUploadImage, useFeaturedReels, useManageFeaturedReels, usePastCollaborations, useManagePastCollaborations, useConnectionStatus, useIncrementStat } from "@/hooks/use-profile";
 import { useQueryClient, useMutation, UseMutationResult } from "@tanstack/react-query";
 import { useAuth } from "@/hooks/use-auth";
 import Image from "next/image";
 import { mapToDashboardProfile } from "@/lib/view-models";
 import { DashboardProfile, FeaturedReel, PastCollaboration } from "@/types/dashboard";
 import { Logo } from "@/components/brand/Logo";
import { Checkbox } from "@/components/ui/checkbox";



interface Profile extends DashboardProfile {
  join_date: string;
}


const PublicNavbar = ({ user }: { user: User | null }) => (
  <nav className="border-b border-slate-200/60 bg-white/70 backdrop-blur-md sticky top-0 z-50">
    <div className="container mx-auto px-6 h-16 flex items-center justify-between">
      <Link 
        href={user ? "/dashboard" : "/"} 
        className="flex items-center gap-2 group transition-all"
      >
        <Logo size={32} />
        <span className="text-xl font-bold tracking-tight text-slate-900">GRIFI</span>
      </Link>
      <div className="flex items-center gap-4">
        {user ? (
          <Link href="/dashboard">
            <Button variant="outline" className="rounded-full border-slate-200 hover:bg-slate-50 font-bold px-6">
              Dashboard
            </Button>
          </Link>
        ) : (
          <>
            <Link href="/auth">
              <Button variant="ghost" className="rounded-full text-sm font-medium">Log In</Button>
            </Link>
            <Link href="/auth?mode=signup">
              <Button className="rounded-full bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 text-sm font-bold px-6">
                Get Started
              </Button>
            </Link>
          </>
        )}
      </div>
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
    youtube_url: profileData.youtube_url || null,
    instagram_url: profileData.instagram_url || null,
    twitter_url: profileData.twitter_url || null,
    public_email: profileData.public_email || null,
    content_views: profileData.content_views || null,
    client_rating: profileData.client_rating || null,
  } as Profile : null;

  const incrementStat = useIncrementStat();

  const isOwnProfile = currentUser?.id === profile?.id;

  // Redirect to onboarding if this is user's own profile and it's incomplete
  useEffect(() => {
    if (currentUser && isOwnProfile && rawViewerProfile && !rawViewerProfile.onboarding_completed) {
      router.push("/dashboard/onboarding");
    }
  }, [currentUser, isOwnProfile, rawViewerProfile, router]);

  const { data: isFollowing } = useFollowStatus(currentUser?.id, profile?.id);
  const { data: connectionStatus, isLoading: loadingConnection } = useConnectionStatus(currentUser?.id, profile?.id);

  // Track page visit
  useEffect(() => {
    if (profileData && profileData.id && currentUser?.id !== profileData.id) {
      // Small debounce to avoid accidental double counts
      const timer = setTimeout(() => {
        incrementStat.mutate({ profileId: profileData.id, stat: 'page_visits' });
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [profileData?.id, currentUser?.id, incrementStat, profileData]);

  const { data: featuredReels = [] } = useFeaturedReels(profile?.id);
  const { addReel, deleteReel } = useManageFeaturedReels();
  const { data: pastCollaborations = [] } = usePastCollaborations(profile?.id);
  const { addCollaboration, deleteCollaboration } = useManagePastCollaborations();

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
    youtube_url: "",
    instagram_url: "",
    twitter_url: "",
    content_views: "",
    client_rating: "",
    public_email: "",
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
          youtube_url: profileData.youtube_url || "",
          instagram_url: profileData.instagram_url || "",
          twitter_url: profileData.twitter_url || "",
          content_views: (profileData as DashboardProfile).content_views || "5M+",
          client_rating: (profileData as DashboardProfile).client_rating || "4.9",
          public_email: profileData.public_email || "",
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
          youtube_url: editForm.youtube_url || null,
          instagram_url: editForm.instagram_url || null,
          twitter_url: editForm.twitter_url || null,
          public_email: editForm.public_email || null,
        } as ProfileUpdate,
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

  const handleImageUpload = async (file: File, type: string) => {
    if (!currentUser) return;
    
    // Choose bucket based on image type
    let bucket = "avatars";
    if (type === 'brand-logo') bucket = "brands";
    if (type === 'reel-thumbnail') bucket = "reels";

    return uploadImageMutation.mutateAsync({
      file,
      userId: currentUser.id,
      bucket,
      type
    }).then(({ publicUrl }) => {
      if (type === 'avatar') setEditForm(prev => ({ ...prev, avatar_url: publicUrl }));
      if (type === 'banner') setEditForm(prev => ({ ...prev, banner_url: publicUrl }));
      toast({ title: "Image uploaded successfully" });
      return publicUrl;
    });
  };

  if (loadingProfile) {
    return <PublicProfileSkeleton />;
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <PublicNavbar user={currentUser} />
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
    <div className="min-h-screen bg-[#F8F5F2]">
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
                connectionStatus={connectionStatus || null}
                loadingConnection={loadingConnection}
                followMutation={followMutation}
                featuredReels={featuredReels}
                addReel={addReel}
                deleteReel={deleteReel}
                pastCollaborations={pastCollaborations as PastCollaboration[]}
                addCollaboration={addCollaboration}
                deleteCollaboration={deleteCollaboration}
                isEditing={isEditing}
                setIsEditing={setIsEditing}
                editForm={editForm}
                setEditForm={setEditForm}
                handleSave={handleSave}
                saving={updateProfileMutation.isPending}
                handleImageUpload={handleImageUpload}
                toast={toast}
                incrementStat={incrementStat}
              />
            </main>

            <BottomNav className="lg:hidden" />
          </div>
        </div>
      ) : (
        <div className="flex flex-col min-h-screen bg-[#F8F5F2]">
          <PublicNavbar user={currentUser} />
          <ProfileContent
            profile={profile}
            isOwnProfile={isOwnProfile}
            isFollowing={!!isFollowing}
            connectionStatus={connectionStatus || null}
            loadingConnection={loadingConnection}
            followMutation={followMutation}
            featuredReels={featuredReels}
            addReel={addReel}
            deleteReel={deleteReel}
            pastCollaborations={pastCollaborations as PastCollaboration[]}
            addCollaboration={addCollaboration}
            deleteCollaboration={deleteCollaboration}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
            editForm={editForm}
            setEditForm={setEditForm}
            handleSave={handleSave}
            saving={updateProfileMutation.isPending}
            handleImageUpload={handleImageUpload}
            toast={toast}
            incrementStat={incrementStat}
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
  youtube_url: string;
  instagram_url: string;
  twitter_url: string;
  content_views: string;
  client_rating: string;
  public_email: string;
  [key: string]: string | boolean | null | undefined;
}

interface ProfileContentProps {
  profile: Profile;
  isOwnProfile: boolean;
  isEditing: boolean;
  setIsEditing: (val: boolean) => void;
  editForm: EditForm;
  setEditForm: (val: EditForm) => void;
  handleSave: () => Promise<void>;
  saving: boolean;
  handleImageUpload: (file: File, type: string) => Promise<string | void>;
  featuredReels: FeaturedReel[];
  addReel: UseMutationResult<FeaturedReel, Error, { profileId: string; videoUrl: string; title?: string; thumbnailUrl?: string }>;
  deleteReel: UseMutationResult<void, Error, { reelId: string; profileId: string }>;
  pastCollaborations: PastCollaboration[];
  addCollaboration: UseMutationResult<PastCollaboration, Error, { profileId: string; brandName: string; brandLogoUrl?: string }>;
  deleteCollaboration: UseMutationResult<void, Error, { collabId: string; profileId: string }>;
  toast: (options: { title?: string; description?: string; variant?: "default" | "destructive" }) => void;
  loadingConnection?: boolean;
  connectionStatus: string | null;
  isFollowing: boolean;
  followMutation: UseMutationResult<void, Error, void>;
  incrementStat: UseMutationResult<void, Error, { profileId: string; stat: 'page_visits' | 'email_copy_count' | 'insta_copy_count' | 'yt_copy_count' | 'twitter_copy_count' }>;
}

const ProfileContent = ({ 
  profile, 
  isOwnProfile, 
  isEditing,
  setIsEditing,
  editForm,
  setEditForm,
  handleSave,
  saving,
  handleImageUpload,
  featuredReels, 
  addReel, 
  deleteReel, 
  pastCollaborations,
  addCollaboration,
  deleteCollaboration,
  toast,
  loadingConnection,
  connectionStatus,
  incrementStat
}: ProfileContentProps) => {
  const [newReelUrl, setNewReelUrl] = useState("");
  const [newReelTitle, setNewReelTitle] = useState("");
  const [newReelThumbnail, setNewReelThumbnail] = useState("");
  const [showAddReel, setShowAddReel] = useState(false);

  const [newBrandName, setNewBrandName] = useState("");
  const [newBrandLogo, setNewBrandLogo] = useState("");
  const [showAddBrand, setShowAddBrand] = useState(false);

  const handleAddReel = async () => {
    if (!newReelUrl) return;
    try {
      await addReel.mutateAsync({
        profileId: profile.id,
        videoUrl: newReelUrl,
        title: newReelTitle,
        thumbnailUrl: newReelThumbnail
      });
      setNewReelUrl("");
      setNewReelTitle("");
      setNewReelThumbnail("");
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

  const internalHandleImageUpload = async (file: File, type: string) => {
    try {
      const publicUrl = await handleImageUpload(file, type);
      if (publicUrl && typeof publicUrl === 'string') {
        if (type === 'brand-logo') {
          setNewBrandLogo(publicUrl);
        } else if (type === 'reel-thumbnail') {
          setNewReelThumbnail(publicUrl);
        }
      }
    } catch (err: unknown) {
      const error = err as Error;
      console.error("Error uploading image:", error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload image. Please check if the storage bucket exists.",
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

  const handleAddCollaboration = async () => {
    if (!newBrandName) return;
    try {
      await addCollaboration.mutateAsync({
        profileId: profile.id,
        brandName: newBrandName,
        brandLogoUrl: newBrandLogo
      });
      setNewBrandName("");
      setNewBrandLogo("");
      setShowAddBrand(false);
      toast({
        title: "Brand added",
        description: "Your past collaboration has been added successfully."
      });
    } catch (error: unknown) {
      const err = error as Error;
      toast({
        title: "Error",
        description: err.message || "Failed to add brand",
        variant: "destructive"
      });
    }
  };

  const handleDeleteCollaboration = async (collabId: string) => {
    try {
      await deleteCollaboration.mutateAsync({ collabId, profileId: profile.id });
      toast({
        title: "Brand removed",
        description: "The brand has been removed from your profile."
      });
    } catch (error: unknown) {
      const err = error as Error;
      toast({
        title: "Error",
        description: err.message || "Failed to remove brand",
        variant: "destructive"
      });
    }
  };



  return (
    <main className="min-h-screen pb-20">
      {/* Centered Profile Header */}
      <section className="pt-12 md:pt-20 pb-12 px-4">
        <div className="container mx-auto max-w-2xl text-center space-y-8">
          {/* Avatar */}
          <div className="relative inline-block group">
            <div className="absolute -inset-1 bg-gradient-to-tr from-[#FF8A65]/20 to-transparent rounded-full blur-md opacity-50 transition-opacity group-hover:opacity-100" />
            <Avatar className="w-40 h-40 md:w-48 md:h-48 border-4 border-white shadow-xl relative z-10 transition-transform duration-500 group-hover:scale-[1.02]">
              <AvatarImage src={(isEditing ? editForm.avatar_url : profile.avatar_url) || undefined} alt={profile.full_name} className="object-cover" />
              <AvatarFallback className="text-4xl font-serif bg-[#F3EFEA] text-[#2D2D2D]">
                {profile.full_name?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            
            {isEditing && (
              <div 
                className="absolute inset-0 z-20 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                onClick={() => document.getElementById('avatar-upload')?.click()}
              >
                <Camera className="w-10 h-10 text-white" />
              </div>
            )}
            
            {!isEditing && profile.is_verified && (
              <div className="absolute bottom-2 right-2 md:bottom-4 md:right-4 z-20">
                <div className="bg-[#FF8A65] text-white p-2 rounded-full shadow-lg ring-4 ring-white">
                  <Check className="w-4 md:w-5 h-4 md:h-5 stroke-[3]" />
                </div>
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

          {/* Name & Headline */}
          <div className="space-y-4">
            {isEditing ? (
              <div className="max-w-md mx-auto space-y-4">
                <Input 
                  value={editForm.full_name} 
                  onChange={(e) => setEditForm({...editForm, full_name: e.target.value})} 
                  className="text-center font-serif text-3xl md:text-5xl border-none bg-white/50 focus:bg-white h-auto py-2"
                  placeholder="Your Name"
                />
                <div className="flex gap-2 justify-center">
                  <Badge variant="outline" className="font-sans font-medium bg-white/50 border-[#FF8A65]/20 text-[#2D2D2D]">
                    @{profile.username}
                  </Badge>
                </div>
                <div className="flex gap-4 justify-center pt-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#FF8A65]">Instagram</label>
                    <Input 
                      value={editForm.instagram_url || ""} 
                      onChange={(e) => setEditForm({...editForm, instagram_url: e.target.value})} 
                      className="h-8 text-xs bg-white/50 focus:bg-white border-[#FF8A65]/10"
                      placeholder="username"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#FF8A65]">YouTube</label>
                    <Input 
                      value={editForm.youtube_url || ""} 
                      onChange={(e) => setEditForm({...editForm, youtube_url: e.target.value})} 
                      className="h-8 text-xs bg-white/50 focus:bg-white border-[#FF8A65]/10"
                      placeholder="username"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#FF8A65]">Twitter</label>
                    <Input 
                      value={editForm.twitter_url || ""} 
                      onChange={(e) => setEditForm({...editForm, twitter_url: e.target.value})} 
                      className="h-8 text-xs bg-white/50 focus:bg-white border-[#FF8A65]/10"
                      placeholder="username"
                    />
                  </div>
                </div>
                <div className="flex gap-4 justify-center pt-2">
                  <div className="space-y-1 flex-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#FF8A65]">Location</label>
                    <Input 
                      value={editForm.location || ""} 
                      onChange={(e) => setEditForm({...editForm, location: e.target.value})} 
                      className="h-8 text-xs bg-white/50 focus:bg-white border-[#FF8A65]/10 text-center"
                      placeholder="Location"
                    />
                  </div>
                  <div className="space-y-1 flex-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#FF8A65]">Public Email</label>
                    <Input 
                      value={editForm.public_email || ""} 
                      onChange={(e) => setEditForm({...editForm, public_email: e.target.value})} 
                      className="h-8 text-xs bg-white/50 focus:bg-white border-[#FF8A65]/10 text-center"
                      placeholder="Email for enquiries"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <h1 className="text-5xl md:text-7xl font-serif tracking-tight text-[#2D2D2D] leading-tight">
                  {profile.full_name?.split(' ').map((part: string, i: number) => (
                    <span key={i} className={i === 1 ? "text-[#FF8A65]" : ""}>
                      {part}{i < (profile.full_name?.split(' ').length || 0) - 1 ? " " : ""}
                    </span>
                  ))}
                </h1>
                <p className="text-xs md:text-sm font-sans text-muted-foreground font-bold uppercase tracking-[0.3em]">
                  {profile.niche?.split(',')[0]} • CONTENT STRATEGIST
                </p>
                <p className="text-lg md:text-xl font-serif text-muted-foreground italic max-w-lg mx-auto leading-relaxed">
                  &quot;Crafting authentic stories that connect brands with their audience&quot;
                </p>
              </div>
            )}


          </div>

          <div className="flex flex-col items-center justify-center gap-6 pt-6">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {isOwnProfile ? (
                isEditing ? (
                  <div className="flex gap-2">
                    <Button 
                      onClick={handleSave} 
                      disabled={saving} 
                      className="bg-[#FF8A65] hover:bg-[#FF8A65]/90 text-white font-bold rounded-xl h-12 px-8 shadow-lg shadow-[#FF8A65]/20 transition-all hover:scale-105 active:scale-95"
                    >
                      {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                      Save Changes
                    </Button>
                    <Button 
                      onClick={() => setIsEditing(false)} 
                      variant="ghost" 
                      className="font-bold rounded-xl h-12 px-6"
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <Button onClick={() => setIsEditing(true)} variant="outline" className="font-bold rounded-xl h-12 px-10 border-[#FF8A65] text-[#FF8A65] hover:bg-[#FF8A65]/5 transition-all">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Portfolio
                  </Button>
                )
              ) : (
                <div className="flex flex-wrap items-center justify-center gap-4">
                  <SuggestCollabModal 
                    receiverId={profile.id} 
                    receiverName={profile.full_name}
                    trigger={
                      <Button 
                        className="bg-[#FF8A65] hover:bg-[#FF8A65]/90 text-white font-bold rounded-2xl h-14 px-10 text-base shadow-xl shadow-[#FF8A65]/20 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
                        disabled={loadingConnection || connectionStatus === 'accepted' || connectionStatus === 'pending'}
                      >
                        {loadingConnection ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                          <>
                            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                              <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                            </svg>
                            Work With Me
                          </>
                        )}
                      </Button>
                    }
                  />
                  
                  <Button 
                    variant="outline"
                    className="font-bold rounded-2xl h-14 px-10 text-base border-[#FF8A65] text-[#FF8A65] hover:bg-[#FF8A65]/5 transition-all"
                    asChild
                  >
                    <Link href="#portfolio">View Portfolio</Link>
                  </Button>
                </div>
              )}
            </div>

            {/* Social Icons Moved Here */}
            {!isEditing && (
              <div className="flex items-center justify-center gap-6 pt-2">
                {profile.instagram_url && (
                  <a 
                    href={profile.instagram_url.startsWith('http') ? profile.instagram_url : `https://instagram.com/${profile.instagram_url}`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="opacity-60 hover:opacity-100 transition-opacity"
                    onClick={() => incrementStat.mutate({ profileId: profile.id, stat: 'insta_copy_count' })}
                  >
                    <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.791-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.209-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                  </a>
                )}
                {profile.youtube_url && (
                  <a 
                    href={profile.youtube_url.startsWith('http') ? profile.youtube_url : `https://youtube.com/@${profile.youtube_url}`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="opacity-60 hover:opacity-100 transition-opacity"
                    onClick={() => incrementStat.mutate({ profileId: profile.id, stat: 'yt_copy_count' })}
                  >
                    <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                  </a>
                )}
                {profile.twitter_url && (
                  <a 
                    href={profile.twitter_url.startsWith('http') ? profile.twitter_url : `https://twitter.com/${profile.twitter_url}`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="opacity-60 hover:opacity-100 transition-opacity"
                    onClick={() => incrementStat.mutate({ profileId: profile.id, stat: 'twitter_copy_count' })}
                  >
                    <Twitter className="w-5 h-5 fill-current" />
                  </a>
                )}
              </div>
            )}

            {!isEditing && profile.public_email && (
              <div className="flex flex-col items-center gap-2 pt-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">For business enquiries:</p>
                <div className="flex items-center gap-2 bg-white/50 backdrop-blur-sm border border-[#FF8A65]/10 rounded-xl px-4 py-2 group hover:bg-white transition-colors">
                  <span className="text-sm font-medium text-[#2D2D2D]">{profile.public_email}</span>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(profile.public_email!);
                      incrementStat.mutate({ profileId: profile.id, stat: 'email_copy_count' });
                      toast({ title: "Email copied", description: "Email address copied to clipboard" });
                    }}
                    className="p-1 hover:text-[#FF8A65] transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>


        {/* Content Sections */}
        <div className="container mx-auto max-w-4xl space-y-24 px-4 pt-12">
          
          {/* About Section */}
          <section className="text-center space-y-8">
            <div className="space-y-4">
              <h3 className="text-[#FF8A65] text-[10px] md:text-xs font-bold uppercase tracking-[0.3em] font-sans">ABOUT ME</h3>
              <h2 className="text-4xl md:text-6xl font-serif text-[#2D2D2D] leading-tight max-w-2xl mx-auto">
                Creating Content That <span className="text-[#FF8A65]">Converts</span>
              </h2>
            </div>
            
            <div className="max-w-2xl mx-auto space-y-6">
              {isEditing ? (
                <Textarea 
                  value={editForm.bio} 
                  onChange={(e) => setEditForm({...editForm, bio: e.target.value})} 
                  className="min-h-[150px] text-lg leading-relaxed font-sans border-[#FF8A65]/20 bg-white/50 focus:bg-white text-center rounded-2xl"
                  placeholder="Tell your story..."
                />
              ) : (
                <div className="space-y-6">
                  <div className="text-lg md:text-xl text-muted-foreground/70 leading-relaxed font-sans font-normal whitespace-pre-wrap max-w-xl mx-auto">
                    {profile.bio || (
                      <>
                        <p className="mb-6">Hey there! I&apos;m Sarah, a passionate UGC creator based in Los Angeles with over 3 years of experience helping brands tell their stories through authentic, engaging content.</p>
                        <p>From lifestyle and beauty to tech and wellness, I specialize in creating scroll-stopping content that resonates with your target audience and drives real results.</p>
                      </>
                    )}
                  </div>
                  <p className="text-lg md:text-xl font-bold text-[#2D2D2D] flex items-center justify-center gap-2">
                    <span className="text-[#FF8A65] text-xl">✨</span> Let&apos;s create something amazing together.
                  </p>
                </div>
              )}
            </div>

            {/* Niche Tags */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-6">
              {profile.niche && profile.niche.split(',').map((tag: string, i: number) => (
                <Badge 
                  key={i} 
                  variant="default" 
                  className="px-6 py-2 rounded-full bg-[#EAE8E4] hover:bg-[#E2E0DC] text-[#2D2D2D] text-[13px] font-medium border-none transition-colors"
                >
                  {tag.trim()}
                </Badge>
              ))}
              {isEditing && (
                <div className="w-full max-w-xs mx-auto mt-4">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[#FF8A65] mb-2 block">Edit Niches (comma separated)</label>
                  <Input 
                    value={editForm.niche} 
                    onChange={(e) => setEditForm({...editForm, niche: e.target.value})} 
                    className="h-8 text-xs bg-white/50 border-[#FF8A65]/10 text-center"
                    placeholder="Beauty, Lifestyle, Tech"
                  />
                </div>
              )}
            </div>
          </section>

          {/* Stats Banner Section */}
          <section className="w-screen relative left-[50%] right-[50%] ml-[-50vw] mr-[-50vw] bg-[#1E1E1C] py-16 md:py-24 my-12 overflow-hidden">
            <div className="container mx-auto max-w-5xl px-4 relative z-10">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-12 md:gap-4">
                {/* Followers */}
                <div className="text-center space-y-3">
                  {isEditing ? (
                    <div className="space-y-1">
                      <Input 
                        value={editForm.followers} 
                        onChange={(e) => setEditForm({...editForm, followers: e.target.value})} 
                        className="text-4xl font-serif text-white bg-white/5 border-white/10 text-center h-auto py-2"
                      />
                      <div className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Followers</div>
                    </div>
                  ) : (
                    <>
                      <div className="text-5xl md:text-6xl font-serif text-white tracking-tighter">
                        {profile.followers}
                      </div>
                      <div className="text-xs md:text-sm text-white/40 font-bold uppercase tracking-[0.25em]">Followers</div>
                    </>
                  )}
                </div>

                {/* Brand Collabs */}
                <div className="text-center space-y-3">
                  <div className="text-5xl md:text-6xl font-serif text-white tracking-tighter">
                    {pastCollaborations.length > 0 ? `${pastCollaborations.length}+` : "0"}
                  </div>
                  <div className="text-xs md:text-sm text-white/40 font-bold uppercase tracking-[0.25em]">Brand Collabs</div>
                </div>

                {/* Content Views */}
                <div className="text-center space-y-3">
                  {isEditing ? (
                    <div className="space-y-1">
                      <Input 
                        value={editForm.content_views} 
                        onChange={(e) => setEditForm({...editForm, content_views: e.target.value})} 
                        className="text-4xl font-serif text-white bg-white/5 border-white/10 text-center h-auto py-2"
                        placeholder="5M+"
                      />
                      <div className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Content Views</div>
                    </div>
                  ) : (
                    <>
                      <div className="text-5xl md:text-6xl font-serif text-white tracking-tighter">
                        {editForm.content_views || "5M+"}
                      </div>
                      <div className="text-xs md:text-sm text-white/40 font-bold uppercase tracking-[0.25em]">Content Views</div>
                    </>
                  )}
                </div>

                {/* Client Rating */}
                <div className="text-center space-y-3">
                  {isEditing ? (
                    <div className="space-y-1">
                      <Input 
                        value={editForm.client_rating} 
                        onChange={(e) => setEditForm({...editForm, client_rating: e.target.value})} 
                        className="text-4xl font-serif text-white bg-white/5 border-white/10 text-center h-auto py-2"
                        placeholder="4.9"
                      />
                      <div className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Client Rating</div>
                    </div>
                  ) : (
                    <>
                      <div className="text-5xl md:text-7xl font-serif text-white tracking-tighter">
                        {editForm.client_rating || "4.9"}
                        <span className="text-[#FF8A65] ml-1">★</span>
                      </div>
                      <div className="text-xs md:text-sm text-white/40 font-bold uppercase tracking-[0.25em]">Client Rating</div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Services Pill Section */}
          <section className="flex flex-wrap items-center justify-center gap-2 -mt-6 relative z-20">
            {[
              { label: 'Brand Partnerships', key: 'service_brand' },
              { label: 'UGC Creation', key: 'service_ugc' },
              { label: 'Performances', key: 'service_appearances' }
            ].map((service, idx) => (
              <Badge 
                key={idx} 
                variant={profile[service.key as keyof Profile] ? "default" : "outline"}
                className={cn(
                  "px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-sm border-2",
                  profile[service.key as keyof Profile] 
                    ? "bg-[#FF8A65] text-white border-[#FF8A65] hover:bg-[#FF8A65]/90" 
                    : "bg-white text-muted-foreground border-border/50 opacity-60"
                )}
              >
                {service.label}
                {isEditing && (
                  <Checkbox 
                    checked={!!editForm[service.key]} 
                    onCheckedChange={(val: boolean | "indeterminate") => setEditForm({...editForm, [service.key]: val === true})}
                    className="ml-3 h-4 w-4 border-white/50"
                  />
                )}
              </Badge>
            ))}
          </section>

          {/* Worked With Section */}
          <section className="space-y-8 text-center">
            <h2 className="text-2xl font-serif text-[#2D2D2D]">Trusted By</h2>
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 opacity-70 grayscale hover:grayscale-0 transition-all duration-700">
              {pastCollaborations.length > 0 ? (
                pastCollaborations.map((collab: PastCollaboration) => (
                  <div key={collab.id} className="relative group">
                    {collab.brand_logo_url ? (
                      <div className="w-16 h-16 md:w-20 md:h-20 flex items-center justify-center">
                        <Image 
                          src={collab.brand_logo_url} 
                          alt={collab.brand_name} 
                          width={80} 
                          height={80} 
                          className="object-contain transition-transform group-hover:scale-110" 
                        />
                      </div>
                    ) : (
                      <span className="text-lg font-bold text-[#2D2D2D] tracking-tight">{collab.brand_name}</span>
                    )}
                    {isEditing && (
                      <button 
                        onClick={() => handleDeleteCollaboration(collab.id)}
                        className="absolute -top-2 -right-2 bg-destructive text-white rounded-full p-1 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground italic">Ready for new partnerships</p>
              )}
            </div>
            {isEditing && (
              <div className="space-y-6 max-w-lg mx-auto pt-8">
                {showAddBrand ? (
                  <div className="p-6 bg-white rounded-3xl border border-[#FF8A65]/20 shadow-sm space-y-4">
                    <div className="space-y-2 text-left">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-[#FF8A65]">Brand Name</label>
                      <Input 
                        value={newBrandName} 
                        onChange={(e) => setNewBrandName(e.target.value)}
                        placeholder="e.g. Nike"
                        className="rounded-xl border-[#FF8A65]/10"
                      />
                    </div>
                    <div className="space-y-2 text-left">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-[#FF8A65]">Brand Logo</label>
                      <div className="flex gap-4 items-center">
                        <Button
                          variant="outline"
                          onClick={() => document.getElementById('brand-logo-upload')?.click()}
                          className="rounded-xl border-[#FF8A65]/10"
                        >
                           <Camera className="w-4 h-4 mr-2" />
                           Upload Logo
                        </Button>
                        {newBrandLogo && <div className="text-xs text-muted-foreground truncate">Logo uploaded</div>}
                      </div>
                      <input 
                        type="file" 
                        id="brand-logo-upload" 
                        className="hidden" 
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) internalHandleImageUpload(file, 'brand-logo');
                        }}
                      />
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button 
                        onClick={handleAddCollaboration}
                        className="flex-1 bg-[#FF8A65] hover:bg-[#FF8A65]/90 text-white rounded-xl font-bold"
                        disabled={!newBrandName}
                      >
                        Add Brand
                      </Button>
                      <Button 
                        variant="ghost" 
                        onClick={() => setShowAddBrand(false)}
                        className="rounded-xl"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setShowAddBrand(true)} 
                    className="text-[#FF8A65] font-bold"
                  >
                    <Plus className="w-4 h-4 mr-2" /> Add Brand
                  </Button>
                )}
              </div>
            )}
          </section>

          {/* Portfolio Grid */}
          <section className="space-y-12">
            <div className="text-center space-y-4">
              <h2 className="text-4xl font-serif text-[#2D2D2D]">Portfolio</h2>
              <p className="text-muted-foreground font-medium uppercase tracking-[0.2em] text-xs">A selection of my recent work</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredReels.length > 0 ? (
                featuredReels.map((reel: FeaturedReel) => (
                  <div key={reel.id} className="group relative aspect-[4/5] bg-white rounded-[2rem] overflow-hidden shadow-xl shadow-[#FF8A65]/5 transition-all hover:-translate-y-2 hover:shadow-2xl hover:shadow-[#FF8A65]/10">
                    <Image 
                      src={reel.thumbnail_url || ""} 
                      alt={reel.title || "Portfolio item"} 
                      fill 
                      className="object-cover transition-transform duration-700 group-hover:scale-110" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100">
                      <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30">
                        <Play className="w-6 h-6 fill-current ml-1" />
                      </div>
                    </div>
                    <a href={reel.video_url} target="_blank" rel="noopener noreferrer" className="absolute inset-0 z-10" />
                    
                    <div className="absolute bottom-6 left-6 right-6 translate-y-4 group-hover:translate-y-0 transition-transform">
                      <p className="text-[#FF8A65] text-[10px] font-bold uppercase tracking-widest mb-1">FASHION</p>
                      <p className="text-white font-serif text-2xl">{reel.title || "Project Title"}</p>
                    </div>

                    {isEditing && (
                      <button 
                        onClick={() => handleDeleteReel(reel.id)}
                        className="absolute top-4 right-4 bg-white/20 backdrop-blur-md text-white rounded-full p-2 hover:bg-destructive transition-colors z-20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <div className="md:col-span-3 h-64 border-2 border-dashed border-[#FF8A65]/10 rounded-[2rem] flex flex-col items-center justify-center text-muted-foreground space-y-4">
                  <Video className="w-10 h-10 opacity-20" />
                  <p className="font-serif">No projects showcase yet</p>
                </div>
              )}
              {isEditing && (
                showAddReel ? (
                  <div className="aspect-[4/5] p-6 bg-white rounded-[2rem] border-2 border-[#FF8A65]/20 shadow-sm flex flex-col justify-between">
                    <div className="space-y-4">
                      <div className="space-y-1 text-left">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-[#FF8A65]">Project Title</label>
                        <Input 
                          value={newReelTitle} 
                          onChange={(e) => setNewReelTitle(e.target.value)}
                          placeholder="My Creative Work"
                          className="h-8 text-xs rounded-lg border-[#FF8A65]/10"
                        />
                      </div>
                      <div className="space-y-1 text-left">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-[#FF8A65]">Video URL</label>
                        <Input 
                          value={newReelUrl} 
                          onChange={(e) => setNewReelUrl(e.target.value)}
                          placeholder="https://..."
                          className="h-8 text-xs rounded-lg border-[#FF8A65]/10"
                        />
                      </div>
                      <div className="space-y-1 text-left">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-[#FF8A65]">Thumbnail</label>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full h-8 text-[10px] font-bold uppercase tracking-widest rounded-lg border-[#FF8A65]/10"
                          onClick={() => document.getElementById('reel-thumb-upload')?.click()}
                        >
                           <Camera className="w-3 h-3 mr-2" />
                           Upload Cover
                        </Button>
                        <input 
                          type="file" 
                          id="reel-thumb-upload" 
                          className="hidden" 
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) internalHandleImageUpload(file, 'reel-thumbnail');
                          }}
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm"
                        onClick={handleAddReel}
                        className="flex-1 bg-[#FF8A65] hover:bg-[#FF8A65]/90 text-white rounded-xl font-bold text-[10px] h-10 uppercase tracking-widest"
                        disabled={!newReelUrl}
                      >
                        Save
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setShowAddReel(false)}
                        className="rounded-xl text-[10px] uppercase tracking-widest h-10"
                      >
                        X
                      </Button>
                    </div>
                  </div>
                ) : (
                  <button 
                    onClick={() => setShowAddReel(true)}
                    className="aspect-[4/5] border-2 border-dashed border-[#FF8A65]/20 rounded-[2rem] flex flex-col items-center justify-center text-[#FF8A65] hover:bg-[#FF8A65]/5 transition-all"
                  >
                    <Plus className="w-8 h-8 mb-2" />
                    <span className="font-bold text-sm uppercase tracking-widest">Add Project</span>
                  </button>
                )
              )}
            </div>
          </section>

          {/* Services Section */}
          <section className="space-y-12 pb-20">
            <div className="text-center space-y-4">
              <h3 className="text-[#FF8A65] text-xs font-bold uppercase tracking-[0.3em] font-sans">SERVICES</h3>
              <h2 className="text-4xl md:text-5xl font-serif text-[#2D2D2D]">What I <span className="text-[#FF8A65]">Offer</span></h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <div className="bg-white/40 p-10 rounded-[2.5rem] border border-[#FF8A65]/5 space-y-6">
                <div className="w-16 h-16 bg-[#FF8A65]/10 rounded-2xl flex items-center justify-center text-[#FF8A65]">
                  <Video className="w-8 h-8" />
                </div>
                <div className="space-y-3">
                  <h4 className="text-2xl font-serif text-[#2D2D2D]">Video Content</h4>
                  <p className="text-muted-foreground leading-relaxed font-sans font-medium text-sm">
                    Engaging short-form videos optimized for TikTok, Instagram Reels, and YouTube Shorts.
                  </p>
                </div>
              </div>

              <div className="bg-white/40 p-10 rounded-[2.5rem] border border-[#FF8A65]/5 space-y-6">
                <div className="w-16 h-16 bg-[#FF8A65]/10 rounded-2xl flex items-center justify-center text-[#FF8A65]">
                  <Camera className="w-8 h-8" />
                </div>
                <div className="space-y-3">
                  <h4 className="text-2xl font-serif text-[#2D2D2D]">Photo Content</h4>
                  <p className="text-muted-foreground leading-relaxed font-sans font-medium text-sm">
                    High-quality lifestyle and product photography for your brand&apos;s digital presence.
                  </p>
                </div>
              </div>
            </div>
          </section>
          
          {/* Footer Branding */}
          <section className="pt-20 pb-12 text-center border-t border-[#FF8A65]/10">
            <div className="inline-flex items-center gap-3 mb-6">
              <Logo size={40} />
              <span className="font-serif text-2xl text-[#2D2D2D]">Grifi</span>
            </div>
            <p className="text-sm text-muted-foreground font-medium uppercase tracking-widest max-w-sm mx-auto">
              Building the next generation of creative identities
            </p>
          </section>
        </div>
      </main>
    );
  };
