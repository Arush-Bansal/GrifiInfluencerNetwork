"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";
import { User, Briefcase, Building2, Globe, ArrowLeft, Loader2, Sparkles, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const authSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type UserRole = "influencer" | "creator_ops" | "brand" | "agency";

const ROLES: { id: UserRole; title: string; description: string; icon: any }[] = [
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

const AuthContent = () => {
  const searchParams = useSearchParams();
  const [isSignUp, setIsSignUp] = useState(searchParams.get("mode") === "signup");
  const [role, setRole] = useState<UserRole | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        router.push("/dashboard");
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        router.push("/dashboard");
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

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

        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
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
          toast({
            title: "Welcome to Grifi!",
            description: "Your account has been created successfully.",
          });
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
          options: { // Use token if required, otherwise empty object or undefined
             // captchaToken: undefined 
          }
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
        }
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRoleSelect = (selectedRole: UserRole) => {
    setRole(selectedRole);
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 overflow-y-auto">
        <div className="w-full max-w-md space-y-8">
          
          {/* Header */}
          <div className="flex flex-col space-y-2 text-left">
            <Link href="/" className="flex items-center gap-2 mb-6 w-fit hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-sm">
                <span className="text-primary-foreground font-bold text-lg">G</span>
              </div>
              <span className="text-xl font-bold tracking-tight">GRIFI</span>
            </Link>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              {isSignUp 
                ? (role ? `Sign up as ${ROLES.find(r => r.id === role)?.title}` : "Create your account") 
                : "Welcome back"}
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              {isSignUp 
                ? (role ? "Enter your details to get started." : "Choose how you want to use Grifi.") 
                : "Log in to access your professional network."}
            </p>
          </div>

          {/* Role Selection Step */}
          {isSignUp && !role && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {ROLES.map((r) => {
                const Icon = r.icon;
                return (
                  <Card 
                    key={r.id}
                    className={cn(
                      "cursor-pointer hover:border-primary/50 hover:bg-accent/5 transition-all duration-200 group relative overflow-hidden",
                      "border-border/60 shadow-none hover:shadow-md"
                    )}
                    onClick={() => handleRoleSelect(r.id)}
                  >
                    <CardContent className="p-5 flex flex-col gap-3">
                      <div className="p-2.5 w-fit rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-200">
                        <Icon size={20} />
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">{r.title}</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">{r.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Auth Form */}
          {(!isSignUp || role) && (
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
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  required
                  className="h-11"
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  {!isSignUp && (
                    <Link 
                      href="/auth/reset-password" 
                      className="text-xs font-medium text-primary hover:text-primary/80"
                    >
                      Forgot password?
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
                  className="h-11"
                />
              </div>

              <div className="flex flex-col gap-3 pt-2">
                <Button 
                  type="submit" 
                  className="w-full h-11 text-base font-medium"
                  disabled={loading}
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isSignUp ? "Create Account" : "Log In"}
                </Button>

                {isSignUp && role && (
                  <Button 
                    type="button" 
                    variant="ghost" 
                    onClick={() => setRole(null)}
                    className="w-full h-11 text-muted-foreground hover:text-foreground"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" /> Change Role
                  </Button>
                )}
              </div>
            </form>
          )}

          {/* Toggle Login/Signup */}
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
        </div>
      </div>

      {/* Right side - Visual */}
      <div className="hidden lg:flex flex-1 bg-muted/30 border-l border-border/50 items-center justify-center p-8 relative overflow-hidden">
        
        <div className="max-w-lg text-center space-y-8 relative z-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-primary mb-2 shadow-xl shadow-primary/20 ring-4 ring-background">
            <span className="text-primary-foreground font-bold text-4xl">G</span>
          </div>
          
          <div className="space-y-4">
            <h2 className="text-3xl font-bold tracking-tight text-foreground">
              The Identity Layer for the Creator Economy
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed max-w-md mx-auto">
              Connect, collaborate, and grow. Whether you're a creator, brand, or agency, Grifi is your professional home.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-left pt-4">
            <div className="p-5 bg-background border border-border/60 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="text-3xl font-bold text-primary tracking-tight">Verified</div>
              <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider mt-2">Professional Network</div>
            </div>
            <div className="p-5 bg-background border border-border/60 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="text-3xl font-bold text-primary tracking-tight">Seamless</div>
              <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider mt-2">Collaboration Tools</div>
            </div>
          </div>
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

