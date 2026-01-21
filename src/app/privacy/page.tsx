"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Shield, Lock, Eye } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Footer } from "@/components/brand/Footer";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";

const PrivacyPage = () => {
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
            <div className="inline-flex items-center justify-center mb-6 px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100">
                <Shield className="w-4 h-4 mr-2" />
                <span className="font-bold text-[10px] tracking-widest uppercase">Privacy Policy</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">Your Privacy matters</h1>
            <p className="text-slate-500 max-w-2xl mx-auto font-medium">
                Last updated: January 21, 2026. We are committed to protecting your personal data and your right to privacy.
            </p>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="space-y-12">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500">
                    <Eye className="w-5 h-5" />
                </div>
                1. Information We Collect
              </h2>
              <p className="text-slate-600 leading-relaxed font-medium">
                We collect personal information that you provide to us such as name, address, contact information, passwords and security data, and payment information.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-orange-500">
                    <Lock className="w-5 h-5" />
                </div>
                2. How We Use Your Information
              </h2>
              <p className="text-slate-600 leading-relaxed font-medium">
                We use personal information collected via our Services for a variety of business purposes described below. We process your personal information for these purposes in reliance on our legitimate business interests, in order to enter into or perform a contract with you, with your consent, and/or for compliance with our legal obligations.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold">3. Will Your Information Be Shared?</h2>
              <p className="text-slate-600 leading-relaxed font-medium">
                We only share information with your consent, to comply with laws, to provide you with services, to protect your rights, or to fulfill business obligations.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold">4. How Long Do We Keep Your Information?</h2>
              <p className="text-slate-600 leading-relaxed font-medium">
                We keep your information for as long as necessary to fulfill the purposes outlined in this privacy notice unless otherwise required by law.
              </p>
            </div>

            <div className="p-8 rounded-[2rem] bg-white border border-slate-100 shadow-xl shadow-slate-200/20 mt-16 text-center">
                <h3 className="text-xl font-bold mb-4">Questions about our policy?</h3>
                <p className="text-slate-500 mb-8 font-medium">Our team is here to help you understand how your data is handled.</p>
                <Link href="/contact">
                    <Button className="rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold h-12 px-10">
                        Contact Privacy Team
                    </Button>
                </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default PrivacyPage;
