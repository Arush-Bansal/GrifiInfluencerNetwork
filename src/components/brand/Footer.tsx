"use client";

import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { Instagram, Linkedin, Mail } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-slate-950 text-white py-24 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-800 to-transparent" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[150px] -z-0" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col md:flex-row justify-between gap-16 mb-20">
          <div className="space-y-8 max-w-md">
            <Link href="/" className="flex items-center gap-2 group">
              <Logo size={40} />
              <span className="text-2xl font-black tracking-tighter">GRIFI</span>
            </Link>
            <p className="text-slate-400 font-medium leading-relaxed text-base">
              AI-powered platform redefining Influencer and UGC Marketing. From discovery to deal, we enable smarter creator collabs.
            </p>
            <div className="flex gap-4">
              {[
                { icon: <Instagram className="w-5 h-5" />, href: "https://instagram.com/grifi_official/" },
                { icon: <Linkedin className="w-5 h-5" />, href: "https://linkedin.com/company/grifitech" }
              ].map((social, i) => (
                <a key={i} href={social.href} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:bg-primary hover:text-white hover:border-primary hover:-translate-y-1 transition-all">
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
          
          <div className="flex flex-col gap-6">
            <h4 className="font-black uppercase text-xs tracking-[0.3em] text-slate-500">Quick Links</h4>
            <ul className="grid grid-cols-1 gap-4 font-bold text-slate-300">
              <li><Link href="/about" className="hover:text-primary transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-primary transition-colors">Contact Us</Link></li>
              <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-primary transition-colors">Terms</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-12 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em]">
              © 2026 Grifi pulse network
            </p>
          </div>
          
          <div className="flex items-center gap-6">
            <a href="mailto:hello@grifi.in" className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white flex items-center gap-2 transition-colors">
                <Mail className="w-3 h-3" /> hello@grifi.in
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
