"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Users, TrendingUp, Bot, LogOut, LayoutDashboard, Heart, Shield, Globe, Sparkles } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { supabase } from "@/integrations/supabase/client";
import { useRouter } from "next/navigation";
import { Session } from "@supabase/supabase-js";

const AboutPage = () => {
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
          <Link 
            href={session ? "/dashboard" : "/"} 
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <Logo size={32} />
            <span className="text-xl font-semibold tracking-tight uppercase">GRIFI</span>
          </Link>
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-6">
              <Link href="/" className="text-sm font-medium hover:text-primary transition-colors">Home</Link>
              <Link href="/about" className="text-sm font-medium text-primary">About</Link>
            </div>
            <div className="flex items-center gap-4 border-l pl-6 border-border">
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
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 opacity-10 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent rounded-full blur-[120px]" />
        </div>
        
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center mb-6 px-4 py-1.5 rounded-full bg-primary/10 text-primary">
            <Sparkles className="w-4 h-4 mr-2" />
            <span className="font-medium text-xs tracking-wide uppercase font-sans">Our Mission</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 leading-tight text-foreground font-sans">
            Building the Professional Layer <br/> of the <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Creator Economy</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed font-sans">
            GRIFI is more than just a matching platform. We&apos;re building the infrastructure that allows creators and brands to build lasting, professional relationships.
          </p>
        </div>
      </section>

      {/* Our Values Section */}
      <section className="bg-secondary/30 border-y border-border py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 font-sans uppercase tracking-tight">Our Core Values</h2>
            <p className="text-muted-foreground max-w-xl mx-auto font-sans">
              The principles that guide every decision we make at GRIFI.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <ValueCard
              icon={<Heart className="w-6 h-6 text-pink-500" />}
              title="Creator First"
              description="We believe creators are the new media houses. Every tool we build is designed to empower them to own their value."
            />
            <ValueCard
              icon={<Shield className="w-6 h-6 text-blue-500" />}
              title="Trust & Transparency"
              description="Professionalism starts with trust. We verify identities and data to ensure every collaboration is built on truth."
            />
            <ValueCard
              icon={<Globe className="w-6 h-6 text-green-500" />}
              title="Global Connectivity"
              description="Talent has no borders. We&apos;re connecting the best creators with the most innovative brands across the globe."
            />
          </div>
        </div>
      </section>

      {/* Problem/Solution Section */}
      <section className="container mx-auto px-4 py-24">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-6 font-sans uppercase tracking-tight">Why we built GRIFI</h2>
            <div className="space-y-6">
              <p className="text-lg text-muted-foreground font-sans">
                The creator economy is booming, but the professional infrastructure hasn&apos;t kept pace. Finding the right talent is hard for brands, and finding the right brands is exhausting for creators.
              </p>
              <p className="text-lg text-muted-foreground font-sans">
                Most platforms focus only on the transaction. We focus on the <span className="text-primary font-semibold italic">network</span>. By creating a professional identity layer, we make collaboration seamless, safe, and scalable.
              </p>
              <div className="pt-4">
                <Link href="/auth?mode=signup">
                  <Button size="lg" className="rounded-full px-8">Join the Movement</Button>
                </Link>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="aspect-square bg-gradient-to-br from-primary/20 to-accent/20 rounded-3xl overflow-hidden border border-border shadow-2xl flex items-center justify-center">
               <div className="text-center p-8">
                  <div className="w-20 h-20 bg-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <TrendingUp className="w-10 h-10 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">10x Faster</h3>
                  <p className="text-muted-foreground italic">Average time saved in the outreach-to-deal cycle on GRIFI compared to manual processes.</p>
               </div>
            </div>
            {/* Floating elements for visual interest */}
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-card border border-border rounded-xl shadow-lg flex items-center justify-center animate-bounce duration-[3000ms]">
                <Users className="w-8 h-8 text-primary" />
            </div>
             <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-card border border-border rounded-xl shadow-lg flex items-center justify-center animate-pulse duration-[4000ms]">
                <Bot className="w-8 h-8 text-accent" />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary text-primary-foreground py-24 mt-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tighter uppercase font-sans">Start Building Your Network</h2>
          <p className="text-xl mb-10 opacity-90 max-w-2xl mx-auto text-primary-foreground/80 font-sans">
            Whether you&apos;re an influencer looking for your next big deal or a brand seeking authentic voices, GRIFI is your home.
          </p>
          {!loading && (
             session ? (
              <Link href="/dashboard">
                <Button size="lg" variant="secondary" className="h-14 px-10 text-lg font-semibold shadow-2xl rounded-full transition-transform hover:scale-105 active:scale-95">
                  Enter Dashboard
                </Button>
              </Link>
             ) : (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/auth?mode=signup">
                  <Button size="lg" variant="secondary" className="h-14 px-10 text-lg font-semibold shadow-2xl rounded-full transition-transform hover:scale-105 active:scale-95">
                    Sign Up Free
                  </Button>
                </Link>
                <Link href="/auth">
                   <Button size="lg" variant="outline" className="h-14 px-10 text-lg font-semibold bg-primary/20 border-primary-foreground/20 hover:bg-primary/30 rounded-full transition-transform hover:scale-105 active:scale-95">
                    Sign In
                  </Button>
                </Link>
              </div>
             )
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-2">
              <Logo size={32} />
              <span className="font-bold text-xl tracking-tight uppercase">GRIFI</span>
            </div>
            
            <div className="flex gap-8">
              <Link href="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">Home</Link>
              <Link href="/about" className="text-sm text-muted-foreground hover:text-primary transition-colors">About</Link>
              <Link href="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors">Privacy</Link>
              <Link href="/terms" className="text-sm text-muted-foreground hover:text-primary transition-colors">Terms</Link>
            </div>

            <div className="text-muted-foreground text-sm font-sans italic">
              © 2024 Grifi Network. Building the future.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

const ValueCard = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => (
  <div className="p-8 bg-background border border-border rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 group hover:-translate-y-1">
    <div className="w-14 h-14 bg-secondary rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary/5 transition-colors">
      {icon}
    </div>
    <h3 className="text-xl font-bold mb-3 text-foreground font-sans uppercase tracking-tight">{title}</h3>
    <p className="text-muted-foreground leading-relaxed font-sans">{description}</p>
  </div>
);

export default AboutPage;
