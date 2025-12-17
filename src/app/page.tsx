"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Zap, Users, TrendingUp, Bot, LogOut, LayoutDashboard } from "lucide-react";
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
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
              <span className="text-primary-foreground font-semibold text-lg">G</span>
            </div>
            <span className="text-xl font-semibold tracking-tight">GRIFI</span>
          </div>
          <div className="flex items-center gap-4">
            {!loading && (
              <>
                {session ? (
                  <>
                    <Link href="/dashboard">
                      <Button variant="ghost" size="sm">
                        <LayoutDashboard className="w-4 h-4 mr-2" />
                        Dashboard
                      </Button>
                    </Link>
                    <Button variant="outline" size="sm" onClick={handleLogout}>
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Link href="/auth">
                      <Button variant="ghost" size="sm">Log In</Button>
                    </Link>
                    <Link href="/auth?mode=signup">
                      <Button size="sm">Get Started</Button>
                    </Link>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center mb-6 px-4 py-1.5 rounded-full bg-secondary text-secondary-foreground">
            <span className="font-medium text-xs tracking-wide uppercase">The Professional Network for Creators</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 leading-tight text-foreground">
            Connect, Collaborate, & <br/> <span className="text-primary">Grow Together</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            The identity layer for the creator economy. Whether you're a creator, brand, agency, or operator — build your professional network here.
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
      <section className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-3 gap-8 text-center">
          <div className="p-8 border border-border rounded-xl bg-card shadow-sm">
            <div className="text-4xl font-bold mb-2 text-primary">10K+</div>
            <div className="text-muted-foreground font-medium">Influencers</div>
          </div>
          <div className="p-8 border border-border rounded-xl bg-card shadow-sm">
            <div className="text-4xl font-bold mb-2 text-primary">500+</div>
            <div className="text-muted-foreground font-medium">Brand Partners</div>
          </div>
          <div className="p-8 border border-border rounded-xl bg-card shadow-sm">
            <div className="text-4xl font-bold mb-2 text-primary">$5M+</div>
            <div className="text-muted-foreground font-medium">Deals Closed</div>
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
      <footer className="border-t border-border py-8 bg-background">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xs">G</span>
            </div>
            <span className="font-bold text-sm tracking-tight">GRIFI</span>
          </div>
          <div className="text-muted-foreground text-sm">
            © 2024 Grifi. All rights reserved.
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

