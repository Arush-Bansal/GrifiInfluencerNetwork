"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Clock, MessageSquare, User as UserIcon } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface FeedPost {
  id: string;
  content: string;
  created_at: string;
  type: 'community' | 'personal';
  community_id?: string;
  community_name?: string;
  author_id: string;
  author_username: string;
  author_avatar?: string;
  image_url?: string;
}

export function UnifiedFeed({ userId }: { userId: string }) {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchFeed();
    }
  }, [userId]);

  const fetchFeed = async () => {
    try {
      setLoading(true);
      
      // 1. Get joined communities & followed communities
      const { data: memberships } = await supabase
        .from("community_members" as any)
        .select("community_id")
        .eq("user_id", userId);

      const { data: communityFollows } = await supabase
        .from("community_followers" as any)
        .select("community_id")
        .eq("user_id", userId);

      const communityIds = Array.from(new Set([
        ...((memberships as any[])?.map(m => m.community_id) || []),
        ...((communityFollows as any[])?.map(f => f.community_id) || [])
      ]));

      // 2. Fetch Community Posts
      let communityPosts: FeedPost[] = [];
      if (communityIds.length > 0) {
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
          .eq("status", "approved");

        if (!error && data) {
          communityPosts = data.map((p: any) => ({
            id: p.id,
            content: p.content,
            created_at: p.created_at,
            type: 'community',
            community_id: p.community_id,
            community_name: p.communities?.name,
            author_id: p.author_id,
            author_username: p.profiles?.username || 'user',
            author_avatar: p.profiles?.avatar_url,
            image_url: p.image_url
          }));
        }
      }

      // 3. Fetch Personal Posts (from followed users or connections)
      // RLS handles the filtering, so we just select * from posts
      const { data: personalPostsRaw, error: personalPostsError } = await supabase
        .from("posts" as any)
        .select(`
          id,
          content,
          image_url,
          created_at,
          author_id,
          profiles:author_id(username, avatar_url)
        `)
        .order("created_at", { ascending: false });

      let personalPosts: FeedPost[] = [];
      if (!personalPostsError && personalPostsRaw) {
        personalPosts = personalPostsRaw.map((p: any) => ({
          id: p.id,
          content: p.content,
          created_at: p.created_at,
          type: 'personal',
          author_id: p.author_id,
          author_username: p.profiles?.username || 'user',
          author_avatar: p.profiles?.avatar_url,
          image_url: p.image_url
        }));
      }

      // 4. Combine and Sort
      const combined = [...communityPosts, ...personalPosts].sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setPosts(combined);
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
          <p className="text-muted-foreground text-sm mb-6">Join communities or follow users to see updates here.</p>
          <div className="flex justify-center gap-4">
            <Link href="/dashboard/communities">
              <span className="text-primary font-semibold hover:underline cursor-pointer">Explore Communities</span>
            </Link>
            <span className="text-muted-foreground">|</span>
            <Link href="/dashboard/search">
               <span className="text-primary font-semibold hover:underline cursor-pointer">Find People</span>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1 mb-2">
         <h2 className="text-xl font-bold">Recent Updates</h2>
         <button onClick={fetchFeed} className="text-xs text-primary hover:underline">Refresh</button>
      </div>
      {posts.map(post => (
        <Card key={post.id} className="border-none bg-card/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Avatar className="w-8 h-8 border border-border/50">
                  <AvatarImage src={post.author_avatar} alt={post.author_username} />
                  <AvatarFallback className="text-[10px]">{post.author_username?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">@{post.author_username}</span>
                    <span className="text-xs text-muted-foreground">•</span>
                    {post.type === 'community' ? (
                      <Link href={`/dashboard/communities/${post.community_id}`}>
                        <Badge variant="default" className="hover:bg-primary/20 transition-colors cursor-pointer text-[10px] h-4">
                          {post.community_name}
                        </Badge>
                      </Link>
                    ) : (
                      <Badge variant="outline" className="text-[10px] h-4">
                        <UserIcon className="w-2 h-2 mr-1" />
                        Personal
                      </Badge>
                    )}
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
                  className="w-full h-auto max-h-[500px] object-cover"
                />
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
