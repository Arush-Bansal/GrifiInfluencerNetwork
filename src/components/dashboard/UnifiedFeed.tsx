"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Tag, User as UserIcon, Globe } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";
import { useFeed } from "@/hooks/use-feed";
import { cn } from "@/lib/utils";


export function UnifiedFeed({ userId }: { userId: string }) {
  const { data: posts = [], isLoading: loading, refetch } = useFeed(userId);

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
      <Card className="border-none bg-card/50 backdrop-blur-sm text-center py-20">
        <CardContent>
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 text-primary/40 animate-pulse">
            <Globe className="w-8 h-8" />
          </div>
          <p className="font-serif text-2xl mb-2">Coming soon</p>
          <p className="text-muted-foreground text-sm max-w-xs mx-auto">We&apos;re currently building a more curated feed experience for you.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1 mb-2">
         <h2 className="text-xl font-bold">Recent Updates</h2>
         <button onClick={() => refetch()} className="text-xs text-primary hover:underline">Refresh</button>
      </div>
      {posts.map(post => (
        <Card key={post.id} className="border-none bg-card/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <Link href={`/u/${post.author_username}`} className="flex items-center gap-2 group cursor-pointer">
                <Avatar className="w-8 h-8 border border-border/50 group-hover:opacity-80 transition-opacity">
                  <AvatarImage src={post.author_avatar} alt={post.author_username} />
                  <AvatarFallback className="text-[10px]">{post.author_username?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm group-hover:text-primary transition-colors">@{post.author_username}</span>
                    <span className="text-xs text-muted-foreground">•</span>
                    <Badge variant={post.type === 'campaign' ? "default" : "outline"} className={cn("text-[10px] h-4", post.type === 'campaign' && "bg-primary/20 text-primary border-none hover:bg-primary/30")}>
                      {post.type === 'campaign' ? <Tag className="w-2 h-2 mr-1" /> : <UserIcon className="w-2 h-2 mr-1" />}
                      {post.type === 'campaign' ? "Campaign" : "General"}
                    </Badge>
                  </div>
                  <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(post.created_at).toLocaleDateString()}
                  </div>
                </div>
              </Link>
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
