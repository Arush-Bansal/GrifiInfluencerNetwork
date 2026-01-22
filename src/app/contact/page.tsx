"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { Mail, MessageSquare, MapPin, Send, Sparkles } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Footer } from "@/components/brand/Footer";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";

const ContactPage = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
        title: "Message Sent!",
        description: "Moving you to our priority queue. We'll be in touch soon.",
    });
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-slate-900 font-sans">
      {/* Navigation */}
      <nav className="border-b border-slate-200/60 bg-white/70 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group transition-all">
            <Logo size={32} />
            <span className="text-xl font-bold tracking-tight text-slate-900">GRIFI</span>
          </Link>
          <div className="flex items-center gap-4">
             <Link href="/">
                <Button variant="ghost" className="rounded-full text-sm font-medium">Home</Button>
             </Link>
             {!loading && session && (
                <Link href="/dashboard">
                  <Button variant="outline" className="rounded-full border-slate-200 hover:bg-slate-50 font-bold px-6">
                    Dashboard
                  </Button>
                </Link>
             )}
          </div>
        </div>
      </nav>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 gap-16 items-start">
              {/* Left Side: Contact Info */}
              <div className="space-y-10">
                <div className="space-y-6">
                    <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-primary/5 text-primary border border-primary/10">
                        <Sparkles className="w-4 h-4 mr-2" />
                        <span className="font-bold text-[10px] tracking-widest uppercase">Contact Us</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight">Let&apos;s build the <span className="text-primary italic">future</span> together.</h1>
                    <p className="text-slate-500 text-lg font-medium leading-relaxed max-w-md">
                        Have questions about our network? Whether you&apos;re a brand looking for talent or a creator seeking deals, we&apos;re here to help.
                    </p>
                </div>

                <div className="space-y-6">
                   <div className="flex items-center gap-5 p-6 rounded-3xl bg-white border border-slate-100 shadow-sm transition-all hover:shadow-md">
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-500">
                            <Mail className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Email us</p>
                            <p className="font-bold text-slate-900">hello@grifi.in</p>
                        </div>
                   </div>

                   <div className="flex items-center gap-5 p-6 rounded-3xl bg-white border border-slate-100 shadow-sm transition-all hover:shadow-md">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-500">
                            <MessageSquare className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Support</p>
                            <p className="font-bold text-slate-900">In-app professional chat</p>
                        </div>
                   </div>

                   <div className="flex items-center gap-5 p-6 rounded-3xl bg-white border border-slate-100 shadow-sm transition-all hover:shadow-md">
                        <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-500">
                            <MapPin className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Our Base</p>
                            <p className="font-bold text-slate-900">New Delhi, India</p>
                        </div>
                   </div>
                </div>
              </div>

              {/* Right Side: Contact Form */}
              <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/50">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 ml-1">Full Name</label>
                        <Input placeholder="John Doe" className="h-14 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white transition-all px-6 text-base" required />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 ml-1">Work Email</label>
                        <Input type="email" placeholder="john@company.com" className="h-14 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white transition-all px-6 text-base" required />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 ml-1">What are you looking for?</label>
                        <select className="flex h-14 w-full rounded-2xl border border-slate-100 bg-slate-50/50 px-6 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 disabled:cursor-not-allowed disabled:opacity-50 transition-all">
                            <option>I&apos;m a Brand looking for Creators</option>
                            <option>I&apos;m a Creator looking for Deals</option>
                            <option>General Inquiry</option>
                            <option>Partnership/Investment</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 ml-1">Message</label>
                        <Textarea placeholder="Tell us more about your needs..." className="min-h-[150px] rounded-[1.5rem] border-slate-100 bg-slate-50/50 focus:bg-white transition-all p-6 text-base px-6" required />
                    </div>
                    <Button type="submit" className="w-full h-16 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-lg shadow-xl shadow-slate-200 transition-all hover:scale-[1.02] active:scale-[0.98]">
                        Send Message <Send className="ml-3 w-5 h-5" />
                    </Button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ContactPage;
