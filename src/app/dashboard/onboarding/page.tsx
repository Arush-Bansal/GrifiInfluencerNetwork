"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Check, XCircle, Rocket, User, Heart, Globe } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useCheckUsername, useUpdateProfile } from "@/hooks/use-profile";

// --- Constants & Schema ---

const NICHES = [
  { value: "tech", label: "Technology" },
  { value: "lifestyle", label: "Lifestyle" },
  { value: "gaming", label: "Gaming" },
  { value: "fitness", label: "Fitness" },
  { value: "beauty", label: "Beauty" },
  { value: "food", label: "Food" },
  { value: "travel", label: "Travel" },
  { value: "business", label: "Business" },
] as const;

const PLATFORMS = [
  { value: "instagram", label: "Instagram" },
  { value: "youtube", label: "YouTube" },
  { value: "tiktok", label: "TikTok" },
  { value: "twitter", label: "Twitter/X" },
  { value: "linkedin", label: "LinkedIn" },
] as const;

const formSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .regex(/^[a-z0-9_]+$/, "Only lowercase letters, numbers, and underscores"),
  full_name: z.string().min(1, "Full name is required"),
  niche: z.string().min(1, "Please select a niche"),
  platform: z.string().min(1, "Please select a platform"),
});

type FormValues = z.infer<typeof formSchema>;

// --- Components ---

import { OnboardingSkeleton } from "@/components/skeletons";

export default function OnboardingPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, profile, isLoading: authLoading } = useAuth();
  const updateProfile = useUpdateProfile();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      full_name: "",
      niche: "",
      platform: "",
    },
    mode: "onChange",
  });

  const watchedUsername = useWatch({
    control: form.control,
    name: "username",
  });
  
  const { data: checkData, isLoading: isCheckingUsername } = useCheckUsername(
    watchedUsername, 
    profile?.username || undefined
  );

  const isUsernameAvailable = checkData?.available;
  
  // Calculate username status
  let usernameStatus: 'idle' | 'checking' | 'available' | 'unavailable' = 'idle';
  if (isCheckingUsername) {
    usernameStatus = 'checking';
  } else if (watchedUsername.length >= 3) {
    usernameStatus = isUsernameAvailable ? 'available' : 'unavailable';
  }

  // Effect: Handle Authentication & Redirects
  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push("/auth");
      return;
    }

    if (profile?.username && profile?.full_name && profile?.niche && profile?.platform) {
      router.push("/dashboard");
    }
  }, [user, profile, authLoading, router]);

  // Effect: Initialize Form with User Data
  useEffect(() => {
    if (!user && !profile) return;
    
    // Check if we need to pre-fill. 
    // We only reset if the user hasn't started typing (isDirty is false)
    // or if the form is completely empty.
    if (!form.formState.isDirty) {
      const metadata = user?.user_metadata || {};
      const defaultValues = {
        username: profile?.username || metadata.username || "",
        full_name: profile?.full_name || metadata.full_name || "",
        niche: profile?.niche || metadata.niche || "",
        platform: profile?.platform || metadata.platform || "",
      };
      
      if (Object.values(defaultValues).some(Boolean)) {
        form.reset(defaultValues);
      }
    }
  }, [user, profile, form]);

  const onSubmit = async (data: FormValues) => {
    if (!user) return;

    if (usernameStatus === 'unavailable') {
      form.setError("username", { 
        type: "manual", 
        message: "This username is already taken." 
      });
      return;
    }

    try {
      await updateProfile.mutateAsync({
        userId: user.id,
        updates: data,
        authUpdates: data,
      });

      toast({
        title: "Welcome aboard!",
        description: "Your profile has been set up successfully.",
      });

      router.push("/dashboard");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Something went wrong.";
      console.error("Error saving profile:", error);
      toast({
        title: "Setup failed",
        description: message,
        variant: "destructive",
      });
    }
  };

  if (authLoading || updateProfile.isPending) {
    return <OnboardingSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/10 to-primary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-lg animate-in fade-in zoom-in duration-500">
        
        {/* Header Icon */}
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
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                
                {/* Full Name Field */}
                <FormField
                  control={form.control}
                  name="full_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <User className="w-4 h-4 text-primary" />
                        How should we call you?
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g. Alex Rivera" 
                          className="h-12 bg-background/50 border-border/50 rounded-xl"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Username Field */}
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-primary" />
                        Choose your unique ID
                      </FormLabel>
                      <div className="relative">
                        <FormControl>
                          <Input
                            placeholder="username"
                            className={`h-12 bg-background/50 border-border/50 rounded-xl pr-10 ${
                              usernameStatus === 'unavailable' ? 'border-destructive focus-visible:ring-destructive' : 
                              usernameStatus === 'available' ? 'border-green-500 focus-visible:ring-green-500' : ''
                            }`}
                            {...field}
                            onChange={(e) => {
                              // Enforce format on change
                              const val = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '');
                              field.onChange(val);
                            }}
                          />
                        </FormControl>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                          {usernameStatus === 'checking' && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                          {usernameStatus === 'available' && <Check className="h-4 w-4 text-green-500" />}
                          {usernameStatus === 'unavailable' && <XCircle className="h-4 w-4 text-destructive" />}
                        </div>
                      </div>
                      <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                        grifi.in/u/{watchedUsername || "username"}
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  {/* Niche Field */}
                  <FormField
                    control={form.control}
                    name="niche"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Heart className="w-4 h-4 text-primary" />
                          Content Niche
                        </FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-12 bg-background/50 border-border/50 rounded-xl">
                              <SelectValue placeholder="Select one" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {NICHES.map((niche) => (
                              <SelectItem key={niche.value} value={niche.value}>
                                {niche.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Platform Field */}
                  <FormField
                    control={form.control}
                    name="platform"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Globe className="w-4 h-4 text-primary" />
                          Main Platform
                        </FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-12 bg-background/50 border-border/50 rounded-xl">
                              <SelectValue placeholder="Select one" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {PLATFORMS.map((platform) => (
                              <SelectItem key={platform.value} value={platform.value}>
                                {platform.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-12 text-lg font-bold rounded-xl shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all duration-300"
                  disabled={updateProfile.isPending || usernameStatus === 'unavailable'}
                >
                  {updateProfile.isPending ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Launching...
                    </>
                  ) : (
                    "Start Exploring"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
        
        <p className="text-center mt-6 text-sm text-muted-foreground">
          By continuing, you agree to our Terms and Service.
        </p>
      </div>
    </div>
  );
}
