"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Scale, FileText, CheckCircle2 } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Footer } from "@/components/brand/Footer";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";

const TermsPage = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });
  }, []);

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

      {/* Hero Section */}
      <section className="pt-20 pb-16 bg-white border-b border-slate-100">
        <div className="container mx-auto px-4 text-center">
            <div className="inline-flex items-center justify-center mb-6 px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
                <Scale className="w-4 h-4 mr-2" />
                <span className="font-bold text-[10px] tracking-widest uppercase">Legal Terms</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">Terms of Service</h1>
            <p className="text-slate-500 max-w-2xl mx-auto font-medium">
                Last updated: January 21, 2026. By using Grifi, you agree to these professional standards and rules.
            </p>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="space-y-12">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-500">
                    <FileText className="w-5 h-5" />
                </div>
                1. Agreement to Terms
              </h2>
              <p className="text-slate-600 leading-relaxed font-medium">
                By accessing our Services, you agree that you have read, understood, and agreed to be bound by all of these Terms of Use.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500">
                    <CheckCircle2 className="w-5 h-5" />
                </div>
                2. Professional Conduct
              </h2>
              <p className="text-slate-600 leading-relaxed font-medium">
                Grifi is a professional ecosystem for creators and brands. You agree to maintain professional standards when communicating, collaborating, and transacting through the platform.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold">3. User Representations</h2>
              <p className="text-slate-600 leading-relaxed font-medium">
                By using the Services, you represent and warrant that: (1) all registration information you submit will be true, accurate, current, and complete; (2) you will maintain the accuracy of such information and promptly update such registration information as necessary.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold">4. Prohibited Activities</h2>
              <p className="text-slate-600 leading-relaxed font-medium">
                You may not access or use the Services for any purpose other than that for which we make the Services available.
              </p>
            </div>

            <div className="p-1 max-w-fit mx-auto mt-20">
                <p className="text-[10px] text-slate-300 font-bold uppercase tracking-[0.3em]">Building a trusted network together</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default TermsPage;
