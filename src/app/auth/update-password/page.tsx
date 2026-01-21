"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { Logo } from "@/components/brand/Logo";

export default function UpdatePassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    // Check initial session
    const checkInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setCheckingSession(false);
      }
    };
    checkInitialSession();

    // Listen for auth state changes, specifically for password recovery
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "PASSWORD_RECOVERY" || (event === "SIGNED_IN" && session)) {
        setCheckingSession(false);
      }
    });

    // Timeout to prevent infinite loading if link is truly invalid
    const timer = setTimeout(async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Invalid or expired link",
          description: "Please request a new password reset link.",
          variant: "destructive",
        });
        router.push("/auth/reset-password");
      }
    }, 5000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timer);
    };
  }, [router, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({
        title: "Passwords do not match",
        description: "Please ensure both passwords are identical.",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) throw error;

      toast({
        title: "Password updated",
        description: "Your password has been successfully reset. You can now log in with your new password.",
      });
      
      // Sign out to ensure they log in with the new password
      await supabase.auth.signOut();
      router.push("/auth");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to update password. Please try again.";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center gap-6">
        <div className="animate-bounce">
          <Logo size={64} />
        </div>
        <div className="flex flex-col items-center gap-3 text-slate-500 animate-pulse">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <span className="text-sm font-bold uppercase tracking-widest">Verifying Link</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-6 sm:p-8">
      <div className="w-full max-w-md space-y-10">
        <div className="flex flex-col space-y-2 text-left">
          <div className="flex items-center gap-2 mb-8 w-fit group transition-all">
            <Logo size={40} />
            <span className="text-2xl font-bold tracking-tight text-slate-900">GRIFI</span>
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Set New Password
          </h1>
          <p className="text-slate-500 text-base font-medium">
            Please enter your new professional password below.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
          <div className="space-y-2">
            <Label htmlFor="password" className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">New Password</Label>
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

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="h-14 rounded-2xl border-slate-100 bg-white shadow-inner shadow-slate-50 focus:border-primary/30 focus:ring-4 focus:ring-primary/5 transition-all px-6"
            />
          </div>

          <div className="flex flex-col gap-3 pt-4">
            <Button 
              type="submit" 
              className="w-full h-14 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-lg shadow-xl shadow-slate-200 transition-all hover:scale-[1.02] active:scale-[0.98]"
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
              Update My Password
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
