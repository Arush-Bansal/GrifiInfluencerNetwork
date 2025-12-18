"use client";

import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ImagePlus, Send, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface CreatePostProps {
  userId: string;
  onPostCreated?: () => void;
  userProfile?: {
    username?: string;
    avatar_url?: string;
  };
}

export function CreatePost({ userId, onPostCreated, userProfile }: CreatePostProps) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handlePost = async () => {
    if (!content.trim()) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("posts" as any)
        .insert({
          author_id: userId,
          content: content.trim(),
        });

      if (error) throw error;

      toast({
        title: "Post created!",
        description: "Your post is now visible to your followers and connections.",
      });
      
      setContent("");
      if (onPostCreated) onPostCreated();
    } catch (error: any) {
      console.error("Error creating post:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create post.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-none bg-card/50 backdrop-blur-sm shadow-sm mb-6">
      <CardContent className="pt-6">
        <div className="flex gap-4">
          <Avatar className="w-10 h-10 border border-border/50">
            <AvatarImage src={userProfile?.avatar_url} alt={userProfile?.username} />
            <AvatarFallback>{userProfile?.username?.[0]?.toUpperCase() || "U"}</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-4">
            <Textarea
              placeholder={`What's on your mind, ${userProfile?.username || 'influencer'}?`}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[100px] bg-secondary/50 border-none focus-visible:ring-primary/20 resize-none text-sm"
            />
            <div className="flex items-center justify-between pt-2 border-t border-border/50">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary transition-colors">
                <ImagePlus className="w-4 h-4 mr-2" />
                Add Image
              </Button>
              <Button 
                onClick={handlePost} 
                disabled={loading || !content.trim()}
                className="rounded-full px-6 shadow-sm hover:shadow-md transition-all"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Post
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
