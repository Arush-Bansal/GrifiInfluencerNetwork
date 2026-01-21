"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { 
  TrendingUp, 
  LayoutDashboard, 
  Heart, 
  Shield, 
  Globe, 
  Sparkles,
  ArrowRight,
  Target,
  CheckCircle2
} from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Footer } from "@/components/brand/Footer";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";

const AboutPage = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-slate-900 font-sans selection:bg-primary/10 selection:text-primary">
      {/* Navigation */}
      <nav className="border-b border-slate-200/60 bg-white/70 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link 
            href={session ? "/dashboard" : "/"} 
            className="flex items-center gap-2 group transition-all"
          >
            <Logo size={32} />
            <span className="text-xl font-bold tracking-tight text-slate-900">GRIFI</span>
          </Link>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-6 mr-4">
              <Link href="/" className="text-sm font-medium hover:text-primary transition-colors">Home</Link>
              <Link href="/about" className="text-sm font-bold text-primary">About</Link>
            </div>
            {!loading && (
              <>
                {session ? (
                  <Link href="/dashboard">
                    <Button variant="outline" className="rounded-full border-slate-200 hover:bg-slate-50 font-bold">
                      <LayoutDashboard className="w-4 h-4 mr-2" />
                      Dashboard
                    </Button>
                  </Link>
                ) : (
                  <div className="flex items-center gap-2">
                    <Link href="/auth">
                      <Button variant="ghost" className="rounded-full text-sm font-medium">Log In</Button>
                    </Link>
                    <Link href="/auth?mode=signup">
                      <Button className="rounded-full bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 text-sm font-bold px-6">
                        Get Started
                      </Button>
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 md:pt-32 md:pb-48 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120%] h-full bg-[radial-gradient(circle_at_center,_var(--color-primary)_0%,_transparent_70%)] opacity-[0.03] -z-10" />
        
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center justify-center mb-8 px-5 py-2 rounded-full bg-primary/5 text-primary border border-primary/10">
            <Sparkles className="w-4 h-4 mr-2" />
            <span className="font-bold text-[10px] tracking-widest uppercase">Our Mission</span>
          </div>
          <h1 className="text-4xl md:text-7xl font-bold tracking-tight mb-8 leading-tight max-w-4xl mx-auto">
            Building the <span className="text-primary italic">Professional</span> Layer of the Creator Economy
          </h1>
          <p className="text-lg md:text-xl text-slate-500 mb-12 max-w-2xl mx-auto leading-relaxed font-medium">
            GRIFI is building the infrastructure that allows creators and brands to move beyond transactions into lasting, professional relationships.
          </p>
          <div className="flex justify-center">
              <Link href="/auth?mode=signup">
                <Button size="lg" className="h-14 px-10 text-base font-bold rounded-full bg-slate-900 hover:bg-slate-800 text-white shadow-2xl transition-all hover:scale-105">
                    Join the Ecosystem <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-32 bg-white border-y border-slate-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Our Core Values</h2>
            <p className="text-slate-500 max-w-xl mx-auto font-medium">
              The principles that guide every decision we make at GRIFI.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-10 rounded-[3rem] bg-[#FAFAFA] border border-slate-100 transition-all hover:shadow-2xl hover:shadow-primary/5 group">
              <div className="w-16 h-16 rounded-2xl bg-pink-50 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                <Heart className="w-8 h-8 text-pink-500" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Creator First</h3>
              <p className="text-slate-500 leading-relaxed font-medium">
                We believe creators are the new media houses. Every tool we build is designed to empower them to own their value.
              </p>
            </div>

            <div className="p-10 rounded-[3rem] bg-[#FAFAFA] border border-slate-100 transition-all hover:shadow-2xl hover:shadow-primary/5 group">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                <Shield className="w-8 h-8 text-blue-500" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Trust Verified</h3>
              <p className="text-slate-500 leading-relaxed font-medium">
                Professionalism starts with trust. We verify identities and data to ensure every collaboration is built on truth.
              </p>
            </div>

            <div className="p-10 rounded-[3rem] bg-[#FAFAFA] border border-slate-100 transition-all hover:shadow-2xl hover:shadow-primary/5 group">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                <Globe className="w-8 h-8 text-emerald-500" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Global Reach</h3>
              <p className="text-slate-500 leading-relaxed font-medium">
                Talent has no borders. We&apos;re connecting the best creators with the most innovative brands across the globe.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-32 bg-[#FAFAFA]">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-20 items-center">
            <div className="relative">
                <div className="aspect-square bg-white rounded-[4rem] border border-slate-100 shadow-2xl flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 bg-primary/5 -z-10" />
                    <div className="text-center p-12">
                        <div className="w-24 h-24 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-8 animate-pulse">
                            <TrendingUp className="w-12 h-12 text-primary" />
                        </div>
                        <h3 className="text-4xl font-bold mb-4 text-slate-900 leading-tight">10x Growth</h3>
                        <p className="text-slate-500 text-lg font-medium italic">Saving brands and creators hundreds of hours in deal-making every week.</p>
                    </div>
                </div>
                {/* Floating Badges */}
                <div className="absolute -top-10 -right-4 bg-slate-900 text-white px-6 py-4 rounded-3xl shadow-2xl font-bold text-sm flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary" /> Verified Network
                </div>
                <div className="absolute -bottom-6 -left-6 bg-white border border-slate-100 px-6 py-4 rounded-3xl shadow-2xl font-bold text-sm flex items-center gap-3 text-slate-600">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" /> Secure Payments
                </div>
            </div>

            <div className="space-y-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900/5 rounded-full border border-slate-900/10 mb-2">
                <Target className="w-4 h-4 text-slate-900" />
                <span className="text-slate-900 font-bold text-[10px] tracking-widest uppercase">The Problem</span>
              </div>
              <h2 className="text-4xl md:text-6xl font-bold leading-tight">Why we built GRIFI</h2>
              <div className="space-y-8 font-medium text-lg leading-relaxed text-slate-500">
                <p>
                    The creator economy is booming, but the professional infrastructure hasn&apos;t kept pace. Finding the right talent is hard for brands, and finding the right brands is exhausting for creators.
                </p>
                <p>
                    GRIFI focuses on the <span className="text-slate-900 font-bold underline decoration-primary/40 underline-offset-4 pointer-events-none">network layer</span>. By creating a professional identity system, we make collaboration seamless, safe, and truly professional.
                </p>
              </div>
              <div className="pt-6">
                <Link href="/auth?mode=signup">
                  <Button variant="outline" className="h-14 px-10 rounded-full border-slate-300 font-bold text-slate-900 hover:bg-slate-50 transition-all">
                    Explore the Platform
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/10 blur-[120px] rounded-full -translate-y-1/2" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-8 tracking-tight">Ready to join the network?</h2>
          <p className="text-xl mb-12 opacity-80 max-w-2xl mx-auto font-medium leading-relaxed">
            Whether you&apos;re a creator looking to scale or a brand seeking authenticity, GRIFI is your professional home.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link href="/auth?mode=signup">
              <Button size="lg" className="h-16 px-12 text-lg font-bold rounded-full bg-primary text-white hover:opacity-90 shadow-2xl transition-all">
                Sign Up for Free
              </Button>
            </Link>
            <Link href="/auth">
              <Button size="lg" variant="outline" className="h-16 px-12 text-lg font-bold rounded-full bg-white/5 border-white/20 hover:bg-white/10 transition-all">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AboutPage;
