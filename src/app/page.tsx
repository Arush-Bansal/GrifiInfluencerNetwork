"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  LayoutDashboard,
  ArrowRight,
  MessageSquare,
  PlayCircle,
  Users,
  Star,
  ChevronRight,
  MapPin,
  TrendingUp,
  Languages,
  CreditCard
} from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import { Badge } from "@/components/ui/badge";
import { Footer } from "@/components/brand/Footer";
import { Sparkles as SparklesIcon } from "lucide-react";

const Index = () => {
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

  const categories = ["Fashion", "Beauty", "Tech", "Food", "Travel", "Fitness", "Lifestyle"];

  const steps = [
    {
      icon: <MessageSquare className="w-8 h-8" />,
      title: "Chat & Connect",
      desc: "Communicate directly with brands to discuss campaign goals and creative vision.",
      label: "Communicate"
    },
    {
      icon: <PlayCircle className="w-8 h-8" />,
      title: "Create & Receive",
      desc: "Produce high-quality UGC content and submit it for brand review within the platform.",
      label: "Receive Video"
    },
    {
      icon: <CreditCard className="w-8 h-8" />,
      title: "Secure Payments",
      desc: "Get paid instantly and securely via UPI once the content is approved.",
      label: "Make Payment"
    }
  ];

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
            {!loading && (
              <>
                {session ? (
                  <Link href="/dashboard">
                    <Button variant="outline" className="rounded-full border-slate-200 hover:bg-slate-50">
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
      <section className="relative pt-16 pb-24 md:pt-32 md:pb-48 overflow-hidden">
        {/* Deep Premium Background */}
        <div className="absolute inset-0 bg-noise opacity-5 -z-20" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[800px] -z-10 overflow-hidden pointer-events-none">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] animate-blob" />
            <div className="absolute top-20 right-1/4 w-72 h-72 bg-blue-400/10 rounded-full blur-[100px] animate-blob animation-delay-2000" />
            <div className="absolute -bottom-20 left-1/2 w-80 h-80 bg-orange-200/5 rounded-full blur-[80px] animate-blob animation-delay-4000" />
        </div>

        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-100 shadow-sm mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <SparklesIcon className="w-4 h-4 text-primary" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">The Creator Economy Standard 2026</span>
          </div>

          <h1 className="text-5xl md:text-8xl font-black tracking-tight mb-8 leading-[1.05] max-w-5xl mx-auto">
            Where Brands meet <br className="hidden md:block" />
            <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/40 bg-clip-text text-transparent italic px-2">Legendary</span> Storytellers.
          </h1>
          
          <p className="text-lg md:text-2xl text-slate-500 mb-12 max-w-3xl mx-auto leading-relaxed font-medium">
            India&apos;s most professional network for authentic UGC, <br className="hidden md:block" />
            high-impact campaigns, and verified creator growth.
          </p>

          <div className="flex flex-col sm:flex-row gap-5 justify-center mb-24">
            <Link href="/auth?mode=signup">
              <Button size="lg" className="h-16 px-12 text-lg font-bold rounded-full bg-slate-900 hover:bg-slate-800 text-white shadow-2xl shadow-slate-300 transition-all hover:scale-[1.02] active:scale-95">
                Join the Network <ArrowRight className="ml-3 w-6 h-6" />
              </Button>
            </Link>
            <Link href="/dashboard/network">
              <Button size="lg" variant="outline" className="h-16 px-12 text-lg font-bold rounded-full border-slate-200 bg-white/50 backdrop-blur-sm hover:bg-white transition-all">
                Explore Talents
              </Button>
            </Link>
          </div>

          {/* Dynamic Creator Grid */}
          <div className="relative max-w-6xl mx-auto">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-10 items-end">
                  {/* Card 1 */}
                  <div className="group relative aspect-[3/4] rounded-[2.5rem] overflow-hidden border-4 border-white shadow-2xl transition-all duration-700 hover:-rotate-3 hover:translate-y-[-10px] hidden md:block">
                      <img src="/creators/avatar1.png" alt="Creator 1" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      <div className="absolute bottom-6 left-6 text-left">
                          <div className="text-xl text-white font-bold">Ananya S.</div>
                          <div className="text-white/60 text-xs font-bold uppercase tracking-widest mt-1">Fashion • 120k+</div>
                      </div>
                      <div className="absolute top-6 right-6 w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                         <PlayCircle className="w-6 h-6" />
                      </div>
                  </div>

                  {/* Card 2 (Floating Center) */}
                  <div className="group relative aspect-[4/5] rounded-[3rem] overflow-hidden border-4 border-white shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)] transition-all duration-700 z-10 hover:scale-105 active:scale-95 col-span-2 md:col-span-1">
                      <img src="/creators/avatar3.png" alt="Featured Creator" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                      <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-black/20 to-transparent mix-blend-multiply opacity-60" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
                      <div className="absolute bottom-8 left-8 text-left">
                          <Badge className="bg-primary text-white border-0 mb-4 px-3 py-1 font-bold text-[10px] tracking-widest uppercase">Verified Talent</Badge>
                          <div className="text-3xl text-white font-black leading-tight tracking-tight">Aryan Khanna</div>
                          <div className="text-white/70 text-sm font-bold uppercase tracking-[0.2em] mt-2">Lifestyle & Tech</div>
                      </div>
                      <div className="absolute top-8 right-8">
                         <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center text-slate-900 shadow-xl scale-0 group-hover:scale-100 transition-transform duration-500">
                             <TrendingUp className="w-7 h-7" />
                         </div>
                      </div>
                  </div>

                  {/* Card 3 */}
                  <div className="group relative aspect-[3/4] rounded-[2.5rem] overflow-hidden border-4 border-white shadow-2xl transition-all duration-700 hover:rotate-3 hover:translate-y-[-10px] hidden md:block">
                      <img src="/creators/avatar2.png" alt="Creator 2" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      <div className="absolute bottom-6 left-6 text-left">
                          <div className="text-xl text-white font-bold">Vikram R.</div>
                          <div className="text-white/60 text-xs font-bold uppercase tracking-widest mt-1">Tech • 85k+</div>
                      </div>
                      <div className="absolute top-6 left-6 w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                         <Star className="w-6 h-6 fill-white" />
                      </div>
                  </div>
              </div>

              {/* Floating Stat Decor */}
              <div className="absolute -right-20 top-20 hidden lg:block animate-bounce animation-delay-2000">
                  <div className="p-6 bg-white rounded-3xl shadow-2xl border border-slate-100 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center">
                          <Users className="w-6 h-6" />
                      </div>
                      <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Reach</p>
                          <p className="text-xl font-black text-slate-900 leading-none mt-1">15.4M+</p>
                      </div>
                  </div>
              </div>
          </div>
        </div>
      </section>

      {/* Find Your Ideal Creator Section */}
      <section className="py-24 bg-white border-y border-slate-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Find your ideal creator</h2>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/5 rounded-full border border-primary/10 mb-8">
                <Users className="w-4 h-4 text-primary" />
                <span className="text-primary font-bold text-sm tracking-wide uppercase">Choose from 10,000+ creators</span>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 rounded-[2.5rem] bg-[#FDFDFD] border border-slate-100 hover:shadow-xl hover:shadow-primary/5 transition-all group">
              <div className="w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <MapPin className="w-8 h-8 text-orange-500" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Hyper-Local Reach</h3>
              <p className="text-slate-500 leading-relaxed font-medium">
                Search by <b>Region & Ethnicity</b> to find creators who truly resonate with your target market&apos;s cultural context.
              </p>
            </div>

            <div className="p-8 rounded-[2.5rem] bg-[#FDFDFD] border border-slate-100 hover:shadow-xl hover:shadow-primary/5 transition-all group">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-8 h-8 text-blue-500" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Right Audience</h3>
              <p className="text-slate-500 leading-relaxed font-medium">
                Connect with the right <b>Age & Demographics</b> like Mothers, Teens, or GenZ to ensure maximum campaign performance.
              </p>
            </div>

            <div className="p-8 rounded-[2.5rem] bg-[#FDFDFD] border border-slate-100 hover:shadow-xl hover:shadow-primary/5 transition-all group">
              <div className="w-16 h-16 rounded-2xl bg-purple-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Languages className="w-8 h-8 text-purple-500" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Native Voice</h3>
              <p className="text-slate-500 leading-relaxed font-medium">
                Multilingual support across <b>Hindi, English, Punjabi</b>, and more to capture the authentic voice of your brand.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-24 bg-[#FAFAFA]">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
            <h2 className="text-3xl md:text-4xl font-bold">Check Categories</h2>
            <div className="flex flex-wrap justify-center gap-3">
              {categories.map((cat) => (
                <Badge key={cat} variant="outline" className="px-6 py-2.5 rounded-full text-sm font-bold bg-white hover:bg-primary hover:text-white hover:border-primary cursor-pointer transition-all border-slate-200">
                  {cat}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Browse Prev Collabs Section */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-16">
            <h2 className="text-3xl md:text-5xl font-bold">Browse Prev Collabs</h2>
            <Link href="/dashboard" className="text-primary font-bold flex items-center gap-1 hover:underline">
                View All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
                <div key={i} className="group relative aspect-[9/16] rounded-3xl overflow-hidden shadow-2xl transition-all hover:-translate-y-2">
                    <img
                        src={`/campaigns/reel${i}.png`}
                        alt={`Reel ${i}`}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute bottom-6 left-6 right-6 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
                        <div className="flex items-center gap-2 mb-2">
                           {i === 1 && <Badge className="bg-orange-500 hover:bg-orange-500 border-none">Fashion</Badge>}
                           {i === 2 && <Badge className="bg-blue-500 hover:bg-blue-500 border-none">Tech</Badge>}
                           {i === 3 && <Badge className="bg-purple-500 hover:bg-purple-500 border-none">Travel</Badge>}
                        </div>
                        <h4 className="text-white font-bold text-xl mb-1">Elite Campaign #{i}</h4>
                        <div className="flex items-center gap-1 text-white/80 text-sm font-medium">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            4.9 • 24k views
                        </div>
                    </div>
                </div>
            ))}
          </div>
        </div>
      </section>

      {/* One Stop Solution Section */}
      <section className="py-24 bg-slate-900 text-white overflow-hidden relative">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-bold mb-6">One stop solution</h2>
            <p className="text-xl text-slate-400 font-medium">Shipping, tracking, and payments — all handled in one place.</p>
          </div>

          <div className="relative">
            {/* Connection Line (Desktop) */}
            <div className="hidden lg:block absolute top-[40px] left-[15%] right-[15%] h-0.5 border-t-2 border-dashed border-slate-700 -z-10" />

            <div className="grid md:grid-cols-3 gap-12">
                {steps.map((step, idx) => (
                    <div key={idx} className="flex flex-col items-center text-center group">
                        <div className="w-20 h-20 rounded-full bg-slate-800 border-[6px] border-slate-900 shadow-[0_0_0_1px_rgba(255,255,255,0.05)] flex items-center justify-center mb-8 group-hover:bg-primary group-hover:scale-110 transition-all duration-500 relative">
                            <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center border-4 border-slate-900">
                                {idx + 1}
                            </div>
                            {step.icon}
                        </div>
                        <Badge variant="outline" className="mb-4 border-slate-700 text-slate-400 font-bold tracking-widest uppercase text-[10px] py-1">
                            {step.label}
                        </Badge>
                        <h3 className="text-2xl font-bold mb-4">{step.title}</h3>
                        <p className="text-slate-400 font-medium leading-relaxed max-w-sm">
                            {step.desc}
                        </p>
                        {idx < 2 && (
                             <ArrowRight className="md:hidden w-8 h-8 mt-12 text-slate-700 animate-bounce" />
                        )}
                    </div>
                ))}
            </div>
          </div>

          <div className="mt-20 pt-12 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex items-center gap-6">
                  <div className="flex flex-col items-center md:items-start text-center md:text-left">
                      <div className="text-3xl font-bold text-white mb-1">500+</div>
                      <div className="text-slate-500 text-xs font-bold uppercase tracking-widest">Brand Partners</div>
                  </div>
                  <div className="w-px h-12 bg-slate-800" />
                  <div className="flex flex-col items-center md:items-start text-center md:text-left">
                      <div className="text-3xl font-bold text-white mb-1">100k+</div>
                      <div className="text-slate-500 text-xs font-bold uppercase tracking-widest">Successful Collabs</div>
                  </div>
              </div>
              <Link href="/auth?mode=signup">
                <Button size="lg" className="rounded-full bg-white text-slate-900 hover:bg-slate-100 font-bold px-10 h-14 shadow-xl">
                    Get Started Now
                </Button>
              </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
