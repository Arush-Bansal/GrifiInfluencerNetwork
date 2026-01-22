"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase, getURL } from "@/integrations/supabase/client";
import { z } from "zod";
import { Briefcase, Building2, ArrowLeft, Loader2, Sparkles, Users, Mail, CheckCircle2, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { User, AuthChangeEvent } from "@supabase/supabase-js";
import { Logo } from "@/components/brand/Logo";

const authSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type UserRole = "influencer" | "creator_ops" | "brand" | "agency";

const ROLES: { id: UserRole; title: string; description: string; icon: LucideIcon }[] = [
  {
    id: "influencer",
    title: "Influencer",
    description: "I create content and collaborate with brands.",
    icon: Sparkles,
  },
  {
    id: "creator_ops",
    title: "Creator Ops",
    description: "I manage operations for creators.",
    icon: Briefcase,
  },
  {
    id: "brand",
    title: "Brand",
    description: "I want to hire creators for campaigns.",
    icon: Building2,
  },
  {
    id: "agency",
    title: "Agency",
    description: "I represent multiple creators or brands.",
    icon: Users,
  },
];

const BLOCKED_DOMAINS = [
  "gmail.com", "googlemail.com",
  "yahoo.com", "yahoo.co.uk", "yahoo.in", "yahoo.ca", "ymail.com", "rocketmail.com",
  "hotmail.com", "hotmail.co.uk", "hotmail.fr", "hotmail.it", "outlook.com", "live.com", "msn.com",
  "icloud.com", "me.com", "mac.com",
  "aol.com",
  "protonmail.com", "proton.me",
  "zoho.com", "zoho.in",
  "gmx.com", "gmx.net", "gmx.de",
  "yandex.com", "yandex.ru",
  "mail.com", "mail.ru", "bk.ru", "inbox.ru", "list.ru",
  "rediffmail.com",
  "hushmail.com",
  "fastmail.com", "fastmail.fm",
  "t-online.de", "web.de", "freenet.de",
];

const isPublicEmail = (email: string) => {
  const domain = email.split("@")[1]?.toLowerCase();
  return BLOCKED_DOMAINS.includes(domain);
};

const AuthContent = () => {
  const searchParams = useSearchParams();
  const [isSignUp, setIsSignUp] = useState(searchParams.get("mode") === "signup");
  const [role, setRole] = useState<UserRole | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [resending, setResending] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const checkUserAccess = async (user: User | null) => {
      if (user) {
        const userRole = user.user_metadata?.role;
        if (userRole === "brand" && isPublicEmail(user.email || "")) {
          await supabase.auth.signOut();
          toast({
            title: "Access Restricted",
            description: "Brand accounts must use a company email address.",
            variant: "destructive",
          });
          return false;
        }
        return true;
      }
      return false;
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session) => {
      if (event === "PASSWORD_RECOVERY") {
        console.log("Password recovery event detected, redirecting to update-password");
        router.push("/auth/update-password");
        return;
      }
      
      if (session?.user) {
        const canAccess = await checkUserAccess(session.user);
        if (canAccess) {
          router.push("/dashboard");
        }
      }
    });

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        // If we have a hash with type=recovery, don't redirect to dashboard
        if (typeof window !== 'undefined' && window.location.hash.includes('type=recovery')) {
          console.log("Recovery hash detected in getSession, skipping dashboard redirect");
          return;
        }

        const canAccess = await checkUserAccess(session.user);
        if (canAccess) {
          router.push("/dashboard");
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [router, toast]);

  // Reset role when switching between login and signup
  useEffect(() => {
    if (!isSignUp) {
      setRole(null);
    }
  }, [isSignUp]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const validation = authSchema.safeParse({ email, password });
    if (!validation.success) {
      toast({
        title: "Validation Error",
        description: validation.error.errors[0].message,
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    try {
      if (isSignUp) {
        if (!role) {
          toast({
            title: "Role Required",
            description: "Please select a user type to continue.",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }

        // Brand-specific email validation
        if (role === "brand" && isPublicEmail(email)) {
          toast({
            title: "Company Email Required",
            description: "Brands must use a company email address (e.g., name@company.com). Public email providers like Gmail or Yahoo are not allowed.",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }

        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${getURL()}dashboard`,
            data: { name, role },
          },
        });
        
        if (error) {
          if (error.message.includes("already registered")) {
            toast({
              title: "Account exists",
              description: "This email is already registered. Please log in instead.",
              variant: "destructive",
            });
          } else {
            throw error;
          }
        } else {
          setShowVerification(true);
          toast({
            title: "Verification Email Sent",
            description: "Please check your inbox to verify your account.",
          });
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) {
          if (error.message.includes("Invalid login")) {
            toast({
              title: "Login failed",
              description: "Invalid email or password. Please try again.",
              variant: "destructive",
            });
          } else {
            throw error;
          }
        } else if (data?.user) {
          // Check if this is a brand account with a public email
          const userRole = data.user.user_metadata?.role;
          if (userRole === "brand" && isPublicEmail(data.user.email || "")) {
            await supabase.auth.signOut();
            toast({
              title: "Access Restricted",
              description: "Brand accounts must use a company email address. Your account uses a public email provider which is no longer permitted for brands.",
              variant: "destructive",
            });
            setLoading(false);
            return;
          }
        }
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Something went wrong. Please try again.";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmail = async () => {
    if (!email) return;
    setResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${getURL()}dashboard`,
        }
      });
      if (error) throw error;
      toast({
        title: "Email Resent",
        description: "A new verification link has been sent to your email.",
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to resend email. Please try again later.";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setResending(false);
    }
  };

  const handleRoleSelect = (selectedRole: UserRole) => {
    setRole(selectedRole);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 overflow-y-auto">
        <div className="w-full max-w-md space-y-8">
          
          {/* Header */}
          <div className="flex flex-col space-y-2 text-left">
            <Link href="/" className="flex items-center gap-2 mb-8 w-fit group transition-all">
              <Logo size={40} />
              <span className="text-2xl font-bold tracking-tight text-slate-900 group-hover:text-primary transition-colors">GRIFI</span>
            </Link>

            <h1 className="text-4xl font-bold tracking-tight text-slate-900">
              {isSignUp 
                ? (role ? `Join as ${ROLES.find(r => r.id === role)?.title}` : "Create your account") 
                : "Welcome back"}
            </h1>
            <p className="text-slate-500 text-base font-medium">
              {showVerification 
                ? "Verify your email to complete your registration."
                : (isSignUp 
                  ? (role ? "Enter your details to get started." : "Choose how you want to use Grifi.") 
                  : "Log in to access your professional network.")
              }
            </p>
          </div>

          {/* Verification Pending View */}
          {showVerification && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-primary/5 border border-primary/10 rounded-2xl p-6 text-center space-y-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <Mail className="w-8 h-8 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Check your inbox</h3>
                  <p className="text-sm text-muted-foreground">
                    We&apos;ve sent a verification link to <span className="font-semibold text-foreground">{email}</span>. 
                    Please click the link to verify your account and continue.
                  </p>
                </div>
              </div>

              <div className="space-y-4 pt-2">
                <Button 
                  onClick={handleResendEmail} 
                  className="w-full h-11 text-base font-medium" 
                  variant="default"
                  disabled={resending}
                >
                  {resending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Resend verification email
                </Button>
                <Button 
                  onClick={() => {
                    setShowVerification(false);
                    setIsSignUp(false);
                  }} 
                  className="w-full h-11 text-muted-foreground hover:text-foreground" 
                  variant="ghost"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back to login
                </Button>
              </div>

              <div className="flex items-center gap-2 p-4 bg-muted/40 rounded-xl">
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                <p className="text-[11px] text-muted-foreground leading-snug">
                  Didn&apos;t receive it? Check your spam folder or click above to resend.
                </p>
              </div>
            </div>
          )}

          {/* Role Selection Step */}
          {isSignUp && !role && !showVerification && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {ROLES.map((r) => {
                const Icon = r.icon;
                return (
                  <Card 
                    key={r.id}
                    className={cn(
                      "cursor-pointer hover:border-primary/20 hover:bg-white hover:shadow-2xl hover:shadow-primary/5 transition-all duration-300 group relative overflow-hidden",
                      "border-slate-100 bg-white/50 shadow-sm rounded-[1.5rem]"
                    )}
                    onClick={() => handleRoleSelect(r.id)}
                  >
                    <CardContent className="p-6 flex flex-col gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300 flex items-center justify-center">
                        <Icon size={24} />
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-bold text-slate-900 group-hover:text-primary transition-colors">{r.title}</h3>
                        <p className="text-xs text-slate-500 font-medium leading-relaxed">{r.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Auth Form */}
          {(!isSignUp || role) && !showVerification && (
            <form onSubmit={handleSubmit} className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
              
              {isSignUp && (
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    required
                    className="h-11"
                  />
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  required
                  className="h-14 rounded-2xl border-slate-100 bg-white shadow-inner shadow-slate-50 focus:border-primary/30 focus:ring-4 focus:ring-primary/5 transition-all px-6"
                />
                {isSignUp && role === "brand" && (
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest ml-1">
                    * Brand accounts require a company email.
                  </p>
                )}
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between ml-1">
                  <Label htmlFor="password" className="text-xs font-bold uppercase tracking-widest text-slate-400">Password</Label>
                  {!isSignUp && (
                    <Link 
                      href="/auth/reset-password" 
                      className="text-xs font-bold text-primary hover:text-primary/80 transition-colors"
                    >
                      Forgot?
                    </Link>
                  )}
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="h-14 rounded-2xl border-slate-100 bg-white shadow-inner shadow-slate-50 focus:border-primary/30 focus:ring-4 focus:ring-primary/5 transition-all px-6"
                />
              </div>

              <div className="flex flex-col gap-4 pt-4">
                <Button 
                  type="submit" 
                  className="w-full h-14 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-lg shadow-xl shadow-slate-200 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  disabled={loading}
                >
                  {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                  {isSignUp ? "Create My Account" : "Sign In to Grifi"}
                </Button>

                {isSignUp && role && (
                  <Button 
                    type="button" 
                    variant="ghost" 
                    onClick={() => setRole(null)}
                    className="w-full h-12 rounded-full font-bold text-slate-500 hover:text-slate-900"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
                  </Button>
                )}
              </div>
            </form>
          )}

          {/* Toggle Login/Signup */}
          {!showVerification && (
            <div className="text-center text-sm">
              <span className="text-muted-foreground">
                {isSignUp ? "Already have an account? " : "New to Grifi? "}
              </span>
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  if (!isSignUp) setRole(null); // Reset role if switching to signup
                }}
                className="font-medium text-primary hover:underline underline-offset-4 transition-all"
              >
                {isSignUp ? "Log in" : "Sign up"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Right side - Visual */}
      <div className="hidden lg:flex flex-1 bg-slate-900 relative overflow-hidden items-center justify-center p-12">
        {/* Background Effects */}
        <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-primary/20 rounded-full blur-[120px] opacity-50" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-blue-500/10 rounded-full blur-[100px] opacity-30" />
        </div>

        <div className="max-w-md text-center space-y-10 relative z-10 p-8">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-[2rem] bg-white mb-4 shadow-2xl shadow-black/20 ring-8 ring-white/10 p-5 rotate-3 hover:rotate-0 transition-transform duration-500">
            <Logo size={80} />
          </div>
          
          <div className="space-y-6">
            <h2 className="text-4xl font-bold tracking-tight text-white leading-tight">
              The Professional Identity Layer of the <span className="text-primary italic">Creator Economy</span>
            </h2>
            <p className="text-slate-400 text-lg font-medium leading-relaxed">
              Connect, collaborate, and grow. Grifi is where India&apos;s top creators and brands build their professional future.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-left pt-6">
            <div className="p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl group hover:bg-white/10 transition-all">
              <div className="text-3xl font-black text-white tracking-tight">Verified</div>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-3">Professional Network</div>
            </div>
            <div className="p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl group hover:bg-white/10 transition-all">
              <div className="text-3xl font-black text-primary tracking-tight">Seamless</div>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-3">Verified Collabs</div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-10 text-white/20 text-[10px] font-bold uppercase tracking-[0.4em]">
            Empowering 100k+ Creators in India
        </div>
      </div>
    </div>
  );
};

export default function Auth() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
      <AuthContent />
    </Suspense>
  );
}

