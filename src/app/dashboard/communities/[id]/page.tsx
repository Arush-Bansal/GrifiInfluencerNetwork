"use client";

import { useState, useEffect, use } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, 
  Shield, 
  MessageSquare, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  MoreVertical,
  UserPlus,
  UserMinus,
  Plus
} from "lucide-react";
import type { User as SupabaseUser } from "@supabase/supabase-js";

interface Community {
  id: string;
  name: string;
  description: string;
  created_by: string;
}

interface Post {
  id: string;
  author_id: string;
  content: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  profiles?: {
    username: string;
  };
}

interface Member {
  user_id: string;
  role: 'admin' | 'moderator' | 'member';
  profiles?: {
    username: string;
  };
}

export default function CommunityDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [community, setCommunity] = useState<Community | null>(null);
  const [membership, setMembership] = useState<Member | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [pendingPosts, setPendingPosts] = useState<Post[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [postContent, setPostContent] = useState("");
  const [submittingPost, setSubmittingPost] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchInitialData();
  }, [id]);

  const fetchInitialData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);

    let currentMembership: any = null;
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      setProfile(profile);

      // Check membership
      const { data: memberData } = await supabase
        .from("community_members" as any)
        .select("*")
        .eq("community_id", id)
        .eq("user_id", user.id)
        .maybeSingle();
      currentMembership = memberData as any;
      setMembership(memberData as any);

      // Check following
      const { data: followData } = await supabase
        .from("community_followers" as any)
        .select("*")
        .eq("community_id", id)
        .eq("user_id", user.id)
        .maybeSingle();
      setIsFollowing(!!followData);
    }

    // Fetch community info
    const result = await supabase
      .from("communities" as any)
      .select("*")
      .eq("id", id)
      .single();
    
    const communityData = result.data as any;
    setCommunity(communityData);

    // Fetch approved posts
    fetchApprovedPosts();
    
    // If mod/admin or owner, fetch pending posts
    const isModOrOwner = currentMembership?.role === 'admin' || 
                         currentMembership?.role === 'moderator' || 
                         communityData?.created_by === user?.id;
                         
    if (isModOrOwner) {
       fetchPendingPosts();
    }

    // Fetch members
    fetchMembers();

    setLoading(false);
  };

  const fetchApprovedPosts = async () => {
    const { data } = await supabase
      .from("community_posts" as any)
      .select("*, profiles:author_id(username)")
      .eq("community_id", id)
      .eq("status", "approved")
      .order("created_at", { ascending: false });
    setPosts((data as any) || []);
  };

  const fetchPendingPosts = async () => {
    const { data } = await supabase
      .from("community_posts" as any)
      .select("*, profiles:author_id(username)")
      .eq("community_id", id)
      .eq("status", "pending")
      .order("created_at", { ascending: false });
    setPendingPosts((data as any) || []);
  };

  const fetchMembers = async () => {
    const { data } = await supabase
      .from("community_members" as any)
      .select("*, profiles:user_id(username)")
      .eq("community_id", id);
    setMembers((data as any) || []);
  };

  const handleJoin = async () => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from("community_members" as any)
        .insert({
          community_id: id,
          user_id: user.id,
          role: 'member'
        });
      if (error) throw error;
      toast({ title: "Joined!", description: "You are now a member." });
      fetchInitialData();
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  const handleLeave = async () => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from("community_members" as any)
        .delete()
        .eq("community_id", id)
        .eq("user_id", user.id);
      if (error) throw error;
      toast({ title: "Left community" });
      fetchInitialData();
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  const handleFollow = async () => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from("community_followers" as any)
        .insert({ community_id: id, user_id: user.id });
      if (error) throw error;
      setIsFollowing(true);
      toast({ title: "Following" });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  const handleUnfollow = async () => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from("community_followers" as any)
        .delete()
        .eq("community_id", id)
        .eq("user_id", user.id);
      if (error) throw error;
      setIsFollowing(false);
      toast({ title: "Unfollowed" });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  const handleSubmitPost = async () => {
    if (!postContent.trim() || !user) return;
    setSubmittingPost(true);
    try {
      const { error } = await supabase
        .from("community_posts" as any)
        .insert({
          community_id: id,
          author_id: user.id,
          content: postContent,
          status: 'pending'
        });
      if (error) throw error;
      toast({
        title: "Post Submitted",
        description: "Your post is pending approval by moderators.",
      });
      setPostContent("");
      
      // Auto-refresh pending list for mods/owners
      if (isModerator) {
        fetchPendingPosts();
      }
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setSubmittingPost(false);
    }
  };

  const handleModerate = async (postId: string, status: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from("community_posts" as any)
        .update({ status, moderated_by: user?.id, moderated_at: new Date().toISOString() })
        .eq("id", postId);
      if (error) throw error;
      toast({ title: `Post ${status}` });
      fetchPendingPosts();
      if (status === 'approved') fetchApprovedPosts();
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  const handlePromote = async (memberUserId: string, newRole: 'admin' | 'moderator' | 'member') => {
    try {
      const { error } = await supabase
        .from("community_members" as any)
        .update({ role: newRole })
        .eq("community_id", id)
        .eq("user_id", memberUserId);
      if (error) throw error;
      toast({ title: "Role updated" });
      fetchMembers();
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  if (loading || !community) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Clock className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const isModerator = membership?.role === 'admin' || membership?.role === 'moderator' || community?.created_by === user?.id;
  const isAdmin = membership?.role === 'admin' || community?.created_by === user?.id;

  return (
    <div className="min-h-screen bg-secondary/30">
      <main className="container mx-auto px-4 py-8">
        {/* Community Header */}
        <Card className="mb-8 border-none overflow-hidden bg-card/80 backdrop-blur-sm shadow-sm">
          <div className="h-32 bg-gradient-to-r from-primary/20 to-purple-500/20" />
          <CardContent className="-mt-12 relative">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="space-y-4">
                <div className="w-24 h-24 bg-background rounded-2xl flex items-center justify-center shadow-lg border-4 border-background text-primary">
                  <Users className="w-12 h-12" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">{community.name}</h1>
                  <p className="text-muted-foreground">{community.description}</p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  variant={isFollowing ? "outline" : "secondary"}
                  onClick={isFollowing ? handleUnfollow : handleFollow}
                  className="rounded-full"
                >
                  {isFollowing ? "Following" : "Follow"}
                </Button>
                
                {membership ? (
                  <Button variant="destructive" onClick={handleLeave} className="rounded-full">
                    Leave
                  </Button>
                ) : (
                  <Button onClick={handleJoin} className="rounded-full">
                    Join Community
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="feed" className="space-y-6">
          <TabsList className="bg-card/50 backdrop-blur-sm p-1">
            <TabsTrigger value="feed" className="gap-2">
              <MessageSquare className="w-4 h-4" /> Feed
            </TabsTrigger>
            <TabsTrigger value="members" className="gap-2">
              <Users className="w-4 h-4" /> Members
            </TabsTrigger>
            {isModerator && (
              <TabsTrigger value="moderation" className="gap-2">
                <Shield className="w-4 h-4" /> Moderation
                {pendingPosts.length > 0 && (
                  <Badge variant="destructive" className="ml-1 px-1.5 py-0 h-5 min-w-5">
                    {pendingPosts.length}
                  </Badge>
                )}
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="feed" className="space-y-6">
            {/* Create Post */}
            {membership && (
              <Card className="border-none bg-card/50 backdrop-blur-sm">
                <CardContent className="pt-6 space-y-4">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary shrink-0">
                      <Plus className="w-5 h-5" />
                    </div>
                    <Textarea 
                      placeholder="Share something with the community..."
                      value={postContent}
                      onChange={(e) => setPostContent(e.target.value)}
                      className="resize-none border-none bg-secondary/20 focus-visible:ring-primary h-24"
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button onClick={handleSubmitPost} disabled={submittingPost || !postContent.trim()}>
                      {submittingPost ? <Clock className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                      Post for Approval
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Posts List */}
            <div className="space-y-6">
              {posts.length === 0 ? (
                <div className="text-center py-20 bg-card/30 rounded-2xl border-2 border-dashed">
                  <p className="text-muted-foreground">No approved posts yet. Be the first to share something!</p>
                </div>
              ) : (
                posts.map(post => (
                  <Card key={post.id} className="border-none bg-card/80 backdrop-blur-sm">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                            {post.profiles?.username?.[0].toUpperCase() || 'U'}
                          </div>
                          <div>
                            <div className="font-semibold text-sm">@{post.profiles?.username || 'user'}</div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(post.created_at).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="whitespace-pre-wrap">{post.content}</p>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="members" className="space-y-4">
            <Card className="border-none bg-card/80">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {members.map(member => (
                    <div key={member.user_id} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/5 rounded-full flex items-center justify-center text-primary font-bold">
                          {member.profiles?.username?.[0].toUpperCase() || 'U'}
                        </div>
                        <div>
                          <div className="font-medium">@{member.profiles?.username || 'member'}</div>
                          <Badge variant="outline" className="capitalize text-[10px] h-4">
                            {member.role}
                          </Badge>
                        </div>
                      </div>
                      {isAdmin && member.user_id !== user?.id && (
                        <div className="flex gap-2">
                          {member.role === 'member' && (
                            <Button size="sm" variant="outline" onClick={() => handlePromote(member.user_id, 'moderator')}>
                              Make Moderator
                            </Button>
                          )}
                          {member.role === 'moderator' && (
                             <Button size="sm" variant="outline" onClick={() => handlePromote(member.user_id, 'member')}>
                              Revoke Moderator
                             </Button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {isModerator && (
            <TabsContent value="moderation" className="space-y-4">
              {pendingPosts.length === 0 ? (
                <div className="text-center py-20 bg-card/30 rounded-2xl border-2 border-dashed">
                  <CheckCircle2 className="w-12 h-12 text-primary/30 mx-auto mb-4" />
                  <p className="text-muted-foreground">All caught up! No pending posts.</p>
                </div>
              ) : (
                pendingPosts.map(post => (
                  <Card key={post.id} className="border-none bg-card/80 shadow-md">
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                          {post.profiles?.username?.[0].toUpperCase() || 'U'}
                        </div>
                        <div>
                          <div className="font-semibold text-sm">@{post.profiles?.username || 'user'}</div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(post.created_at).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="whitespace-pre-wrap">{post.content}</p>
                      <div className="flex gap-2 justify-end pt-4 border-t">
                        <Button 
                          variant="outline" 
                          className="text-destructive hover:bg-destructive/10"
                          onClick={() => handleModerate(post.id, 'rejected')}
                        >
                          <XCircle className="w-4 h-4 mr-2" /> Reject
                        </Button>
                        <Button 
                          onClick={() => handleModerate(post.id, 'approved')}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle2 className="w-4 h-4 mr-2" /> Approve
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          )}
        </Tabs>
      </main>
    </div>
  );
}
