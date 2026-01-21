"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Logo } from "@/components/brand/Logo";
import { 
  Loader2, Check, XCircle, Rocket, User, Heart, Globe, 
  Mail, Instagram, Twitter as TwitterIcon, Youtube, 
  ArrowRight, ArrowLeft, Plus, Sparkles, Briefcase, 
  CheckCircle2, Building, Star, PlayCircle
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
// import { OnboardingSkeleton } from "@/components/skeletons";
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
    if (profile?.username && profile?.full_name && (profile as any)?.onboarding_completed) {
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
        youtube_url: (profile as any)?.youtube_url || "",
        instagram_url: (profile as any)?.instagram_url || "",
        twitter_url: (profile as any)?.twitter_url || "",
        public_email: (profile as any)?.public_email || user.email || "",
        services: (profile as any)?.services || [],
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

      // SUCCESS COMPONENT (OPTIONAL REFACTOR)
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
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAFAFA] space-y-8">
        <div className="absolute inset-0 bg-noise opacity-5 pointer-events-none" />
        {showSuccess ? (
          <div className="flex flex-col items-center space-y-6 animate-in fade-in zoom-in duration-700 relative z-10">
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
              <Sparkles className="w-12 h-12 text-primary animate-pulse" />
            </div>
            <div className="text-center">
              <h2 className="text-3xl font-black tracking-tight text-slate-900">PREPARING YOUR PROFILE</h2>
              <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mt-2">Elevating your professional identity...</p>
            </div>
            <div className="w-64 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-primary animate-progress" />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 relative z-10">
            <Logo size={64} className="animate-bounce" />
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Securing Session</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-noise opacity-5 pointer-events-none" />
      
      {/* Background Orbs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[120px] animate-blob" />
          <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-blue-400/5 rounded-full blur-[100px] animate-blob animation-delay-2000" />
      </div>

      <div className="w-full max-w-xl animate-in fade-in slide-in-from-bottom-8 duration-700 relative z-10">
        
        {/* Progress Header */}
        <div className="flex items-center justify-between mb-12 px-2">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Onboarding Flow</span>
            <div className="flex items-center gap-2">
              <h3 className="text-2xl font-black tracking-tight text-slate-900">Professional Setup</h3>
              <span className="text-slate-300 font-bold text-xl">/</span>
              <span className="text-slate-400 font-bold">Step {currentStep}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4, 5].map((s) => (
              <div 
                key={s} 
                className={cn(
                  "h-1.5 rounded-full transition-all duration-500",
                  s === currentStep ? "w-8 bg-primary" : 
                  s < currentStep ? "w-2 bg-primary/40" : "w-2 bg-slate-200"
                )}
              />
            ))}
          </div>
        </div>

        <Card className="border-none shadow-[0_32px_64px_-15px_rgba(0,0,0,0.1)] bg-white rounded-[3rem] overflow-hidden">
          <CardHeader className="text-left pt-12 px-10 pb-4">
            <CardTitle className="text-4xl font-black tracking-tight text-slate-900 leading-tight">
              {currentStep === 1 && "The Essentials"}
              {currentStep === 2 && "Social Footprint"}
              {currentStep === 3 && "Core Services"}
              {currentStep === 4 && "Showcase Samples"}
              {currentStep === 5 && "Industry Network"}
            </CardTitle>
            <CardDescription className="text-base text-slate-500 font-medium pt-2">
              {currentStep === 1 && "Let's build your professional identifier on the network."}
              {currentStep === 2 && "Synchronize your presence across platforms."}
              {currentStep === 3 && "Which areas of expertise define your brand?"}
              {currentStep === 4 && "Add your most high-impact work sample."}
              {currentStep === 5 && "Highlight the brands that have trusted you."}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="px-10 pb-12">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                
                {currentStep === 1 && (
                  <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                    <FormField
                      control={form.control}
                      name="full_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Full Name</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Alex Rivera" 
                              className="h-14 rounded-2xl border-slate-100 bg-[#FAFAFA] shadow-inner shadow-slate-50 focus:border-primary/30 focus:ring-4 focus:ring-primary/5 transition-all px-6"
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
                          <FormLabel className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Universal ID (Username)</FormLabel>
                          <div className="relative">
                            <FormControl>
                              <Input
                                placeholder="username"
                                className={cn(
                                  "h-14 rounded-2xl border-slate-100 bg-[#FAFAFA] shadow-inner shadow-slate-50 focus:border-primary/30 focus:ring-4 focus:ring-primary/5 transition-all px-6",
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
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                              {usernameStatus === 'checking' && <Loader2 className="h-5 w-5 animate-spin text-slate-400" />}
                              {usernameStatus === 'available' && <Check className="h-5 w-5 text-green-500" />}
                              {usernameStatus === 'unavailable' && <XCircle className="h-5 w-5 text-destructive" />}
                            </div>
                          </div>
                          <p className="text-[10px] text-primary font-bold uppercase tracking-[0.2em] ml-1">
                            grifi.in/u/{watchedUsername || "username"}
                          </p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="niche"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Core Niche</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                              <FormControl>
                                <SelectTrigger className="h-14 rounded-2xl border-slate-100 bg-[#FAFAFA] shadow-inner shadow-slate-50 focus:border-primary/30 focus:ring-4 focus:ring-primary/5 transition-all px-6">
                                  <SelectValue placeholder="Select" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="rounded-2xl border-slate-100">
                                {NICHES.map((niche) => (
                                  <SelectItem key={niche.value} value={niche.value} className="rounded-xl">{niche.label}</SelectItem>
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
                            <FormLabel className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Main Platform</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                              <FormControl>
                                <SelectTrigger className="h-14 rounded-2xl border-slate-100 bg-[#FAFAFA] shadow-inner shadow-slate-50 focus:border-primary/30 focus:ring-4 focus:ring-primary/5 transition-all px-6">
                                  <SelectValue placeholder="Select" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="rounded-2xl border-slate-100">
                                {PLATFORMS.map((platform) => (
                                  <SelectItem key={platform.value} value={platform.value} className="rounded-xl">{platform.label}</SelectItem>
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
                          <FormLabel className="flex items-center justify-between ml-1">
                            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Professional Email</span>
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="sm" 
                              className="h-6 text-[10px] uppercase font-bold text-primary hover:text-primary hover:bg-primary/5"
                              onClick={() => form.setValue('public_email', user?.email || '')}
                            >
                              Same as login
                            </Button>
                          </FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="collab@yourbrand.com" 
                              className="h-14 rounded-2xl border-slate-100 bg-[#FAFAFA] shadow-inner shadow-slate-50 focus:border-primary/30 focus:ring-4 focus:ring-primary/5 transition-all px-6"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="space-y-4">
                      <span className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1 block mb-2">Social Hub (Optional)</span>
                      
                      <FormField
                        control={form.control}
                        name="instagram_url"
                        render={({ field }) => (
                          <div className="relative group">
                            <Instagram className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                            <Input 
                              placeholder="instagram_handle" 
                              className="h-14 pl-14 rounded-2xl border-slate-100 bg-[#FAFAFA] shadow-inner shadow-slate-50 focus:border-primary/30 focus:ring-4 focus:ring-primary/5 transition-all px-6"
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
                            <Youtube className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                            <Input 
                              placeholder="youtube_channel_id" 
                              className="h-14 pl-14 rounded-2xl border-slate-100 bg-[#FAFAFA] shadow-inner shadow-slate-50 focus:border-primary/30 focus:ring-4 focus:ring-primary/5 transition-all px-6"
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
                            <TwitterIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                            <Input 
                              placeholder="twitter_handle" 
                              className="h-14 pl-14 rounded-2xl border-slate-100 bg-[#FAFAFA] shadow-inner shadow-slate-50 focus:border-primary/30 focus:ring-4 focus:ring-primary/5 transition-all px-6"
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
                    <div className="grid grid-cols-2 gap-4">
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
                              "flex flex-col items-center justify-center p-6 rounded-[2rem] border-2 transition-all duration-300 gap-3 group relative overflow-hidden",
                              isSelected 
                                ? "bg-primary text-white border-primary shadow-xl shadow-primary/20 scale-[1.02]" 
                                : "bg-[#FAFAFA] border-slate-100 text-slate-400 hover:border-primary/30 hover:bg-white"
                            )}
                          >
                            <span className="text-[11px] font-black uppercase text-center leading-tight tracking-widest relative z-10">
                              {option.label}
                            </span>
                            {isSelected ? (
                              <CheckCircle2 className="w-5 h-5 relative z-10" />
                            ) : (
                                <Plus className="w-4 h-4 text-slate-200 group-hover:text-primary transition-colors" />
                            )}
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
                    <div className="p-8 bg-[#FAFAFA] border border-slate-100 rounded-[2.5rem] space-y-6 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-8 opacity-5">
                          <PlayCircle size={100} />
                      </div>
                      <div className="flex items-center gap-4 relative z-10">
                        <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
                          <Rocket className="text-white w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="font-black text-slate-900 tracking-tight uppercase">Featured Work</h4>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Showcase your viral impact</p>
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
                    <div className="p-8 bg-[#FAFAFA] border border-slate-100 rounded-[2.5rem] space-y-6 relative overflow-hidden">
                       <div className="absolute top-0 right-0 p-8 opacity-5">
                          <Building size={100} />
                      </div>
                      <div className="flex items-center gap-4 relative z-10">
                        <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center shadow-lg shadow-slate-200">
                          <Building className="text-white w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="font-black text-slate-900 tracking-tight uppercase">Brand Trust</h4>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest text-left">Who have you partnered with?</p>
                        </div>
                      </div>

                      <FormField
                        control={form.control}
                        name="brand_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Featured Brand Name</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="e.g. Nike, Red Bull, etc." 
                                className="h-14 rounded-2xl border-slate-100 bg-[#FAFAFA] shadow-inner shadow-slate-50 focus:border-primary/30 focus:ring-4 focus:ring-primary/5 transition-all px-6 text-left"
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
                            <FormLabel className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Brand Identity URL (Optional)</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="https://logo-url.com/logo.png" 
                                className="h-14 rounded-2xl border-slate-100 bg-[#FAFAFA] shadow-inner shadow-slate-50 focus:border-primary/30 focus:ring-4 focus:ring-primary/5 transition-all px-6 text-left"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-2xl border border-primary/10">
                      <Sparkles className="w-5 h-5 text-primary shrink-0" />
                      <p className="text-[11px] font-bold text-slate-500 leading-relaxed italic text-left uppercase tracking-widest">
                        Social proof converts brands 3x faster.
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex gap-4 pt-8">
                  {currentStep > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      className="flex-1 h-14 rounded-full text-base font-bold text-slate-500 hover:text-slate-900 transition-all"
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
                      className="flex-[2] h-14 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-base font-bold shadow-xl shadow-slate-200 transition-all hover:scale-[1.02] active:scale-[0.98]"
                      onClick={nextStep}
                    >
                      Next Step
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      className="flex-[2] h-14 rounded-full bg-primary hover:bg-primary/90 text-white text-base font-bold shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
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
        
        <p className="text-center mt-10 text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em]">
           STEP {currentStep} OF 5 • VERIFYING PROFESSIONAL IDENTITY
        </p>
      </div>
    </div>
  );
}
