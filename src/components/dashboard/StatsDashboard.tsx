"use client";

import { Card, CardContent } from "@/components/ui/card";
import { DashboardProfile } from "@/types/dashboard";
import { 
  Eye, 
  Mail, 
  Instagram, 
  Youtube, 
  Copy, 
  Check, 
  Link as LinkIcon,
  Sparkles,
  Zap
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface StatsDashboardProps {
  profile: DashboardProfile;
}

export function StatsDashboard({ profile }: StatsDashboardProps) {
  const { toast } = useToast();
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const profileUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/u/${profile.username}`
    : `grifi.com/u/${profile.username}`;

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast({
      title: "Copied to clipboard",
      description: `${field} has been copied.`
    });
    setTimeout(() => setCopiedField(null), 2000);
  };

  const statCards = [
    {
      title: "Page Reach",
      value: profile.page_visits || 0,
      icon: Eye,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Inquiries",
      value: profile.email_copy_count || 0,
      icon: Mail,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
    },
    {
      title: "IG Intent",
      value: profile.insta_copy_count || 0,
      icon: Instagram,
      color: "text-rose-600",
      bg: "bg-rose-50",
    },
    {
      title: "YT Reach",
      value: profile.yt_copy_count || 0,
      icon: Youtube,
      color: "text-red-600",
      bg: "bg-red-50",
    },
  ];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Profile Link Card */}
      <Card className="border-none bg-slate-900 shadow-[0_32px_64px_-15px_rgba(0,0,0,0.2)] rounded-[3rem] overflow-hidden relative group">
        <div className="absolute inset-0 bg-noise opacity-10" />
        <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:opacity-20 transition-opacity duration-700">
          <Sparkles size={180} className="text-white" />
        </div>
        
        <CardContent className="p-10 md:p-14 relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-10">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="px-3 py-1 bg-primary/20 rounded-full border border-primary/30">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Live Profile</span>
                </div>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              </div>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
                Your professional <br />
                identity is active.
              </h2>
            </div>
            
            <div className="flex flex-col gap-4 w-full md:w-auto">
              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs ml-1">Universal Sharing Link</p>
              <div className="flex items-center gap-2 p-1.5 pl-6 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 w-full md:min-w-[400px] hover:bg-white/10 transition-all group/link">
                <span className="text-sm font-medium text-slate-300 truncate flex-1">
                  {profileUrl}
                </span>
                <Button 
                  onClick={() => copyToClipboard(profileUrl, "Profile Link")}
                  className="rounded-xl h-12 px-8 font-black bg-white text-slate-900 hover:bg-slate-100 transition-all active:scale-95 shadow-xl"
                >
                  {copiedField === "Profile Link" ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                  {copiedField === "Profile Link" ? "COPIED" : "COPY"}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {statCards.map((stat) => (
          <Card key={stat.title} className="border-none bg-white shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] rounded-[2.5rem] hover:shadow-[0_32px_64px_-15px_rgba(0,0,0,0.1)] transition-all group overflow-hidden">
            <CardContent className="p-8">
              <div className={`w-14 h-14 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center transition-transform group-hover:scale-110 duration-500`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div className="mt-8">
                <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{stat.title}</p>
                <div className="flex items-center gap-3">
                  <h3 className="text-5xl font-black tracking-tighter text-slate-900">
                    {stat.value.toLocaleString()}
                  </h3>
                  <div className="flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-600 rounded-full border border-green-100">
                     <Zap className="w-3 h-3 fill-current" />
                     <span className="text-[10px] font-bold">+0%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Analytics Placeholder */}
      <Card className="border-none bg-white shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] rounded-[3rem] overflow-hidden">
        <CardContent className="p-10 md:p-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-2xl font-black tracking-tight text-slate-900">Engagement Growth</h3>
              <p className="text-sm text-slate-400 font-medium">Tracking your performance across all connected channels.</p>
            </div>
            <Button variant="ghost" className="rounded-full text-xs font-bold uppercase tracking-widest text-primary hover:bg-primary/5">
              View Detailed Analytics
            </Button>
          </div>
          <div className="h-64 w-full bg-slate-50 rounded-[2rem] flex flex-col items-center justify-center border border-slate-100 relative group overflow-hidden">
            <div className="absolute inset-0 bg-noise opacity-[0.03]" />
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-700 mb-4 scale-90 opacity-80 backdrop-blur-sm">
                <LinkIcon className="text-slate-200 w-8 h-8" />
            </div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest relative z-10">Data Visualization Syncing...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
