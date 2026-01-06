"use client";

import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ImagePlus, Send, Loader2, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";

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
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { toast } = useToast();

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload an image smaller than 5MB.",
          variant: "destructive",
        });
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handlePost = async () => {
    if (!content.trim() && !imageFile) return;

    setLoading(true);
    try {
      let imageUrl = null;

      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${userId}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `${userId}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('posts')
          .upload(filePath, imageFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('posts')
          .getPublicUrl(filePath);
        
        imageUrl = publicUrl;
      }

      const { error } = await supabase
        .from("posts")
        .insert({
          author_id: userId,
          content: content.trim(),
          image_url: imageUrl,
        });

      if (error) throw error;

      toast({
        title: "Post created!",
        description: "Your post is now visible to your followers and connections.",
      });
      
      setContent("");
      setImageFile(null);
      setImagePreview(null);
      if (onPostCreated) onPostCreated();
    } catch (error: unknown) {
      console.error("Error creating post:", error);
      const message = error instanceof Error ? error.message : "Failed to create post.";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-none bg-card/50 backdrop-blur-sm shadow-sm mb-6">
      <CardContent className="pt-6">
        <div className="flex gap-3 sm:gap-4">
          <div className="flex flex-col items-center gap-3">
            <Avatar className="w-10 h-10 border border-border/50">
              <AvatarImage src={userProfile?.avatar_url} alt={userProfile?.username} />
              <AvatarFallback>{userProfile?.username?.[0]?.toUpperCase() || "U"}</AvatarFallback>
            </Avatar>
            
            <div className="relative">
              <input
                type="file"
                id="post-image-upload"
                className="hidden"
                accept="image/*"
                onChange={handleImageSelect}
              />
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-10 w-10 text-muted-foreground hover:text-primary transition-all rounded-full hover:bg-primary/5 border border-transparent hover:border-primary/20"
                onClick={() => document.getElementById('post-image-upload')?.click()}
                title="Add Image"
              >
                <ImagePlus className="w-5 h-5" />
              </Button>
            </div>
          </div>

          <div className="flex-1 min-w-0 space-y-4">
            <Textarea
              placeholder={`What's on your mind, ${userProfile?.username || 'influencer'}?`}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[100px] bg-secondary/30 border-none focus-visible:ring-primary/20 resize-none text-sm p-3 rounded-xl"
            />

            {imagePreview && (
              <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-border/50 group">
                <Image 
                  src={imagePreview} 
                  alt="Preview" 
                  fill
                  className="object-cover" 
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={removeImage}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}

            <div className="flex items-center justify-end pt-2 border-t border-border/50">
              <Button 
                onClick={handlePost} 
                disabled={loading || !content.trim()}
                className="rounded-full px-6 shadow-sm hover:shadow-md transition-all h-10"
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
