"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  Loader2, Check, XCircle, Rocket, User, Heart, Globe, 
  Mail, Instagram, Twitter as TwitterIcon, Youtube, 
  ArrowRight, ArrowLeft, Plus, Sparkles, Briefcase, 
  CheckCircle2, Building
} from "lucide-react";

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
import { supabase } from "@/integrations/supabase/client";
import { OnboardingSkeleton } from "@/components/skeletons";
import { cn } from "@/lib/utils";

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

const SERVICE_OPTIONS = [
  { value: "brand_collabs", label: "Brand Collaborations" },
  { value: "ugc", label: "UGC Creation" },
  { value: "reviews", label: "Product Reviews" },
  { value: "appearances", label: "Event Appearances" },
  { value: "consulting", label: "Strategy Consulting" },
  { value: "management", label: "Social Management" },
  { value: "affiliate", label: "Affiliate Marketing" },
  { value: "promotion", label: "Product Promotion" },
  { value: "streaming", label: "Live Streaming" },
  { value: "modeling", label: "Ambassadorship" },
] as const;

const formSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .regex(/^[a-z0-9_]+$/, "Only lowercase letters, numbers, and underscores"),
  full_name: z.string().min(1, "Full name is required"),
  niche: z.string().min(1, "Please select a niche"),
  platform: z.string().min(1, "Please select a platform"),
  youtube_url: z.string().optional(),
  instagram_url: z.string().optional(),
  twitter_url: z.string().optional(),
  public_email: z.string().email("Invalid email address").optional().or(z.literal("")),
  services: z.array(z.string()).min(1, "Please select at least one service"),
  featured_reel_url: z.string().optional(),
  featured_reel_title: z.string().optional(),
  brand_name: z.string().optional(),
  brand_logo_url: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function OnboardingPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, profile, isLoading: authLoading } = useAuth();
  const updateProfile = useUpdateProfile();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isFinishing, setIsFinishing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      full_name: "",
      niche: "",
      platform: "",
      youtube_url: "",
      instagram_url: "",
      twitter_url: "",
      public_email: "",
      services: [],
      featured_reel_url: "",
      featured_reel_title: "",
      brand_name: "",
      brand_logo_url: "",
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

    // Check if onboarding is already complete
    if (profile?.username && profile?.full_name && (profile as Record<string, any>)?.onboarding_completed) {
      router.push("/dashboard");
    }
  }, [user, profile, authLoading, router]);

  // Effect: Initialize Form with User Data
  useEffect(() => {
    if (!user) return;
    
    if (!form.formState.isDirty) {
      const metadata = user?.user_metadata || {};
      const defaultValues = {
        username: profile?.username || metadata.username || "",
        full_name: profile?.full_name || metadata.full_name || "",
        niche: profile?.niche || metadata.niche || "",
        platform: profile?.platform || metadata.platform || "",
        youtube_url: (profile as Record<string, any>)?.youtube_url || "",
        instagram_url: (profile as Record<string, any>)?.instagram_url || "",
        twitter_url: (profile as Record<string, any>)?.twitter_url || "",
        public_email: (profile as Record<string, any>)?.public_email || user.email || "",
        services: (profile as Record<string, any>)?.services || [],
        featured_reel_url: "",
        featured_reel_title: "",
        brand_name: "",
        brand_logo_url: "",
      };
      
      form.reset(defaultValues);
    }
  }, [user, profile, form]);

  const nextStep = async () => {
    let fieldsToValidate: (keyof FormValues)[] = [];
    if (currentStep === 1) fieldsToValidate = ['full_name', 'username', 'niche', 'platform'];
    if (currentStep === 2) fieldsToValidate = ['public_email'];
    if (currentStep === 3) fieldsToValidate = ['services'];
    if (currentStep === 4) fieldsToValidate = ['featured_reel_url'];

    const isValid = await form.trigger(fieldsToValidate);
    if (isValid) {
      if (currentStep === 1 && usernameStatus === 'unavailable') {
        form.setError("username", { message: "Username is already taken" });
        return;
      }
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => setCurrentStep(prev => prev - 1);

  const onSubmit = async (data: FormValues) => {
    if (!user) return;

    try {
      setIsFinishing(true);
      
      // Update profile
      await updateProfile.mutateAsync({
        userId: user.id,
        updates: {
          username: data.username,
          full_name: data.full_name,
          niche: data.niche,
          platform: data.platform,
          youtube_url: data.youtube_url || null,
          instagram_url: data.instagram_url || null,
          twitter_url: data.twitter_url || null,
          public_email: data.public_email || null,
          services: data.services,
          onboarding_completed: true,
        } as any,
        authUpdates: {
          full_name: data.full_name,
          username: data.username,
        },
      });

      // Handle featured reel if provided
      if (data.featured_reel_url) {
        await supabase
          .from("featured_reels")
          .insert({
            profile_id: user.id,
            video_url: data.featured_reel_url,
            title: data.featured_reel_title || "Featured Work",
          });
      }

      // Handle brand collaboration if provided
      if (data.brand_name) {
        await supabase
          .from("past_collaborations")
          .insert({
            profile_id: user.id,
            brand_name: data.brand_name,
            brand_logo_url: data.brand_logo_url || null,
          });
      }

      // Mark onboarding as completed (implicitly by having entries, 
      // but we could also add a flag if we had the column)

      // Success sequence
      setShowSuccess(true);
      setTimeout(() => {
        toast({
          title: "Welcome aboard!",
          description: "Your professional creator presence is ready.",
        });
        router.push(`/u/${data.username}`);
      }, 2500);

    } catch (error: unknown) {
      setIsFinishing(false);
      const message = error instanceof Error ? error.message : "Something went wrong.";
      toast({
        title: "Setup failed",
        description: message,
        variant: "destructive",
      });
    }
  };

  if (authLoading || isFinishing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background space-y-6">
        {showSuccess ? (
          <div className="flex flex-col items-center space-y-4 animate-in fade-in zoom-in duration-500">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
              <Sparkles className="w-10 h-10 text-primary animate-pulse" />
            </div>
            <h2 className="text-2xl font-black italic tracking-tight">CREATING YOUR BUSINESS PRESENCE...</h2>
            <div className="w-48 h-1 bg-secondary rounded-full overflow-hidden">
              <div className="h-full bg-primary animate-progress" />
            </div>
          </div>
        ) : (
          <OnboardingSkeleton />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/10 to-primary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-lg animate-in fade-in zoom-in duration-500">
        
        {/* Progress Bar */}
        <div className="flex justify-between mb-8 px-2">
          {[1, 2, 3, 4, 5].map((s) => (
            <div 
              key={s} 
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                s === currentStep ? "w-12 bg-primary" : 
                s < currentStep ? "w-8 bg-primary/40" : "w-8 bg-muted"
              )}
            />
          ))}
        </div>

        <Card className="border-none shadow-2xl bg-card/80 backdrop-blur-xl">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-3xl font-black italic tracking-tighter bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent uppercase text-center">
              {currentStep === 1 && "Start Your Journey"}
              {currentStep === 2 && "Connect Your Socials"}
              {currentStep === 3 && "What You Offer"}
              {currentStep === 4 && "Portfolio Samples"}
              {currentStep === 5 && "Brand Relationships"}
            </CardTitle>
            <CardDescription className="text-lg text-center">
              {currentStep === 1 && "First, let's get the basics right."}
              {currentStep === 2 && "Where can brands find your work?"}
              {currentStep === 3 && "Select the services you provide to clients."}
              {currentStep === 4 && "Add a link to your best work/reel."}
              {currentStep === 5 && "Which brands have you worked with?"}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                
                {currentStep === 1 && (
                  <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                    <FormField
                      control={form.control}
                      name="full_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <User className="w-4 h-4 text-primary" />
                            Full Name
                          </FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Alex Rivera" 
                              className="h-12 bg-background/50 border-border/50 rounded-xl"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Globe className="w-4 h-4 text-primary" />
                            User ID
                          </FormLabel>
                          <div className="relative">
                            <FormControl>
                              <Input
                                placeholder="username"
                                className={cn(
                                  "h-12 bg-background/50 border-border/50 rounded-xl pr-10",
                                  usernameStatus === 'unavailable' && "border-destructive focus-visible:ring-destructive",
                                  usernameStatus === 'available' && "border-green-500 focus-visible:ring-green-500"
                                )}
                                {...field}
                                onChange={(e) => {
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
                          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                            grifi.in/u/{watchedUsername || "username"}
                          </p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="niche"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2">
                              <Heart className="w-4 h-4 text-primary" />
                              Niche
                            </FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                              <FormControl>
                                <SelectTrigger className="h-12 bg-background/50 border-border/50 rounded-xl">
                                  <SelectValue placeholder="Select" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {NICHES.map((niche) => (
                                  <SelectItem key={niche.value} value={niche.value}>{niche.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

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
                                  <SelectValue placeholder="Select" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {PLATFORMS.map((platform) => (
                                  <SelectItem key={platform.value} value={platform.value}>{platform.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                    <FormField
                      control={form.control}
                      name="public_email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4 text-primary" />
                              Professional Email
                            </div>
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="sm" 
                              className="h-6 text-[10px] uppercase font-bold text-primary hover:text-primary"
                              onClick={() => form.setValue('public_email', user?.email || '')}
                            >
                              Same as login
                            </Button>
                          </FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="collab@yourbrand.com" 
                              className="h-12 bg-background/50 border-border/50 rounded-xl"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="space-y-4">
                      <FormLabel className="flex items-center gap-2 text-muted-foreground">
                        <Plus className="w-4 h-4" />
                        Social Handles (Optional)
                      </FormLabel>
                      
                      <FormField
                        control={form.control}
                        name="instagram_url"
                        render={({ field }) => (
                          <div className="relative group">
                            <Instagram className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <Input 
                              placeholder="instagram_handle" 
                              className="h-12 pl-12 bg-background/50 border-border/50 rounded-xl"
                              {...field} 
                            />
                          </div>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="youtube_url"
                        render={({ field }) => (
                          <div className="relative group">
                            <Youtube className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <Input 
                              placeholder="youtube_channel_id" 
                              className="h-12 pl-12 bg-background/50 border-border/50 rounded-xl"
                              {...field} 
                            />
                          </div>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="twitter_url"
                        render={({ field }) => (
                          <div className="relative group">
                            <TwitterIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <Input 
                              placeholder="twitter_handle" 
                              className="h-12 pl-12 bg-background/50 border-border/50 rounded-xl"
                              {...field} 
                            />
                          </div>
                        )}
                      />
                    </div>
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                    <FormLabel className="flex items-center gap-2">
                       <Briefcase className="w-4 h-4 text-primary" />
                       Select your services
                    </FormLabel>
                    <div className="grid grid-cols-2 gap-3">
                      {SERVICE_OPTIONS.map((option) => {
                        const isSelected = form.getValues('services')?.includes(option.value);
                        return (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => {
                              const current = form.getValues('services') || [];
                              if (current.includes(option.value)) {
                                form.setValue('services', current.filter(v => v !== option.value));
                              } else {
                                form.setValue('services', [...current, option.value]);
                              }
                              form.trigger('services');
                            }}
                            className={cn(
                              "flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-200 gap-2",
                              isSelected 
                                ? "bg-primary/10 border-primary text-primary shadow-lg shadow-primary/5" 
                                : "bg-background/50 border-border/50 text-muted-foreground hover:border-primary/50"
                            )}
                          >
                            <span className="text-[11px] font-black uppercase text-center leading-tight">
                              {option.label}
                            </span>
                            {isSelected && <CheckCircle2 className="w-4 h-4" />}
                          </button>
                        );
                      })}
                    </div>
                    <FormField
                      control={form.control}
                      name="services"
                      render={() => <FormMessage />}
                    />
                  </div>
                )}

                {currentStep === 4 && (
                  <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                    <div className="p-6 bg-primary/5 border border-primary/20 rounded-[2rem] space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                          <Rocket className="text-primary-foreground w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm italic">FEATURE YOUR BEST WORK</h4>
                          <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">Help brands see your value instantly</p>
                        </div>
                      </div>

                      <FormField
                        control={form.control}
                        name="featured_reel_title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[10px] font-bold uppercase tracking-widest">Project Title</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="My Viral Campaign" 
                                className="h-10 bg-background/50 border-border/50 rounded-lg"
                                {...field} 
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="featured_reel_url"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[10px] font-bold uppercase tracking-widest">Video/Work Link</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="https://instagram.com/reel/..." 
                                className="h-10 bg-background/50 border-border/50 rounded-lg"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="flex items-center gap-2 p-4 bg-secondary/20 rounded-2xl border border-secondary/10">
                      <Sparkles className="w-5 h-5 text-secondary shrink-0" />
                      <p className="text-[11px] font-medium leading-relaxed italic">
                        Tip: Profiles with featured work get 4x more collab requests from brands.
                      </p>
                    </div>
                  </div>
                )}

                {currentStep === 5 && (
                  <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                    <div className="p-6 bg-primary/5 border border-primary/20 rounded-[2rem] space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                          <Building className="text-primary-foreground w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm italic uppercase">Past Collaborations</h4>
                          <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest text-left">Who has trusted your brand?</p>
                        </div>
                      </div>

                      <FormField
                        control={form.control}
                        name="brand_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[10px] font-bold uppercase tracking-widest">Brand Name</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="e.g. Nike, Red Bull, etc." 
                                className="h-10 bg-background/50 border-border/50 rounded-lg text-left"
                                {...field} 
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="brand_logo_url"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-left">Brand Logo URL (Optional)</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="https://logo-url.com/logo.png" 
                                className="h-10 bg-background/50 border-border/50 rounded-lg text-left"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="flex items-center gap-2 p-4 bg-secondary/20 rounded-2xl border border-secondary/10">
                      <Sparkles className="w-5 h-5 text-secondary shrink-0" />
                      <p className="text-[11px] font-medium leading-relaxed italic text-left">
                        Brand names help build immediate authority and trust with new potential clients.
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex gap-4 pt-4">
                  {currentStep > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1 h-12 rounded-xl text-lg font-bold"
                      onClick={prevStep}
                      disabled={isFinishing}
                    >
                      <ArrowLeft className="w-5 h-5 mr-2" />
                      Back
                    </Button>
                  )}
                  
                  {currentStep < 5 ? (
                    <Button
                      type="button"
                      className="flex-[2] h-12 rounded-xl text-lg font-bold shadow-xl shadow-primary/20"
                      onClick={nextStep}
                    >
                      Next Step
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      className="flex-[2] h-12 rounded-xl text-lg font-bold shadow-xl shadow-primary/20"
                      disabled={isFinishing}
                    >
                      {isFinishing ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          Complete Setup
                          <Rocket className="w-5 h-5 ml-2" />
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
        
        <p className="text-center mt-8 text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
           Step {currentStep} of 5 • Building your digital identity
        </p>
      </div>
    </div>
  );
}
