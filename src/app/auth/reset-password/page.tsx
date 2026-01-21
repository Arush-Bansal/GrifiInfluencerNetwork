"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase, getURL } from "@/integrations/supabase/client";
import { ArrowLeft, Mail, Loader2 } from "lucide-react";
import { Logo } from "@/components/brand/Logo";

export default function ResetPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${getURL()}auth/update-password`,
      });

      if (error) throw error;

      setSubmitted(true);
      toast({
        title: "Reset link sent",
        description: "Check your email for the password reset link.",
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to send reset link. Please try again.";
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
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-6 sm:p-8">
      <div className="w-full max-w-md space-y-10">
        <div className="flex flex-col space-y-2 text-left">
          <Link href="/" className="flex items-center gap-2 mb-8 w-fit group transition-all">
            <Logo size={40} />
            <span className="text-2xl font-bold tracking-tight text-slate-900 group-hover:text-primary transition-colors">GRIFI</span>
          </Link>

          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Reset Password
          </h1>
          <p className="text-slate-500 text-base font-medium">
            {submitted 
              ? "We&apos;ve sent a password reset link to your email."
              : "Enter your email address and we&apos;ll send you a link to reset your password."
            }
          </p>
        </div>

        {submitted ? (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-primary/5 border border-primary/10 rounded-2xl p-6 text-center space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Mail className="w-8 h-8 text-primary" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold">Check your inbox</h3>
                <p className="text-sm text-muted-foreground">
                  We&apos;ve sent a reset link to <span className="font-semibold text-foreground">{email}</span>. 
                  Please click the link to reset your password.
                </p>
              </div>
            </div>
            <Button 
              asChild
              className="w-full h-11 text-muted-foreground hover:text-foreground" 
              variant="ghost"
            >
              <Link href="/auth">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to login
              </Link>
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
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
            </div>

            <div className="flex flex-col gap-4 pt-4">
              <Button 
                type="submit" 
                className="w-full h-14 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-lg shadow-xl shadow-slate-200 transition-all hover:scale-[1.02] active:scale-[0.98]"
                disabled={loading}
              >
                {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                Send Reset Link
              </Button>
              <Button 
                asChild
                variant="ghost" 
                className="w-full h-12 rounded-full font-bold text-slate-500 hover:text-slate-900"
              >
                <Link href="/auth">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back to Login
                </Link>
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
