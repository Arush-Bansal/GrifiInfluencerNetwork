"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useCheckUsername, useUpdateProfile } from "@/hooks/use-profile";
import { Loader2, Check, XCircle, Rocket, User, Heart, Globe } from "lucide-react";

export default function OnboardingPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, profile, isLoading: authLoading } = useAuth();
  const updateProfile = useUpdateProfile();

  const [form, setForm] = useState({
    username: "",
    full_name: "",
    niche: "",
    platform: "",
  });
  const hasInitializedForm = useRef(false);

  const { data: checkData, isLoading: isCheckingUsername } = useCheckUsername(form.username, profile?.username || undefined);
  const isUsernameAvailable = checkData?.available;
  const usernameStatus = isCheckingUsername ? 'checking' : (form.username.length >= 3 ? (isUsernameAvailable ? 'available' : 'unavailable') : 'idle');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth");
      return;
    }

    if (profile && profile.username && profile.full_name && profile.niche && profile.platform) {
      router.push("/dashboard");
      return;
    }

    if ((profile || user?.user_metadata) && !hasInitializedForm.current) {
      const metadata = user?.user_metadata || {};
      const newForm = {
        username: profile?.username || metadata.username || "",
        full_name: profile?.full_name || metadata.full_name || "",
        niche: profile?.niche || metadata.niche || "",
        platform: profile?.platform || metadata.platform || "",
      };
      
      if (newForm.username || newForm.full_name || newForm.niche || newForm.platform) {
        // Move to the next tick to satisfy the linter and prevent synchronous cascading renders.
        // Although we have a ref guard, the linter dislikes synchronous setState in useEffect.
        const timer = setTimeout(() => {
          setForm(prev => {
            const hasChanged = 
              prev.username !== newForm.username || 
              prev.full_name !== newForm.full_name || 
              prev.niche !== newForm.niche || 
              prev.platform !== newForm.platform;
            return hasChanged ? newForm : prev;
          });
          hasInitializedForm.current = true;
        }, 0);
        return () => clearTimeout(timer);
      }
    }
  }, [authLoading, user, profile, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (usernameStatus === 'unavailable') {
      toast({
        title: "Username taken",
        description: "Please choose a different username.",
        variant: "destructive"
      });
      return;
    }

    if (!form.username || !form.full_name || !form.niche || !form.platform) {
      toast({
        title: "Missing fields",
        description: "Please fill in all the details to continue.",
        variant: "destructive"
      });
      return;
    }

    try {
      await updateProfile.mutateAsync({
        userId: user.id,
        updates: {
          username: form.username,
          full_name: form.full_name,
          niche: form.niche,
          platform: form.platform,
        },
        authUpdates: {
          username: form.username,
          full_name: form.full_name,
          niche: form.niche,
          platform: form.platform,
        }
      });

      toast({
        title: "Welcome aboard!",
        description: "Your profile has been set up successfully.",
      });

      router.push("/dashboard");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Something went wrong. Please try again.";
      console.error("Error saving profile:", error);
      toast({
        title: "Setup failed",
        description: message,
        variant: "destructive"
      });
    }
  };

  const loading = authLoading || updateProfile.isPending;
  const saving = updateProfile.isPending;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">Preparing your experience...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/10 to-primary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-lg animate-in fade-in zoom-in duration-500">
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-2xl shadow-primary/20 rotate-3 hover:rotate-0 transition-transform duration-300">
            <Rocket className="text-primary-foreground w-8 h-8" />
          </div>
        </div>

        <Card className="border-none shadow-2xl bg-card/80 backdrop-blur-xl">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-3xl font-black bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              One Last Step
            </CardTitle>
            <CardDescription className="text-lg">
              Let&apos;s personalize your Grifi experience.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                {/* Full Name */}
                <div className="space-y-2">
                  <Label htmlFor="full_name" className="text-sm font-bold flex items-center gap-2">
                    <User className="w-4 h-4 text-primary" />
                    How should we call you?
                  </Label>
                  <Input
                    id="full_name"
                    placeholder="e.g. Alex Rivera"
                    value={form.full_name}
                    onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                    className="h-12 bg-background/50 border-border/50 focus:border-primary/50 transition-all rounded-xl"
                  />
                </div>

                {/* Username */}
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-sm font-bold flex items-center gap-2">
                    <Globe className="w-4 h-4 text-primary" />
                    Choose your unique ID
                  </Label>
                  <div className="relative">
                    <Input
                      id="username"
                      placeholder="username"
                      value={form.username}
                      onChange={(e) => {
                        const val = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '');
                        setForm({ ...form, username: val });
                      }}
                      className={`h-12 bg-background/50 border-border/50 transition-all rounded-xl pr-10 ${
                        usernameStatus === 'unavailable' ? 'border-destructive focus-visible:ring-destructive' : 
                        usernameStatus === 'available' ? 'border-green-500 focus-visible:ring-green-500' : ''
                      }`}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {usernameStatus === 'checking' && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                      {usernameStatus === 'available' && <Check className="h-4 w-4 text-green-500" />}
                      {usernameStatus === 'unavailable' && <XCircle className="h-4 w-4 text-destructive" />}
                    </div>
                  </div>
                  <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                    grifi.in/u/{form.username || "username"}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Niche */}
                  <div className="space-y-2">
                    <Label className="text-sm font-bold flex items-center gap-2">
                      <Heart className="w-4 h-4 text-primary" />
                      Content Niche
                    </Label>
                    <Select value={form.niche} onValueChange={(v) => setForm({ ...form, niche: v })}>
                      <SelectTrigger className="h-12 bg-background/50 border-border/50 rounded-xl transition-all">
                        <SelectValue placeholder="Select one" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tech">Technology</SelectItem>
                        <SelectItem value="lifestyle">Lifestyle</SelectItem>
                        <SelectItem value="gaming">Gaming</SelectItem>
                        <SelectItem value="fitness">Fitness</SelectItem>
                        <SelectItem value="beauty">Beauty</SelectItem>
                        <SelectItem value="food">Food</SelectItem>
                        <SelectItem value="travel">Travel</SelectItem>
                        <SelectItem value="business">Business</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Main Platform */}
                  <div className="space-y-2">
                    <Label className="text-sm font-bold flex items-center gap-2">
                      <Globe className="w-4 h-4 text-primary" />
                      Main Platform
                    </Label>
                    <Select value={form.platform} onValueChange={(v) => setForm({ ...form, platform: v })}>
                      <SelectTrigger className="h-12 bg-background/50 border-border/50 rounded-xl transition-all">
                        <SelectValue placeholder="Select one" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="instagram">Instagram</SelectItem>
                        <SelectItem value="youtube">YouTube</SelectItem>
                        <SelectItem value="tiktok">TikTok</SelectItem>
                        <SelectItem value="twitter">Twitter/X</SelectItem>
                        <SelectItem value="linkedin">LinkedIn</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 text-lg font-bold rounded-xl shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all duration-300"
                disabled={saving || usernameStatus === 'unavailable' || !form.username || !form.full_name || !form.niche || !form.platform}
              >
                {saving ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Launching...
                  </>
                ) : (
                  "Start Exploring"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
        
        <p className="text-center mt-6 text-sm text-muted-foreground">
          By continuing, you agree to our Terms and Service.
        </p>
      </div>
    </div>
  );
}
