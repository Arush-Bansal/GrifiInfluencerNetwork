"use client";

import { useState, use } from "react";
import { Button } from "@/components/ui/button";
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
  Plus
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { 
  useCommunity, 
  useCommunityPosts, 
  useCommunityMembers, 
  useUserMembership, 
  useUserFollowStatus,
  useJoinCommunity,
  useLeaveCommunity,
  useFollowCommunity,
  useSubmitCommunityPost,
  useModerateCommunityPost,
  useUpdateMemberRole,
  CommunityPost,
  CommunityMember
} from "@/hooks/use-community";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Community {
  id: string;
  name: string;
  description: string;
  created_by: string;
}

export default function CommunityDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user } = useAuth();
  const [postContent, setPostContent] = useState("");
  const { toast } = useToast();

  // Queries
  const { data: community, isLoading: loadingCommunity } = useCommunity(id);
  const { data: posts = [] } = useCommunityPosts(id, "approved");
  const { data: pendingPosts = [] } = useCommunityPosts(id, "pending");
  const { data: members = [] } = useCommunityMembers(id);
  const { data: membership } = useUserMembership(id, user?.id);
  const { data: isFollowing } = useUserFollowStatus(id, user?.id);

  // Mutations
  const joinMutation = useJoinCommunity();
  const leaveMutation = useLeaveCommunity();
  const followMutation = useFollowCommunity();
  const submitPostMutation = useSubmitCommunityPost();
  const moderateMutation = useModerateCommunityPost();
  const promoteMutation = useUpdateMemberRole();

  const handleJoin = () => {
    if (!user) return;
    joinMutation.mutate({ communityId: id, userId: user.id }, {
      onSuccess: () => toast({ title: "Joined!", description: "You are now a member." }),
      onError: (e) => toast({ title: "Error", description: e.message, variant: "destructive" })
    });
  };

  const handleLeave = () => {
    if (!user) return;
    leaveMutation.mutate({ communityId: id, userId: user.id }, {
      onSuccess: () => toast({ title: "Left community" }),
      onError: (e) => toast({ title: "Error", description: e.message, variant: "destructive" })
    });
  };

  const handleFollow = (follow: boolean) => {
    if (!user) return;
    followMutation.mutate({ communityId: id, userId: user.id, follow }, {
      onSuccess: () => toast({ title: follow ? "Following" : "Unfollowed" }),
      onError: (e) => toast({ title: "Error", description: e.message, variant: "destructive" })
    });
  };

  const handleSubmitPost = () => {
    if (!user || !postContent.trim()) return;
    submitPostMutation.mutate({ communityId: id, authorId: user.id, content: postContent }, {
      onSuccess: () => {
        toast({ title: "Post Submitted", description: "Your post is pending approval." });
        setPostContent("");
      },
      onError: (e) => toast({ title: "Error", description: e.message, variant: "destructive" })
    });
  };

  const handleModerate = (postId: string, status: 'approved' | 'rejected') => {
    if (!user) return;
    moderateMutation.mutate({ postId, communityId: id, status, moderatorId: user.id }, {
      onSuccess: () => toast({ title: `Post ${status}` }),
      onError: (e) => toast({ title: "Error", description: e.message, variant: "destructive" })
    });
  };

  const handleUpdateRole = (memberUserId: string, newRole: 'admin' | 'moderator' | 'member') => {
    promoteMutation.mutate({ communityId: id, memberUserId, newRole }, {
      onSuccess: () => toast({ title: "Role updated" }),
      onError: (e) => toast({ title: "Error", description: e.message, variant: "destructive" })
    });
  };

  const isModerator = membership?.role === 'admin' || membership?.role === 'moderator' || community?.created_by === user?.id;
  const isAdmin = membership?.role === 'admin' || community?.created_by === user?.id;

  if (loadingCommunity || !community) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Clock className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

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
                  onClick={() => handleFollow(!isFollowing)}
                  disabled={followMutation.isPending}
                  className="rounded-full"
                >
                  {isFollowing ? "Following" : "Follow"}
                </Button>
                
                {membership ? (
                  <Button 
                    variant="destructive" 
                    onClick={handleLeave} 
                    disabled={leaveMutation.isPending}
                    className="rounded-full"
                  >
                    Leave
                  </Button>
                ) : (
                  <Button 
                    onClick={handleJoin} 
                    disabled={joinMutation.isPending}
                    className="rounded-full"
                  >
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
                    <Button 
                      onClick={handleSubmitPost} 
                      disabled={submitPostMutation.isPending || !postContent.trim()}
                    >
                      {submitPostMutation.isPending ? <Clock className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
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
                posts.map((post: CommunityPost) => (
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
                  {members.map((member: CommunityMember) => (
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
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => handleUpdateRole(member.user_id, 'moderator')}
                              disabled={promoteMutation.isPending}
                            >
                              Make Moderator
                            </Button>
                          )}
                          {member.role === 'moderator' && (
                             <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => handleUpdateRole(member.user_id, 'member')}
                              disabled={promoteMutation.isPending}
                            >
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
                pendingPosts.map((post: CommunityPost) => (
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
                          disabled={moderateMutation.isPending}
                        >
                          <XCircle className="w-4 h-4 mr-2" /> Reject
                        </Button>
                        <Button 
                          onClick={() => handleModerate(post.id, 'approved')}
                          disabled={moderateMutation.isPending}
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
