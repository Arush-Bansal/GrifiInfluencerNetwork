"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Zap, Users, TrendingUp, Bot, LogOut, LayoutDashboard } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { supabase } from "@/integrations/supabase/client";
import { useRouter } from "next/navigation";
import { Session } from "@supabase/supabase-js";

const Index = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

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

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      localStorage.clear();
      sessionStorage.clear();
      setSession(null);
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 shrink-0">
            <Logo size={32} />
            <span className="text-xl font-bold tracking-tight text-foreground sm:block">GRIFI</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-6">
            <div className="hidden md:flex items-center gap-6">
              <Link href="/" className="text-sm font-medium text-primary">Home</Link>
              <Link href="/about" className="text-sm font-medium hover:text-primary transition-colors">About</Link>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              {!loading && (
                <>
                  {session ? (
                    <>
                      <Link href="/dashboard">
                        <Button variant="ghost" size="sm" className="px-2 sm:px-3 text-xs sm:text-sm">
                          <LayoutDashboard className="w-4 h-4 sm:mr-2" />
                          <span className="hidden sm:inline">Dashboard</span>
                        </Button>
                      </Link>
                      <Button variant="outline" size="sm" onClick={handleLogout} className="px-2 sm:px-3 text-xs sm:text-sm">
                        <LogOut className="w-4 h-4 sm:mr-2" />
                        <span className="hidden sm:inline">Logout</span>
                      </Button>
                    </>
                  ) : (
                    <>
                      <Link href="/auth">
                        <Button variant="ghost" size="sm" className="text-xs sm:text-sm px-2 sm:px-4">Log In</Button>
                      </Link>
                      <Link href="/auth?mode=signup">
                        <Button size="sm" className="text-xs sm:text-sm px-3 sm:px-4 shadow-md">Get Started</Button>
                      </Link>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center mb-6 px-4 py-1.5 rounded-full bg-secondary/50 text-secondary-foreground border border-border/50">
            <span className="font-bold text-[10px] sm:text-xs tracking-wider uppercase">Professional Network for Creators</span>
          </div>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tighter mb-6 leading-[1.1] text-foreground">
            Connect, Collaborate, & <br className="hidden sm:block" /> <span className="text-primary underline decoration-primary/20 underline-offset-8">Grow Together</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed px-4">
            The identity layer for the creator economy. Whether you&apos;re a creator, brand, agency, or operator — build your professional network here.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {!loading && (
              <>
                {session ? (
                  <Link href="/dashboard">
                    <Button size="lg" className="h-12 px-8 text-base">
                      Go to Dashboard
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link href="/auth?mode=signup">
                      <Button size="lg" className="h-12 px-8 text-base">
                        Join the Network
                      </Button>
                    </Link>
                    <Link href="/auth">
                      <Button size="lg" variant="outline" className="h-12 px-8 text-base">
                        Log In
                      </Button>
                    </Link>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="bg-muted/50 border-y border-border py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-16 tracking-tight">How it works</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard
              icon={<Users className="w-6 h-6" />}
              title="Create Profile"
              description="Sign up and build your influencer profile with your niche, audience, and content style."
            />
            <FeatureCard
              icon={<Bot className="w-6 h-6" />}
              title="AI Analysis"
              description="Our AI analyzes your profile and engagement to understand your unique value."
            />
            <FeatureCard
              icon={<Zap className="w-6 h-6" />}
              title="Smart Matching"
              description="Get matched with brands that align perfectly with your audience and content."
            />
            <FeatureCard
              icon={<TrendingUp className="w-6 h-6" />}
              title="Earn More"
              description="Close deals faster and earn more with AI-optimized sponsorship rates."
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 py-16 sm:py-20 lg:py-32">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 text-center">
          <div className="p-8 border border-border/50 rounded-2xl bg-card shadow-sm hover:shadow-md transition-shadow">
            <div className="text-4xl sm:text-5xl font-black mb-2 text-primary tracking-tighter">10K+</div>
            <div className="text-muted-foreground text-sm uppercase tracking-widest font-bold">Influencers</div>
          </div>
          <div className="p-8 border border-border/50 rounded-2xl bg-card shadow-sm hover:shadow-md transition-shadow">
            <div className="text-4xl sm:text-5xl font-black mb-2 text-primary tracking-tighter">500+</div>
            <div className="text-muted-foreground text-sm uppercase tracking-widest font-bold">Brand Partners</div>
          </div>
          <div className="p-8 border border-border/50 rounded-2xl bg-card shadow-sm hover:shadow-md transition-shadow sm:col-span-2 lg:col-span-1">
            <div className="text-4xl sm:text-5xl font-black mb-2 text-primary tracking-tighter">$5M+</div>
            <div className="text-muted-foreground text-sm uppercase tracking-widest font-bold">Deals Closed</div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary text-primary-foreground py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 tracking-tight">Ready to grow?</h2>
          <p className="text-xl mb-8 opacity-90 max-w-xl mx-auto text-primary-foreground/80">
            Join thousands of influencers already using Grifi to land their dream sponsorships.
          </p>
          {!loading && (
             session ? (
              <Link href="/dashboard">
                <Button size="lg" variant="secondary" className="h-12 px-8 text-base font-semibold shadow-lg">
                  Go to Dashboard
                </Button>
              </Link>
             ) : (
              <Link href="/auth?mode=signup">
                <Button size="lg" variant="secondary" className="h-12 px-8 text-base font-semibold shadow-lg">
                  Start Free Today
                </Button>
              </Link>
             )
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 bg-background">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-8 md:gap-4">
          <div className="flex items-center gap-2">
            <Logo size={32} />
            <span className="font-black text-lg tracking-tighter text-foreground">GRIFI</span>
          </div>
          <div className="flex flex-wrap justify-center gap-6 sm:gap-8">
            <Link href="/" className="text-xs sm:text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Home</Link>
            <Link href="/about" className="text-xs sm:text-sm font-medium text-muted-foreground hover:text-primary transition-colors">About</Link>
            <Link href="/privacy" className="text-xs sm:text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Privacy</Link>
            <Link href="/terms" className="text-xs sm:text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Terms</Link>
          </div>
          <div className="text-muted-foreground text-[10px] sm:text-xs font-medium uppercase tracking-widest">
            © 2024 Grifi Network. Built for Creators.
          </div>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => (
  <div className="p-6 bg-background border border-border rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
    <div className="w-12 h-12 bg-primary/10 text-primary rounded-lg flex items-center justify-center mb-4">
      {icon}
    </div>
    <h3 className="text-lg font-semibold mb-2 text-foreground">{title}</h3>
    <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
  </div>
);

export default Index;

