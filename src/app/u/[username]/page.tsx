"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Loader2, MapPin, Link as LinkIcon, Calendar, Edit, MessageCircle, Share2, Briefcase, Users, Star, UserPlus, UserMinus, Clock } from "lucide-react";
import { Navbar } from "@/components/dashboard/Navbar";
import { useToast } from "@/hooks/use-toast";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { SuggestCollabModal } from "@/components/collabs/SuggestCollabModal";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { BottomNav } from "@/components/dashboard/BottomNav";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import Link from "next/link";
import { cn } from "@/lib/utils";

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
}

export default function PublicProfilePage() {
  const params = useParams();
  const username = params.username as string;
  const router = useRouter();
  const { toast } = useToast();
  
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<SupabaseUser | null>(null);
  const [viewerProfile, setViewerProfile] = useState<any>(null);
  const [viewerRole, setViewerRole] = useState<string | null>(null);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [userPosts, setUserPosts] = useState<any[]>([]);
  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => {
    const fetchProfileAndUser = async () => {
      try {
        setLoading(true);
        
        // 1. Get current session
        const { data: { session } } = await supabase.auth.getSession();
        setCurrentUser(session?.user ?? null);

        // 2. Fetch public profile
        // Note: We're selecting * to get all fields. 
        // Ensure your 'profiles' table has these fields or adjust accordingly.
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("username", username)
          .single();

        if (error) {
          throw error;
        }

        if (data) {
          // Normalize data structure if needed
          setProfile({
            id: data.id,
            username: data.username || username,
            full_name: data.full_name || username,
            avatar_url: data.avatar_url,
            bio: data.bio || "No bio yet.",
            niche: data.niche || "General",
            followers: data.followers || "0",
            platform: data.platform || "None",
            engagement_rate: data.engagement_rate || data.engagementRate || "0",
            location: data.location || "Earth",
            website: data.website,
            join_date: data.created_at || new Date().toISOString(),
          });

          // Check ownership
          if (session?.user?.id === data.id) {
            setIsOwnProfile(true);
          }
        }

        // 3. If logged in, fetch viewer's profile
        if (session?.user) {
          setViewerRole(session.user.user_metadata?.role || "influencer");
          const { data: vProfile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .single();
          if (vProfile) setViewerProfile(vProfile);
        }

      } catch (error: any) {
        console.error("Error fetching profile:", error);
        toast({
          title: "Profile not found",
          description: "We couldn't find a user with that username.",
          variant: "destructive",
        });
        // Optionally redirect or show 404 state
      } finally {
        setLoading(false);
      }
    };

    const fetchPosts = async (userId: string) => {
      try {
        const { data, error } = await supabase
          .from("posts" as any)
          .select("*")
          .eq("author_id", userId)
          .order("created_at", { ascending: false });
        if (!error && data) setUserPosts(data);
      } catch (err) {
        console.error("Error fetching user posts:", err);
      }
    };

    const fetchFollowingStatus = async (currentUserId: string, profileUserId: string) => {
      try {
        const { data, error } = await supabase
          .from("follows" as any)
          .select("id")
          .eq("follower_id", currentUserId)
          .eq("following_id", profileUserId)
          .maybeSingle();
        if (!error && data) setIsFollowing(true);
      } catch (err) {
        console.error("Error fetching following status:", err);
      }
    };

    if (username) {
      fetchProfileAndUser().then(async () => {
        // We need the profile ID from fetchProfileAndUser
      });
    }
  }, [username, toast]);

  // Nested useEffect to handle secondary fetches once profile is loaded
  useEffect(() => {
    if (profile && currentUser) {
      if (!isOwnProfile) {
        fetchFollowingStatus(currentUser.id, profile.id);
      }
      fetchPosts(profile.id);
    } else if (profile) {
      fetchPosts(profile.id);
    }
  }, [profile, currentUser, isOwnProfile]);

  const fetchPosts = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("posts" as any)
        .select("*")
        .eq("author_id", userId)
        .order("created_at", { ascending: false });
      if (!error && data) setUserPosts(data);
    } catch (err) {
      console.error("Error fetching user posts:", err);
    }
  };

  const fetchFollowingStatus = async (currentUserId: string, profileUserId: string) => {
    try {
      const { data, error } = await supabase
        .from("follows" as any)
        .select("id")
        .eq("follower_id", currentUserId)
        .eq("following_id", profileUserId)
        .maybeSingle();
      setIsFollowing(!!data);
    } catch (err) {
      console.error("Error fetching following status:", err);
    }
  };

  const handleFollow = async () => {
    if (!currentUser) {
      toast({
        title: "Login required",
        description: "You need to be logged in to follow users.",
      });
      return;
    }

    setFollowLoading(true);
    try {
      if (isFollowing) {
        const { error } = await supabase
          .from("follows" as any)
          .delete()
          .eq("follower_id", currentUser.id)
          .eq("following_id", profile?.id);
        if (error) throw error;
        setIsFollowing(false);
        toast({ title: "Unfollowed", description: `You are no longer following @${profile?.username}` });
      } else {
        const { error } = await supabase
          .from("follows" as any)
          .insert({
            follower_id: currentUser.id,
            following_id: profile?.id
          });
        if (error) throw error;
        setIsFollowing(true);
        toast({ title: "Following", description: `You are now following @${profile?.username}` });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Something went wrong.",
        variant: "destructive"
      });
    } finally {
      setFollowLoading(false);
    }
  };

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

  const ProfileContent = () => {
    if (!profile) return null;
    return (
      <main className="container mx-auto px-4 py-8 lg:py-12 max-w-5xl">
        {/* Profile Header Card */}
        <Card className="overflow-hidden border-none shadow-sm mb-8 bg-card/50 backdrop-blur-sm">
          <div className="h-40 md:h-64 bg-gradient-to-br from-primary/5 via-primary/10 to-primary/20 relative">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
          </div>
          <CardContent className="px-6 pb-8 relative">
            <div className="-mt-20 md:-mt-24 mb-6 flex flex-col md:flex-row items-center md:items-end gap-6 text-center md:text-left">
              <Avatar className="w-40 h-40 border-8 border-background shadow-xl ring-1 ring-border/50">
                <AvatarImage src={profile.avatar_url} alt={profile.full_name} className="object-cover" />
                <AvatarFallback className="text-4xl font-bold bg-secondary text-primary">
                  {profile.full_name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 space-y-2 pb-2">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                  <h1 className="text-3xl md:text-4xl font-black tracking-tight">{profile.full_name}</h1>
                  <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 px-3 flex items-center gap-1.5 py-1">
                    <Star className="w-3.5 h-3.5 fill-primary" /> Verified Creator
                  </Badge>
                </div>
                <p className="text-lg text-muted-foreground font-semibold">@{profile.username}</p>
                
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-4 gap-y-2 text-sm text-muted-foreground pt-2">
                  <span className="flex items-center gap-1.5 bg-secondary/50 px-2.5 py-1 rounded-full border border-border/50">
                    <MapPin className="w-3.5 h-3.5" /> {profile.location}
                  </span>
                  {profile.website && (
                    <a href={profile.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-primary hover:text-primary/80 font-medium transition-colors">
                      <LinkIcon className="w-3.5 h-3.5" /> Website
                    </a>
                  )}
                  <span className="flex items-center gap-1.5 opacity-70">
                    <Calendar className="w-3.5 h-3.5" /> Joined {new Date(profile.join_date).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-3 w-full md:w-auto pt-6 md:pt-0">
                <div className="flex items-center gap-2">
                  {isOwnProfile ? (
                    <Button onClick={() => router.push("/dashboard/profile")} variant="outline" className="flex-1 md:flex-none font-bold rounded-xl h-11 border-primary/20 hover:bg-primary/5">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                  ) : (
                    <>
                      <Button 
                        variant={isFollowing ? "secondary" : "default"} 
                        className={cn(
                          "flex-1 md:flex-none font-bold rounded-xl h-11 px-8 shadow-lg shadow-primary/10",
                          isFollowing && "bg-secondary hover:bg-secondary/80 border-border"
                        )}
                        onClick={handleFollow}
                        disabled={followLoading}
                      >
                        {followLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin text-primary" />
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
                          <Button variant="outline" className="flex-1 md:flex-none font-bold rounded-xl h-11 border-primary/20 hover:bg-primary/5">
                            Connect
                          </Button>
                        }
                      />
                    </>
                  )}
                  <Button variant="ghost" size="icon" className="h-11 w-11 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors">
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="mt-8 p-6 bg-secondary/20 rounded-2xl border border-border/50">
              <h3 className="font-bold text-sm uppercase tracking-widest text-muted-foreground mb-3">About</h3>
              <p className="text-foreground leading-relaxed whitespace-pre-wrap text-lg">
                {profile.bio || "No bio information provided yet."}
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content Column */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Detailed Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Followers', value: profile.followers, icon: Users, color: 'blue' },
                { label: 'Engagement', value: `${profile.engagement_rate}%`, icon: Star, color: 'amber' },
                { label: 'Platform', value: profile.platform, icon: Share2, color: 'purple' },
                { label: 'Niche', value: profile.niche, icon: Briefcase, color: 'green' }
              ].map((stat, i) => (
                <Card key={i} className="border-none shadow-sm bg-card/40 hover:bg-card/60 transition-colors group overflow-hidden">
                  <div className={cn("h-1 w-full bg-primary/20 group-hover:bg-primary/40 transition-colors")} />
                  <CardContent className="pt-6 pb-6 text-center">
                    <div className="text-2xl font-black text-foreground mb-1">{stat.value}</div>
                    <div className="text-[10px] text-muted-foreground uppercase font-black tracking-widest flex items-center justify-center gap-1.5">
                      <stat.icon className="w-3 h-3" /> {stat.label}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Activity / Posts */}
            <section className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <h3 className="font-black text-xl flex items-center gap-2.5">
                  <MessageCircle className="w-6 h-6 text-primary" /> Recent Activity
                </h3>
                <Badge variant="secondary" className="font-bold">Latest {userPosts.length}</Badge>
              </div>
              {userPosts.length === 0 ? (
                <Card className="border-none bg-card/30 py-16 text-center shadow-sm">
                  <p className="text-muted-foreground font-medium">No recent activity to show yet.</p>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {userPosts.map(post => (
                    <Card key={post.id} className="border-none bg-card/60 shadow-sm hover:shadow-md transition-all group overflow-hidden">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-2 mb-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {new Date(post.created_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                        <p className="text-foreground text-lg leading-relaxed whitespace-pre-wrap group-hover:text-primary/90 transition-colors">{post.content}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </section>

          </div>

          {/* Sidebar Column */}
          <div className="space-y-8">
             <Card className="border-none shadow-sm bg-card/50 backdrop-blur-sm overflow-hidden">
                <div className="bg-primary/10 px-6 py-4 border-b border-primary/10">
                  <h3 className="font-black text-lg flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-primary" /> Offered Services
                  </h3>
                </div>
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/30 border border-border/50">
                    <span className="font-bold text-sm">Brand Collaborations</span>
                    <Badge className="bg-green-500/10 text-green-600 border-green-500/20 px-2.5 hover:bg-green-500/10">Available</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/30 border border-border/50">
                    <span className="font-bold text-sm">UGC Content</span>
                    <Badge className="bg-green-500/10 text-green-600 border-green-500/20 px-2.5 hover:bg-green-500/10">Available</Badge>
                  </div>
                  <Button variant="ghost" className="w-full text-xs font-black uppercase tracking-widest text-primary hover:bg-primary/5 h-11 rounded-xl">
                    Inquire Now <Share2 className="w-3 h-3 ml-2" />
                  </Button>
                </CardContent>
             </Card>

             <Card className="border-none shadow-sm bg-card/30 overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <Users className="w-4 h-4" /> Discover More
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 pt-2">
                   <div className="text-sm font-medium text-muted-foreground/80 leading-relaxed italic">
                      "Find similar creators based on niche and influence..."
                   </div>
                   <Button variant="outline" className="w-full mt-4 text-xs font-bold border-primary/20 hover:bg-primary/5 h-10 rounded-xl">
                     Browse Explore Page
                   </Button>
                </CardContent>
             </Card>
          </div>
        </div>
      </main>
    );
  };

  if (loading) {
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
          <p className="text-muted-foreground max-w-md">The profile @{username} doesn't seem to exist or has been moved.</p>
          <Button onClick={() => router.push("/")} className="font-bold rounded-xl h-11 px-8">Back to Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {currentUser ? (
        <div className="flex min-h-screen">
          {/* Laptop Sidebar */}
          <Sidebar 
            user={currentUser} 
            role={viewerRole} 
            profile={viewerProfile} 
            className="hidden lg:flex" 
          />

          <div className="flex-1 flex flex-col min-w-0">
            {/* Mobile Header */}
            <DashboardHeader user={currentUser} profile={viewerProfile} />

            {/* Main Content Area */}
            <main className="flex-1 overflow-x-hidden pt-16 lg:pt-0 pb-20 lg:pb-0">
              <ProfileContent />
            </main>

            {/* Mobile Bottom Nav */}
            <BottomNav role={viewerRole} className="lg:hidden" />
          </div>
        </div>
      ) : (
        <div className="flex flex-col min-h-screen">
          <PublicNavbar />
          <ProfileContent />
          <footer className="mt-auto border-t border-border py-12 bg-secondary/10">
            <div className="container mx-auto px-6 text-center">
              <p className="text-sm text-muted-foreground font-bold uppercase tracking-widest">Join @{profile.username} on Grifi</p>
              <p className="text-xs text-muted-foreground mt-1">The Ultimate Creator & Brand Marketplace</p>
              <Button variant="link" className="mt-4 text-primary font-black uppercase tracking-tighter" asChild>
                <Link href="/auth">Create your own profile now →</Link>
              </Button>
            </div>
          </footer>
        </div>
      )}
    </div>
  );
}
