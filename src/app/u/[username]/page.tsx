"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
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
  Check
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { User as SupabaseUser } from "@supabase/supabase-js";
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
import { useProfile, useUserPosts, useFollowStatus } from "@/hooks/use-profile";
import { useQueryClient, useMutation } from "@tanstack/react-query";

interface Profile {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string;
  bio: string;
  niche: string;
  platform: string;
  followers: string;
  engagement_rate: string;
  location: string;
  website: string;
  join_date: string;
  banner_url?: string;
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

export default function PublicProfilePage() {
  const params = useParams();
  const username = params.username as string;
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [currentUser, setCurrentUser] = useState<SupabaseUser | null>(null);
  const [viewerProfile, setViewerProfile] = useState<any>(null);
  const [viewerRole, setViewerRole] = useState<string | null>(null);

  // Queries
  const { data: profileData, isLoading: loadingProfile } = useProfile(username);
  const profile: Profile | null = profileData ? {
    id: profileData.id,
    username: profileData.username || username,
    full_name: profileData.full_name || username,
    avatar_url: profileData.avatar_url,
    bio: profileData.bio || "No bio yet.",
    niche: profileData.niche || "General",
    followers: profileData.followers || "0",
    platform: profileData.platform || "None",
    engagement_rate: profileData.engagement_rate || profileData.engagementRate || "0",
    location: profileData.location || "Earth",
    website: profileData.website,
    join_date: profileData.created_at || new Date().toISOString(),
    banner_url: profileData.banner_url,
  } : null;

  const { data: userPosts = [] } = useUserPosts(profile?.id);
  
  useEffect(() => {
    const fetchViewerData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setCurrentUser(session.user);
        setViewerRole(session.user.user_metadata?.role || "influencer");
        const { data: vProfile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();
        if (vProfile) setViewerProfile(vProfile);
      }
    };
    fetchViewerData();
  }, []);

  const isOwnProfile = currentUser?.id === profile?.id;
  const { data: isFollowing } = useFollowStatus(currentUser?.id, profile?.id);

  // Mutations
  const followMutation = useMutation({
    mutationFn: async () => {
      if (!currentUser || !profile) return;
      if (isFollowing) {
        const { error } = await supabase
          .from("follows" as any)
          .delete()
          .eq("follower_id", currentUser.id)
          .eq("following_id", profile.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("follows" as any)
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
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Something went wrong.",
        variant: "destructive"
      });
    }
  });

  const ProfileContent = () => {
    if (!profile) return null;
    return (
      <main className="min-h-screen bg-muted/50 pb-20">
        {/* Muted Banner Section */}
        <section className="relative h-48 md:h-64 overflow-hidden bg-muted border-b border-border">
          {profile.banner_url ? (
            <img 
              src={profile.banner_url} 
              alt="Profile Banner" 
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-muted/30" />
          )}
          
          {isOwnProfile && (
            <Button 
              onClick={() => router.push("/dashboard/profile")} 
              variant="outline" 
              size="sm" 
              className="absolute top-4 right-4 bg-background/80 backdrop-blur-sm shadow-sm"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Banner
            </Button>
          )}
        </section>

        {/* Profile Header Card (Floating & Centered) */}
        <div className="container mx-auto px-4 max-w-4xl relative">
          <Card className="border border-border shadow-sm -mt-20 relative z-10 overflow-visible bg-card rounded-xl">
            <CardContent className="pt-0 pb-10 px-6 md:px-12 text-center">
              {/* Centered Avatar */}
              <div className="relative -mt-16 mb-6 inline-block">
                <Avatar className="w-32 h-32 border-4 border-background shadow-md ring-1 ring-border relative z-10">
                  <AvatarImage src={profile.avatar_url} alt={profile.full_name} className="object-cover" />
                  <AvatarFallback className="text-3xl font-semibold bg-muted text-muted-foreground">
                    {profile.full_name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 z-20">
                  <Badge className="bg-primary text-primary-foreground border-none px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                    <Star className="w-3 h-3 fill-primary-foreground" />
                    <span className="font-semibold text-[10px]">Verified</span>
                  </Badge>
                </div>
              </div>

              {/* Name & Username */}
              <div className="space-y-1 mb-8">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                  {profile.full_name}
                </h1>
                <p className="text-sm text-muted-foreground font-medium">@{profile.username}</p>
                
                <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 pt-3">
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
                </div>
              </div>

              {/* Primary Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                {isOwnProfile ? (
                  <Button onClick={() => router.push("/dashboard/profile")} variant="outline" className="w-full sm:w-auto font-semibold rounded-lg h-10 px-6">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
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
                <Button variant="ghost" size="icon" className="h-10 w-10 border border-border hover:bg-muted rounded-lg text-muted-foreground">
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Stats Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            {[
              { label: 'Followers', value: profile.followers, icon: Users },
              { label: 'Engagement', value: `${profile.engagement_rate}%`, icon: Star },
              { label: 'Platform', value: profile.platform, icon: Share2 },
              { label: 'Niche', value: profile.niche, icon: Briefcase }
            ].map((stat, i) => (
              <div key={i} className="bg-card p-6 rounded-lg border border-border text-center space-y-1 shadow-sm hover:border-muted-foreground/20 transition-colors">
                <div className="w-8 h-8 mx-auto rounded-lg bg-muted flex items-center justify-center mb-1">
                  <stat.icon className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="text-xl font-bold text-foreground tracking-tight">{stat.value}</div>
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
                  <p className="text-foreground leading-relaxed whitespace-pre-wrap text-sm font-medium">
                    {profile.bio || "No bio information provided yet."}
                  </p>
                </div>
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
                    {userPosts.map((post: any) => (
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
                        { label: 'Brand Partnerships', active: true },
                        { label: 'UGC Content Creation', active: true },
                        { label: 'Public Appearances', active: false }
                      ].map((service, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-muted border border-border">
                          <span className="font-semibold text-xs text-foreground/80">{service.label}</span>
                          {service.active ? (
                            <Check className="w-3.5 h-3.5 text-primary" />
                          ) : (
                            <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">N/A</span>
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

  if (loadingProfile) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center animate-bounce shadow-xl shadow-primary/20">
          <span className="text-primary-foreground font-bold text-2xl">G</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground animate-pulse">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm font-medium">Loading profile...</span>
        </div>
      </div>
    );
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
              <ProfileContent />
            </main>

            <BottomNav role={viewerRole} className="lg:hidden" />
          </div>
        </div>
      ) : (
        <div className="flex flex-col min-h-screen">
          <PublicNavbar />
          <ProfileContent />
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
