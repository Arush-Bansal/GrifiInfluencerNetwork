"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Loader2, MapPin, Link as LinkIcon, Calendar, Edit, MessageCircle, Share2, Briefcase, Users, Star } from "lucide-react";
import { Navbar } from "@/components/dashboard/Navbar";
import { useToast } from "@/hooks/use-toast";
import type { User as SupabaseUser } from "@supabase/supabase-js";

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
  const [isOwnProfile, setIsOwnProfile] = useState(false);

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

    if (username) {
      fetchProfileAndUser();
    }
  }, [username, toast]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar user={currentUser} />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar user={currentUser} />
        <div className="flex-1 flex flex-col items-center justify-center space-y-4">
          <h2 className="text-2xl font-bold">User not found</h2>
          <p className="text-muted-foreground">The user @{username} does not exist.</p>
          <Button onClick={() => router.push("/dashboard")}>Go Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary/30">
      <Navbar user={currentUser} />
      
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Profile Header Card */}
        <Card className="overflow-hidden border-none shadow-md mb-6">
          <div className="h-32 md:h-48 bg-gradient-to-r from-primary/10 to-primary/30 relative">
             {/* Cover Image Placeholder - could be real if added to schema */}
          </div>
          <CardContent className="px-6 pb-6 relative">
            <div className="-mt-12 md:-mt-16 mb-4 flex flex-col md:flex-row items-start md:items-end gap-4">
              <Avatar className="w-24 h-24 md:w-32 md:h-32 border-4 border-background shadow-sm">
                <AvatarImage src={profile.avatar_url} alt={profile.full_name} />
                <AvatarFallback className="text-2xl">{profile.full_name?.charAt(0) || "U"}</AvatarFallback>
              </Avatar>
              
              <div className="flex-1 pt-2 md:pt-0 space-y-1">
                <h1 className="text-2xl md:text-3xl font-bold">{profile.full_name}</h1>
                <p className="text-muted-foreground font-medium">@{profile.username}</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground pt-1">
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {profile.location}</span>
                  {profile.website && (
                    <>
                      <span>•</span>
                      <a href={profile.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary hover:underline">
                        <LinkIcon className="w-3 h-3" /> Website
                      </a>
                    </>
                  )}
                  <span>•</span>
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Joined {new Date(profile.join_date).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-4 md:mt-0 w-full md:w-auto">
                {isOwnProfile ? (
                  <Button onClick={() => router.push("/dashboard/profile")} variant="outline" className="w-full md:w-auto">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                ) : (
                  <>
                    <Button variant="outline" className="flex-1 md:flex-none">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Message
                    </Button>
                    <Button className="flex-1 md:flex-none">
                      Connect
                    </Button>
                  </>
                )}
                <Button variant="ghost" size="icon">
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="font-semibold mb-2">About</h3>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {profile.bio}
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Main Content Column */}
          <div className="md:col-span-2 space-y-6">
            
            {/* Stats / Highlights - "Customized to each user" */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                   <Star className="w-5 h-5 text-primary" />
                   Influencer Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 bg-secondary rounded-lg text-center">
                  <div className="text-2xl font-bold text-primary">{profile.followers}</div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider font-medium mt-1">Followers</div>
                </div>
                <div className="p-3 bg-secondary rounded-lg text-center">
                  <div className="text-2xl font-bold text-primary">{profile.engagement_rate}%</div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider font-medium mt-1">Engagement</div>
                </div>
                <div className="p-3 bg-secondary rounded-lg text-center">
                  <div className="text-2xl font-bold text-primary capitalize">{profile.platform}</div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider font-medium mt-1">Platform</div>
                </div>
                <div className="p-3 bg-secondary rounded-lg text-center">
                  <div className="text-2xl font-bold text-primary capitalize">{profile.niche}</div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider font-medium mt-1">Niche</div>
                </div>
              </CardContent>
            </Card>

            {/* Activity / Posts Placeholder */}
            <Card>
               <CardHeader>
                <CardTitle className="text-lg">Recent Activity</CardTitle>
               </CardHeader>
               <CardContent>
                 <div className="text-center py-8 text-muted-foreground">
                   <p>No recent activity to show.</p>
                 </div>
               </CardContent>
            </Card>

          </div>

          {/* Sidebar Column */}
          <div className="space-y-6">
             <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Briefcase className="w-5 h-5" />
                    Services
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span>Brand Collabs</span>
                    <Badge variant="default">Available</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Product Reviews</span>
                    <Badge variant="default">Available</Badge>
                  </div>
                  <Separator />
                  <Button variant="outline" className="w-full text-xs">View All Services</Button>
                </CardContent>
             </Card>

             <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Similar Profiles
                  </CardTitle>
                </CardHeader>
                <CardContent>
                   <div className="text-sm text-muted-foreground">
                      People also viewed...
                      {/* Placeholder for similar profiles */}
                   </div>
                </CardContent>
             </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
