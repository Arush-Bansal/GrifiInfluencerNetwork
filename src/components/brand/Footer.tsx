"use client";

import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { Instagram, Linkedin, Globe } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-white py-24 border-t border-slate-100">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-6">
              <Logo size={40} />
              <span className="text-2xl font-bold tracking-tight text-slate-900">GRIFI</span>
            </Link>
            <p className="text-slate-500 font-medium leading-relaxed text-sm max-w-xs">
              Building the professional layer of the creator economy. Connecting brands with authentic storytellers.
            </p>
          </div>
          
          <div>
            <h4 className="font-bold mb-6 uppercase text-xs tracking-widest text-slate-400">Platform</h4>
            <ul className="space-y-4 font-bold text-sm text-slate-600">
              <li><Link href="/" className="hover:text-primary transition-colors">Home</Link></li>
              <li><Link href="/about" className="hover:text-primary transition-colors">About Us</Link></li>
              <li><Link href="/dashboard/network" className="hover:text-primary transition-colors">Discover</Link></li>
              <li><Link href="/auth" className="hover:text-primary transition-colors">Get Started</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-6 uppercase text-xs tracking-widest text-slate-400">Legal</h4>
            <ul className="space-y-4 font-bold text-sm text-slate-600">
              <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
              <li><Link href="/contact" className="hover:text-primary transition-colors">Contact Support</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-6 uppercase text-xs tracking-widest text-slate-400">Social</h4>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-600 hover:bg-primary hover:text-white transition-all">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-600 hover:bg-primary hover:text-white transition-all">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-600 hover:bg-primary hover:text-white transition-all">
                <Globe className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
        
        <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-400 text-[11px] font-bold uppercase tracking-[0.2em]">
            © 2026 Grifi Network • Built for the next generation
          </p>
          <div className="flex gap-6 text-[11px] font-bold uppercase tracking-widest text-slate-400">
            <span>Mumbai</span>
            <span>New Delhi</span>
            <span>Bengaluru</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
