"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Globe, 
  Megaphone, 
  ChevronRight, 
  ArrowLeft,
  X
} from "lucide-react";
import { CreatePost } from "@/components/dashboard/CreatePost";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

function CreatePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, profile, role } = useAuth();
  
  const step = (searchParams.get("step") as "select" | "global" | "campaign") || "select";

  const updateStep = (newStep: "select" | "global" | "campaign") => {
    const params = new URLSearchParams(searchParams);
    params.set("step", newStep);
    router.push(`/dashboard/create?${params.toString()}`);
  };

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
                onClick={() => updateStep("select")}
                className="rounded-full"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
            )}
            <h1 className="text-2xl font-bold">
              {step === "select" && "Create New"}
              {step === "global" && "Global Post"}
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
              onClick={() => updateStep("global")}
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
                toast("Posted!", { description: "Your global post is now live." });
                router.push("/dashboard");
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default function CreatePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}>
      <CreatePageContent />
    </Suspense>
  );
}

