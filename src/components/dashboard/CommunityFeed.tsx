"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Clock, MessageSquare } from "lucide-react";
import Link from "next/link";

interface FeedPost {
  id: string;
  content: string;
  created_at: string;
  community_id: string;
  communities: {
    name: string;
  };
  profiles: {
    username: string;
    avatar_url?: string;
  };
  image_url?: string;
}

export function CommunityFeed({ userId }: { userId: string }) {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchFeed();
    }
  }, [userId]);

  const fetchFeed = async () => {
    try {
      // 1. Get joined communities
      const { data: memberships } = await supabase
        .from("community_members" as any)
        .select("community_id")
        .eq("user_id", userId);

      // 2. Get followed communities
      const { data: follows } = await supabase
        .from("community_followers" as any)
        .select("community_id")
        .eq("user_id", userId);

      const communityIds = Array.from(new Set([
        ...((memberships as any[])?.map(m => m.community_id) || []),
        ...((follows as any[])?.map(f => f.community_id) || [])
      ]));

      if (communityIds.length === 0) {
        setPosts([]);
        setLoading(false);
        return;
      }

      // 3. Get posts
      const { data, error } = await supabase
        .from("community_posts" as any)
        .select(`
          id, 
          content, 
          image_url,
          created_at, 
          community_id,
          communities:community_id(name),
          profiles:author_id(username, avatar_url)
        `)
        .in("community_id", communityIds)
        .eq("status", "approved")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPosts(data as any || []);
    } catch (err) {
      console.error("Error fetching feed:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-40 bg-muted/50 animate-pulse rounded-2xl" />
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <Card className="border-none bg-card/50 backdrop-blur-sm text-center py-12">
        <CardContent>
          <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4 text-muted-foreground/50">
            <MessageSquare className="w-6 h-6" />
          </div>
          <p className="font-medium text-lg mb-1">Your feed is empty</p>
          <p className="text-muted-foreground text-sm mb-6">Join or follow communities to see posts here.</p>
          <Link href="/dashboard/communities">
            <span className="text-primary font-semibold hover:underline cursor-pointer">Explore Communities</span>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold px-1">Recent Updates</h2>
      {posts.map(post => (
        <Card key={post.id} className="border-none bg-card/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full overflow-hidden border border-border/50">
                  {post.profiles?.avatar_url ? (
                    <img src={post.profiles.avatar_url} alt={post.profiles.username} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                      {post.profiles?.username?.[0].toUpperCase() || 'U'}
                    </div>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">@{post.profiles?.username || 'user'}</span>
                    <span className="text-xs text-muted-foreground">•</span>
                    <Link href={`/dashboard/communities/${post.community_id}`}>
                      <Badge variant="default" className="hover:bg-primary/20 transition-colors cursor-pointer text-[10px] h-4">
                        {post.communities?.name}
                      </Badge>
                    </Link>
                  </div>
                  <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(post.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="whitespace-pre-wrap text-sm leading-relaxed">{post.content}</p>
            {post.image_url && (
              <div className="rounded-xl overflow-hidden border border-border/50 bg-muted/30">
                <img 
                  src={post.image_url} 
                  alt="Post content" 
                  className="w-full h-auto max-h-[400px] object-cover"
                />
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
