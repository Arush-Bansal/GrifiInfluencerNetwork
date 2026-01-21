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
  CheckCircle2,
  Plus,
  Zap,
  ShieldCheck,
  Award,
  Globe,
  BarChart3,
  CreditCard
} from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import { Badge } from "@/components/ui/badge";
import { Footer } from "@/components/brand/Footer";
import { TiltCard } from "@/components/ui/tilt-card";
import { motion } from "framer-motion";

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

  const testimonials = [
    {
      quote: "Grifi has completely transformed how we source UGC. The quality of creators is unmatched in the Indian market.",
      author: "Sarah J.",
      role: "Marketing Head, Aura Beauty",
      avatar: "/creators/avatar1.png"
    },
    {
      quote: "As a creator, I finally feel like there's a platform that values professionalism and timely payments.",
      author: "Aryan K.",
      role: "Tech Influencer",
      avatar: "/creators/avatar3.png"
    },
    {
      quote: "The seamless integration of chat and payments makes collaboration a breeze. Highly recommended!",
      author: "Vikram R.",
      role: "Video Creator",
      avatar: "/creators/avatar2.png"
    }
  ];

  const faqs = [
    {
      q: "How do I join as a creator?",
      a: "Simply sign up, complete your profile, and connect your social accounts. Once verified, you can start applying to campaigns."
    },
    {
      q: "Is there a fee for brands?",
      a: "We offer flexible pricing models including pay-per-campaign and subscription tiers. Contact us for a custom quote."
    },
    {
      q: "How are payments handled?",
      a: "Payments are secured via UPI and Escrow. Creators get paid as soon as the brand approves the submitted content."
    }
  ];

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-slate-900 font-sans selection:bg-primary/10 selection:text-primary overflow-x-hidden">
      {/* Navigation */}
      <nav className="border-b border-slate-200/50 bg-white/80 backdrop-blur-xl sticky top-0 z-[100]">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            href={session ? "/dashboard" : "/"}
            className="flex items-center gap-2 group transition-all"
          >
            <Logo size={36} />
            <span className="text-2xl font-black tracking-tighter text-slate-900">GRIFI</span>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-500">
            <Link href="#features" className="hover:text-primary transition-colors">Features</Link>
            <Link href="#how-it-works" className="hover:text-primary transition-colors">Workflow</Link>
            <Link href="#testimonials" className="hover:text-primary transition-colors">Stories</Link>
            <Link href="#faq" className="hover:text-primary transition-colors">FAQ</Link>
          </div>

          <div className="flex items-center gap-4">
            {!loading && (
              <>
                {session ? (
                  <Link href="/dashboard">
                    <Button variant="outline" className="rounded-full border-slate-200 hover:bg-slate-50 font-bold px-6">
                      <LayoutDashboard className="w-4 h-4 mr-2" />
                      Dashboard
                    </Button>
                  </Link>
                ) : (
                  <div className="flex items-center gap-3">
                    <Link href="/auth">
                      <Button variant="ghost" className="rounded-full text-sm font-bold px-6">Log In</Button>
                    </Link>
                    <Link href="/auth?mode=signup">
                      <Button className="rounded-full bg-slate-900 hover:bg-slate-800 text-white shadow-xl shadow-slate-200 text-sm font-bold px-8 h-11">
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
      <section className="relative pt-20 pb-20 md:pt-36 md:pb-40 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl">
            <div className="absolute top-[-10%] left-[10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-[-10%] right-[10%] w-[400px] h-[400px] bg-blue-400/5 rounded-full blur-[100px] animate-pulse duration-[5000ms]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(0,0,0,0)_0%,rgba(255,255,255,1)_70%)]" />
          </div>
        </div>

        <div className="container mx-auto px-4 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-100 shadow-xl shadow-slate-100/50 mb-10"
          >
            <div className="flex -space-x-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-5 h-5 rounded-full border-2 border-white bg-slate-100 overflow-hidden">
                  <img src={`/creators/avatar${i}.png`} alt="user" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Trusted by 2,000+ Premium Creators</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-6xl md:text-[9rem] font-black tracking-tight mb-8 leading-[0.9] text-slate-900"
          >
            THE PULSE OF <br />
            <span className="bg-gradient-to-r from-primary via-primary to-primary/50 bg-clip-text text-transparent italic">CREATION.</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl md:text-3xl text-slate-500 mb-14 max-w-4xl mx-auto leading-tight font-medium"
          >
            India&apos;s most elite influencer and UGC network. We connect <br className="hidden md:block" /> visionary brands with the storytellers who define tomorrow.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-6 justify-center mb-32"
          >
            <Link href="/auth?mode=signup">
              <Button size="lg" className="h-18 px-14 text-xl font-black rounded-2xl bg-slate-900 hover:bg-slate-800 text-white shadow-[0_20px_40px_-12px_rgba(0,0,0,0.3)] transition-all hover:scale-[1.05] active:scale-95 group">
                Join the Pulse <Plus className="ml-3 w-6 h-6 group-hover:rotate-90 transition-transform" />
              </Button>
            </Link>
            <Link href="/dashboard/network">
              <Button size="lg" variant="outline" className="h-18 px-14 text-xl font-bold rounded-2xl border-slate-200 bg-white/50 backdrop-blur-sm hover:bg-white transition-all shadow-lg shadow-slate-100">
                Explore Talent
              </Button>
            </Link>
          </motion.div>

          {/* Featured Creator Showcase */}
          <div className="relative max-w-7xl mx-auto pt-10">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-center">
                  {/* Left Column - Stats */}
                  <div className="hidden md:flex flex-col gap-8 text-left">
                      <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-xl shadow-slate-100/50 hover:-translate-y-1 transition-transform">
                          <div className="text-4xl font-black text-slate-900 mb-1">98%</div>
                          <div className="text-xs font-bold uppercase tracking-widest text-slate-400">Campaign Retention</div>
                      </div>
                      <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-xl shadow-slate-100/50 translate-x-12 hover:-translate-y-1 transition-transform">
                          <div className="text-4xl font-black text-slate-900 mb-1">24Hr</div>
                          <div className="text-xs font-bold uppercase tracking-widest text-slate-400">Payment Processing</div>
                      </div>
                      <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-xl shadow-slate-100/50 hover:-translate-y-1 transition-transform">
                          <div className="text-4xl font-black text-slate-900 mb-1">10k+</div>
                          <div className="text-xs font-bold uppercase tracking-widest text-slate-400">Active Collaborations</div>
                      </div>
                  </div>

                  {/* Center - Main Featured Card */}
                  <div className="relative group">
                      <div className="absolute -inset-10 bg-gradient-to-r from-primary/20 to-blue-400/20 blur-[100px] opacity-50 group-hover:opacity-100 transition-opacity" />
                      <TiltCard className="z-10">
                        <div className="relative aspect-[4/5] rounded-[4rem] overflow-hidden border-[12px] border-white shadow-2xl transition-all duration-700 hover:scale-[1.02]">
                            <img src="/creators/avatar3.png" alt="Featured Creator" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                            <div className="absolute bottom-12 left-12 right-12 text-left">
                                <Badge className="bg-primary text-white border-0 mb-6 px-4 py-1.5 font-black text-[10px] tracking-widest uppercase rounded-full">Pro Member • Verified</Badge>
                                <div className="text-5xl text-white font-black leading-tight tracking-tighter mb-2">Aryan Khanna</div>
                                <div className="flex items-center gap-4">
                                    <div className="text-white/60 text-sm font-bold uppercase tracking-[0.2em]">Lifestyle & Tech</div>
                                    <div className="h-4 w-px bg-white/20" />
                                    <div className="text-white font-bold text-sm">450k+ Reach</div>
                                </div>
                            </div>
                        </div>
                      </TiltCard>
                  </div>

                  {/* Right Column - Brand Logos/Icons */}
                  <div className="grid grid-cols-2 md:grid-cols-1 gap-6 md:gap-8">
                      {[
                        { icon: <Zap className="w-8 h-8 text-amber-500" />, label: "Instant Connection" },
                        { icon: <ShieldCheck className="w-8 h-8 text-emerald-500" />, label: "Verified Only" },
                        { icon: <Award className="w-8 h-8 text-primary" />, label: "Elite Campaigns" },
                        { icon: <Globe className="w-8 h-8 text-blue-500" />, label: "Global Standard" }
                      ].map((item, i) => (
                        <div key={i} className="flex items-center gap-4 p-4 rounded-3xl bg-white border border-slate-100 shadow-lg shadow-slate-100/50 md:even:translate-x-[-20%]">
                            <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center">
                                {item.icon}
                            </div>
                            <div className="text-sm font-black text-slate-900 leading-tight">{item.label}</div>
                        </div>
                      ))}
                  </div>
              </div>
          </div>
        </div>
      </section>

      {/* Brand Cloud - Social Proof */}
      <section className="py-20 bg-white border-y border-slate-100 overflow-hidden">
        <div className="container mx-auto px-4">
            <p className="text-center text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-12">Empowering Growth for Emerging & Established Brands</p>
            <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-60 grayscale hover:grayscale-0 transition-all">
                {/* Brand Logos as components for better visuals */}
                {["Aura", "Nebula", "Loom", "Vortex", "Pulse", "Zenith"].map(brand => (
                    <div key={brand} className="text-2xl font-black tracking-tighter text-slate-300 select-none cursor-default hover:text-primary transition-colors">
                        {brand.toUpperCase()}
                    </div>
                ))}
            </div>
        </div>
      </section>

      {/* Product Showcase Section */}
      <section id="features" className="py-32 bg-[#F8F9FA] relative">
        <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-20 items-center">
                <div className="relative group">
                    <div className="absolute -inset-4 bg-primary/20 rounded-[3rem] blur-2xl opacity-50 group-hover:opacity-100 transition-opacity" />
                    <div className="relative rounded-[3rem] overflow-hidden border-[8px] border-white shadow-2xl bg-white">
                        <div className="bg-slate-900 p-4 flex items-center gap-2">
                            <div className="flex gap-1.5">
                                <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                                <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                            </div>
                            <div className="bg-white/10 rounded-md px-3 py-1 text-[10px] text-white/40 font-mono ml-4">grifi.network/dashboard/feed</div>
                        </div>
                        <div className="p-8 space-y-6">
                            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                                <div className="h-6 w-32 bg-slate-100 rounded-full animate-pulse" />
                                <div className="h-4 w-12 bg-primary/10 rounded-full" />
                            </div>
                            {[1, 2].map(i => (
                                <div key={i} className="flex gap-4 p-6 rounded-3xl bg-slate-50 border border-slate-100">
                                    <div className="w-12 h-12 rounded-full bg-slate-200 shrink-0" />
                                    <div className="space-y-3 w-full">
                                        <div className="h-4 w-1/3 bg-slate-200 rounded-full outline-slate-100" />
                                        <div className="h-4 w-full bg-slate-200 rounded-full" />
                                        <div className="h-4 w-4/5 bg-slate-200 rounded-full" />
                                        <div className="h-40 w-full bg-slate-200 rounded-2xl" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="space-y-12">
                    <div className="space-y-6">
                        <Badge className="bg-primary/10 text-primary border-none font-black px-4 py-1.5 rounded-full">THE PLATFORM</Badge>
                        <h2 className="text-4xl md:text-6xl font-black tracking-tight leading-none text-slate-900">A Unified Hub for <br />Campaign Success.</h2>
                        <p className="text-lg md:text-xl text-slate-500 font-medium leading-relaxed">
                            Stop juggling between DMs and emails. Grifi provides a professional workflow designed for the speed of modern social media.
                        </p>
                    </div>

                    <div className="grid gap-8">
                        {[
                            { icon: <Users />, title: "Creator Network", desc: "Access a curated list of verified creators across every niche." },
                            { icon: <BarChart3 />, title: "Real-time Analytics", desc: "Track campaign performance and ROI directly in your dashboard." },
                            { icon: <CheckCircle2 />, title: "Verified Deliverables", desc: "Every piece of content is reviewed and approved before payment." }
                        ].map((item, i) => (
                            <div key={i} className="flex gap-6 items-start group">
                                <div className="w-14 h-14 rounded-2xl bg-white border border-slate-100 shadow-lg flex items-center justify-center text-primary shrink-0 group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all">
                                    {item.icon}
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold mb-2 text-slate-900">{item.title}</h3>
                                    <p className="text-slate-500 font-medium leading-relaxed">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* How it Works / Workflow */}
      <section id="how-it-works" className="py-32 bg-slate-900 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[150px] -z-0 opacity-50" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center mb-24">
            <h2 className="text-5xl md:text-7xl font-black mb-8 leading-none tracking-tighter">THE WORKFLOW. <br /><span className="text-primary italic">REIMAGINED.</span></h2>
            <p className="text-xl text-slate-400 font-medium max-w-2xl mx-auto">Shipping, tracking, and payments — all handled in one place with military-grade precision.</p>
          </div>

          <div className="relative mb-24">
            {/* Connection Line (Desktop) */}
            <div className="hidden lg:block absolute top-[45px] left-[15%] right-[15%] h-1 bg-gradient-to-r from-slate-800 via-primary/50 to-slate-800 -z-10 rounded-full" />

            <div className="grid md:grid-cols-3 gap-16">
                {steps.map((step, idx) => (
                    <div key={idx} className="flex flex-col items-center text-center group">
                        <div className="w-24 h-24 rounded-3xl bg-slate-800/50 backdrop-blur-md border-2 border-slate-700/50 shadow-2xl flex items-center justify-center mb-10 group-hover:border-primary group-hover:bg-primary/10 transition-all duration-500 relative">
                            <div className="absolute -top-4 -right-4 w-10 h-10 rounded-2xl bg-primary text-white text-sm font-black flex items-center justify-center border-4 border-slate-900 shadow-xl">
                                {idx + 1}
                            </div>
                            <div className="text-primary group-hover:scale-110 transition-transform duration-500">
                                {step.icon}
                            </div>
                        </div>
                        <Badge variant="outline" className="mb-6 border-slate-700 text-slate-400 font-black tracking-[0.3em] uppercase text-[10px] py-1.5 px-4 rounded-full">
                            {step.label}
                        </Badge>
                        <h3 className="text-3xl font-black mb-4 tracking-tight">{step.title}</h3>
                        <p className="text-slate-400 font-medium leading-relaxed max-w-sm">
                            {step.desc}
                        </p>
                    </div>
                ))}
            </div>
          </div>

          <div className="pt-20 border-t border-slate-800/50 grid md:grid-cols-3 gap-12 items-center">
              <div className="flex flex-col items-center md:items-start">
                  <div className="text-6xl font-black text-white mb-2 tracking-tighter">500k+</div>
                  <div className="text-primary text-xs font-black uppercase tracking-[0.3em]">Campaign Views Generated</div>
              </div>
              <div className="flex flex-col items-center md:items-start">
                  <div className="text-6xl font-black text-white mb-2 tracking-tighter">8.4%</div>
                  <div className="text-primary text-xs font-black uppercase tracking-[0.3em]">Avg. Creator Engagement</div>
              </div>
              <div className="flex flex-col items-center md:items-start">
                  <div className="text-6xl font-black text-white mb-2 tracking-tighter">99.9%</div>
                  <div className="text-primary text-xs font-black uppercase tracking-[0.3em]">Success Rate</div>
              </div>
          </div>
        </div>
      </section>

      {/* Featured Campaigns Grid */}
      <section className="py-32 bg-white overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-end justify-between mb-20 gap-8">
            <div className="space-y-6">
                <Badge className="bg-slate-100 text-slate-900 border-none font-black px-4 py-1.5 rounded-full">PORTFOLIO</Badge>
                <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-none">THE WALL OF <br /><span className="italic text-slate-400">IMPACT.</span></h2>
            </div>
            <Link href="/dashboard" className="text-primary font-black flex items-center gap-2 hover:gap-4 transition-all pb-2 text-xl">
                Browse More <ArrowRight className="w-6 h-6" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {[1, 2, 3].map((i) => (
                <div key={i} className="group relative aspect-[3/4] rounded-[3rem] overflow-hidden shadow-2xl transition-all hover:-translate-y-4 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.25)]">
                    <img
                        src={`/campaigns/reel${i}.png`}
                        alt={`Reel ${i}`}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-transparent opacity-60 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute bottom-10 left-10 right-10 translate-y-6 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                        <div className="flex items-center gap-3 mb-6">
                           {i === 1 && <Badge className="bg-orange-500 hover:bg-orange-500 border-none px-4 py-1 rounded-full font-black text-[10px] tracking-widest uppercase">Fashion</Badge>}
                           {i === 2 && <Badge className="bg-blue-500 hover:bg-blue-500 border-none px-4 py-1 rounded-full font-black text-[10px] tracking-widest uppercase">Tech</Badge>}
                           {i === 3 && <Badge className="bg-purple-500 hover:bg-purple-500 border-none px-4 py-1 rounded-full font-black text-[10px] tracking-widest uppercase">Travel</Badge>}
                           <div className="flex items-center gap-1 text-white/90 text-[10px] font-black uppercase tracking-widest">
                                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                4.9 Rating
                           </div>
                        </div>
                        <h4 className="text-white font-black text-3xl mb-4 leading-tight tracking-tight">Campaign Excellence <br />Session {2025 + i}</h4>
                        <div className="flex items-center justify-between pt-6 border-t border-white/10">
                            <div className="text-white/60 text-xs font-bold uppercase tracking-widest">Deliverable: 3x Reels</div>
                            <div className="text-primary font-black text-xs uppercase tracking-widest">Completed</div>
                        </div>
                    </div>
                </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-32 bg-[#FDFDFD] border-t border-slate-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-24">
            <h2 className="text-5xl md:text-7xl font-black mb-8 leading-none tracking-tighter">WHAT THEY <span className="text-primary italic">SAY.</span></h2>
            <p className="text-xl text-slate-500 font-medium max-w-2xl mx-auto">Don&apos;t just take our word for it. Hear from those at the center of the pulse.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            {testimonials.map((t, i) => (
                <div key={i} className="p-10 rounded-[3rem] bg-white border border-slate-100 shadow-xl shadow-slate-100/50 flex flex-col justify-between hover:shadow-2xl transition-all">
                    <div className="space-y-8">
                        <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map(s => <Star key={s} className="w-4 h-4 text-primary fill-primary" />)}
                        </div>
                        <p className="text-2xl font-bold leading-tight text-slate-900">&ldquo;{t.quote}&rdquo;</p>
                    </div>
                    <div className="flex items-center gap-4 mt-12 pt-8 border-t border-slate-50">
                        <img src={t.avatar} alt={t.author} className="w-14 h-14 rounded-2xl object-cover" />
                        <div>
                            <div className="font-black text-slate-900">{t.author}</div>
                            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t.role}</div>
                        </div>
                    </div>
                </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-32 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tighter">FREQUENTLY <br /><span className="text-slate-400 italic">ASKED.</span></h2>
          </div>

          <div className="space-y-6">
            {faqs.map((faq, i) => (
              <details key={i} className="group p-8 rounded-3xl bg-slate-50 border border-slate-100 cursor-pointer transition-all open:bg-white open:shadow-xl open:shadow-slate-100">
                <summary className="flex items-center justify-between font-black text-xl text-slate-900 list-none">
                  {faq.q}
                  <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center group-open:rotate-45 transition-transform">
                    <Plus className="w-4 h-4 text-slate-400" />
                  </div>
                </summary>
                <p className="mt-6 text-lg text-slate-500 font-medium leading-relaxed max-w-2xl">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 px-4">
        <div className="container mx-auto max-w-7xl">
            <div className="relative rounded-[5rem] overflow-hidden bg-slate-900 p-12 md:p-32 text-center">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.15)_0%,transparent_70%)]" />
                <div className="absolute -top-1/2 -left-1/4 w-full h-full bg-primary/20 blur-[150px] animate-pulse" />
                
                <div className="relative z-10 space-y-12">
                    <h2 className="text-5xl md:text-8xl font-black text-white tracking-tighter leading-[0.9]">READY TO <br /><span className="text-primary italic">PULSE?</span></h2>
                    <p className="text-xl md:text-2xl text-slate-400 font-medium max-w-2xl mx-auto">
                        Join India&apos;s most exclusive creator network today and start defining the future of commerce.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-6 justify-center">
                        <Link href="/auth?mode=signup">
                            <Button size="lg" className="h-20 px-16 text-2xl font-black rounded-[2.5rem] bg-white text-slate-900 hover:bg-slate-100 shadow-2xl transition-all hover:scale-105 active:scale-95">
                                Join Now
                            </Button>
                        </Link>
                        <Link href="/dashboard/network">
                            <Button size="lg" variant="outline" className="h-20 px-16 text-2xl font-black rounded-[2.5rem] border-white/10 text-white bg-white/5 backdrop-blur-md hover:bg-white/10 transition-all">
                                View Talent
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
