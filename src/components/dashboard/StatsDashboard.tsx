"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardProfile } from "@/types/dashboard";
import { 
  Eye, 
  Mail, 
  Instagram, 
  Youtube, 
  Twitter, 
  Copy, 
  Check, 
  Link as LinkIcon 
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
      title: "Page Visits",
      value: profile.page_visits || 0,
      icon: Eye,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      title: "Email Copies",
      value: profile.email_copy_count || 0,
      icon: Mail,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
    },
    {
      title: "Instagram Clicks",
      value: profile.insta_copy_count || 0,
      icon: Instagram,
      color: "text-pink-500",
      bg: "bg-pink-500/10",
    },
    {
      title: "YouTube Clicks",
      value: profile.yt_copy_count || 0,
      icon: Youtube,
      color: "text-red-500",
      bg: "bg-red-500/10",
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Profile Link Card */}
      <Card className="border-none bg-gradient-to-br from-primary/10 via-background to-background shadow-xl overflow-hidden relative group">
        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
          <LinkIcon size={120} />
        </div>
        <CardContent className="p-8 relative z-10">
          <div className="space-y-4">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-widest text-primary/60 mb-1">Your Professional identity</h2>
              <CardTitle className="text-3xl font-serif">Share your profile</CardTitle>
            </div>
            
            <div className="flex items-center gap-2 p-1 pl-4 bg-muted/50 rounded-2xl border border-border/50 max-w-xl group/link hover:bg-muted transition-colors">
              <span className="text-sm font-medium text-muted-foreground truncate flex-1">
                {profileUrl}
              </span>
              <Button 
                onClick={() => copyToClipboard(profileUrl, "Profile Link")}
                className="rounded-xl h-10 px-6 font-bold shadow-lg shadow-primary/20"
              >
                {copiedField === "Profile Link" ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                {copiedField === "Profile Link" ? "Copied" : "Copy Link"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <Card key={stat.title} className="border-none bg-card/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-all group overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color} transition-transform group-hover:scale-110 duration-500`}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">{stat.title}</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <h3 className="text-4xl font-serif font-bold tracking-tighter">
                    {stat.value.toLocaleString()}
                  </h3>
                  <span className="text-xs font-bold text-green-500">+0%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Additional Stats / Quick Actions */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 border-none bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl font-serif">Reach Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full bg-muted/20 rounded-2xl flex items-center justify-center border border-dashed border-border">
              <p className="text-sm text-muted-foreground font-medium">Analytics visualization coming soon</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none bg-[#1E1E1C] text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Twitter className="w-24 h-24" />
          </div>
          <CardContent className="p-8 h-full flex flex-col justify-between">
            <div className="space-y-4">
              <div className="p-3 bg-white/10 rounded-2xl w-fit">
                <Twitter className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Twitter Clicks</h3>
                <p className="text-sm text-white/60">Real-time engagement from your bio</p>
              </div>
            </div>
            <div className="mt-8">
              <h3 className="text-5xl font-serif font-bold">{profile.twitter_copy_count || 0}</h3>
              <p className="text-xs font-bold uppercase tracking-widest text-white/40 mt-1">Total Clicks</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
