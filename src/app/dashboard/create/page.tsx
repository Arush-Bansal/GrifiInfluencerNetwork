"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useUserCommunities, useSubmitCommunityPost } from "@/hooks/use-community";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Globe, 
  Megaphone, 
  MessageSquare,
  ChevronRight, 
  ArrowLeft,
  X,
  Plus
} from "lucide-react";
import { CreatePost } from "@/components/dashboard/CreatePost";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";

export default function CreatePage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, profile, role, isLoading: authLoading } = useAuth();
  const { data: communities = [], isLoading: communitiesLoading } = useUserCommunities(user?.id);
  
  const [selectedCommunity, setSelectedCommunity] = useState<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
  const [communityPostContent, setCommunityPostContent] = useState("");
  const [step, setStep] = useState<"select" | "global" | "community" | "campaign">("select");
  
  const submitCommunityPost = useSubmitCommunityPost();

  const handleSubmitCommunityPost = async () => {
    if (!communityPostContent.trim() || !user || !selectedCommunity) return;
    
    submitCommunityPost.mutate({
      communityId: selectedCommunity.id,
      authorId: user.id,
      content: communityPostContent,
    }, {
      onSuccess: () => {
        toast({
          title: "Post Submitted",
          description: `Your post is pending approval by ${selectedCommunity.name} moderators.`,
        });
        setCommunityPostContent("");
        setStep("select");
        setSelectedCommunity(null);
      },
      onError: (e: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
        toast({ title: "Error", description: e.message, variant: "destructive" });
      }
    });
  };

  const loading = authLoading || communitiesLoading;

  if (!authLoading && !user) {
    router.push("/auth");
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="h-12 w-12 bg-primary/20 rounded-full" />
          <div className="h-4 w-24 bg-muted rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container max-w-2xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            {step !== "select" && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setStep("select")}
                className="rounded-full"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
            )}
            <h1 className="text-2xl font-bold">
              {step === "select" && "Create New"}
              {step === "global" && "Global Post"}
              {step === "community" && (selectedCommunity ? `Post to ${selectedCommunity.name}` : "Select Community")}
              {step === "campaign" && "New Campaign"}
            </h1>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => router.back()}
            className="rounded-full"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {step === "select" && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Card 
              className="cursor-pointer hover:bg-accent/50 transition-colors border-none bg-card/50 shadow-sm"
              onClick={() => setStep("global")}
            >
              <CardContent className="flex items-center gap-4 p-6">
                <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500">
                  <Globe className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">Global Post</h3>
                  <p className="text-muted-foreground text-sm">Visible to everyone in the network</p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </CardContent>
            </Card>


            {role === "brand" && (
              <Card 
                className="cursor-pointer hover:bg-accent/50 transition-colors border-none bg-card/50 shadow-sm"
                onClick={() => router.push("/dashboard/campaigns/new")}
              >
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="w-12 h-12 bg-orange-500/10 rounded-2xl flex items-center justify-center text-orange-500">
                    <Megaphone className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">Create Campaign</h3>
                    <p className="text-muted-foreground text-sm">Start a new collaboration campaign</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {step === "global" && user && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <CreatePost 
              userId={user.id} 
              userProfile={{ 
                username: profile?.username || undefined,
                avatar_url: profile?.avatar_url || undefined
              }} 
              onPostCreated={() => {
                toast({ title: "Posted!", description: "Your global post is now live." });
                router.push("/dashboard");
              }}
            />
          </div>
        )}

        {step === "community" && !selectedCommunity && (
          <div className="space-y-3 animate-in fade-in slide-in-from-right-4 duration-500">
            {communities.length === 0 ? (
              <div className="text-center py-12">
                  <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                <p className="text-muted-foreground">You haven&apos;t joined any communities yet.</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => router.push("/dashboard/communities")}
                >
                  Browse Communities
                </Button>
              </div>
            ) : (
              communities.map((community) => (
                <Card 
                  key={community.id}
                  className="cursor-pointer hover:bg-accent/50 transition-colors border-none bg-card/50 shadow-sm"
                  onClick={() => setSelectedCommunity(community)}
                >
                  <CardContent className="flex items-center gap-4 p-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                      <MessageSquare className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{community.name}</h4>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}

        {step === "community" && selectedCommunity && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <Card className="border-none bg-card/50 backdrop-blur-sm">
              <CardContent className="pt-6 space-y-4">
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary shrink-0">
                    <Plus className="w-5 h-5" />
                  </div>
                  <Textarea 
                    placeholder={`Share something with ${selectedCommunity.name}...`}
                    value={communityPostContent}
                    onChange={(e) => setCommunityPostContent(e.target.value)}
                    className="resize-none border-none bg-secondary/20 focus-visible:ring-primary h-32 rounded-xl p-4"
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <Button variant="ghost" onClick={() => setSelectedCommunity(null)}>Change Community</Button>
                  <Button onClick={handleSubmitCommunityPost} disabled={submitCommunityPost.isPending || !communityPostContent.trim()}>
                    {submitCommunityPost.isPending ? <Plus className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                    Submit for Approval
                  </Button>
                </div>
              </CardContent>
            </Card>
            <p className="text-xs text-muted-foreground text-center px-6">
              Community posts are moderated and will appear in the community feed once approved by a moderator.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
