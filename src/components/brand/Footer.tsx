"use client";

import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { Instagram, Linkedin, Globe, Twitter, Mail, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Footer = () => {
  return (
    <footer className="bg-slate-950 text-white py-24 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-800 to-transparent" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[150px] -z-0" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
          <div className="space-y-8">
            <Link href="/" className="flex items-center gap-2 group">
              <Logo size={40} />
              <span className="text-2xl font-black tracking-tighter">GRIFI</span>
            </Link>
            <p className="text-slate-400 font-medium leading-relaxed text-base max-w-sm">
              The professional infrastructure for the global creator economy. We bridge the gap between creative vision and brand growth.
            </p>
            <div className="flex gap-4">
              {[
                { icon: <Instagram className="w-5 h-5" />, href: "#" },
                { icon: <Twitter className="w-5 h-5" />, href: "#" },
                { icon: <Linkedin className="w-5 h-5" />, href: "#" },
                { icon: <Globe className="w-5 h-5" />, href: "#" }
              ].map((social, i) => (
                <a key={i} href={social.href} className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:bg-primary hover:text-white hover:border-primary hover:-translate-y-1 transition-all">
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="font-black mb-8 uppercase text-xs tracking-[0.3em] text-slate-500">Platform</h4>
            <ul className="space-y-5 font-bold text-slate-300">
              <li><Link href="/dashboard" className="hover:text-primary transition-colors">Creator Dashboard</Link></li>
              <li><Link href="/dashboard/network" className="hover:text-primary transition-colors">Brand Solutions</Link></li>
              <li><Link href="/pricing" className="hover:text-primary transition-colors">Pricing & Plans</Link></li>
              <li><Link href="/about" className="hover:text-primary transition-colors">Mission & Story</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-black mb-8 uppercase text-xs tracking-[0.3em] text-slate-500">Support</h4>
            <ul className="space-y-5 font-bold text-slate-300">
              <li><Link href="/help" className="hover:text-primary transition-colors">Help Center</Link></li>
              <li><Link href="/contact" className="hover:text-primary transition-colors">Contact Support</Link></li>
              <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
            </ul>
          </div>

          <div className="bg-slate-900/50 p-8 rounded-[2.5rem] border border-slate-800/50 space-y-6">
            <h4 className="font-black text-xl">Newsletter</h4>
            <p className="text-slate-400 text-sm font-medium">Join 5,000+ creators and brands receiving our weekly pulse report.</p>
            <div className="space-y-3">
                <input 
                    type="email" 
                    placeholder="name@email.com" 
                    className="w-full h-14 rounded-2xl bg-slate-800 border-none px-6 text-sm font-bold focus:ring-2 focus:ring-primary transition-all outline-none" 
                />
                <Button className="w-full h-14 rounded-2xl bg-white text-slate-900 hover:bg-slate-100 font-black">
                    Subscribe
                </Button>
            </div>
          </div>
        </div>
        
        <div className="pt-12 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em]">
              © 2026 Grifi pulse network
            </p>
            <div className="h-4 w-px bg-slate-900 hidden md:block" />
            <div className="flex gap-6 text-[10px] font-black uppercase tracking-widest text-slate-500">
                <span className="flex items-center gap-2"><MapPin className="w-3 h-3 text-primary" /> Mumbai</span>
                <span className="flex items-center gap-2"><MapPin className="w-3 h-3 text-primary" /> Bengaluru</span>
                <span className="flex items-center gap-2"><MapPin className="w-3 h-3 text-primary" /> New Delhi</span>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <a href="mailto:hello@grifi.network" className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white flex items-center gap-2 transition-colors">
                <Mail className="w-3 h-3" /> hello@grifi.network
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
