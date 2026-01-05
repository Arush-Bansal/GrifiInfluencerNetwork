"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, MessageSquare, User as UserIcon } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";
import { Database } from "@/integrations/supabase/types";

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
      
      // Fetch Personal Posts (from followed users or connections)
      // RLS handles the filtering, so we just select * from posts
      const { data: personalPostsRaw, error: personalPostsError } = await supabase
        .from("posts")
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
        personalPosts = (personalPostsRaw as unknown as any[]).map((p) => ({
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

      setPosts(personalPosts);
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
          <p className="text-muted-foreground text-sm mb-6">Follow users to see updates here.</p>
          <div className="flex justify-center gap-4">
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
                    <Badge variant="outline" className="text-[10px] h-4">
                      <UserIcon className="w-2 h-2 mr-1" />
                      Personal
                    </Badge>
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
              <div className="relative rounded-xl overflow-hidden border border-border/50 bg-muted/30 aspect-video">
                <Image 
                  src={post.image_url} 
                  alt="Post content" 
                  fill
                  className="object-cover"
                />
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
