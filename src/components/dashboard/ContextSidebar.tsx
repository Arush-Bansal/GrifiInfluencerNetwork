"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DashboardProfile } from "@/types/dashboard";

interface ContextSidebarProps {
  role: string | null;
  profile: DashboardProfile | null;
  className?: string;
}

export function ContextSidebar({ role, profile, className }: ContextSidebarProps) {
  const isInfluencer = role === "influencer";

  return (
    <aside className={className}>
      <div className="space-y-6">
        {/* Quick Stats */}
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Active Deals</span>
              <span className="text-sm font-semibold">0</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Total Earned</span>
              <span className="text-sm font-semibold">$0</span>
            </div>
            {isInfluencer && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Engagement</span>
                <Badge variant="outline" className="text-[10px] py-0 h-5">
                  {profile?.engagement_rate ? `${profile.engagement_rate}%` : "0%"}
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>

        {/* AI Suggestions */}
        {/* <div className="p-4 bg-primary/5 rounded-xl border border-primary/10">
          <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" />
            AI Suggestions
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {isInfluencer 
              ? "Your profile matches 3 new tech campaigns. Update your portfolio to increase visibility." 
              : "We found 12 influencers in your niche with high engagement rates this week."}
          </p>
          <Button variant="link" className="text-xs h-auto p-0 mt-2 text-primary">
            Explore matches
          </Button>
        </div> */}

        {/* Role Specific Alerts */}
        {!profile?.username && (
          <div className="p-4 bg-yellow-500/10 rounded-xl border border-yellow-500/20">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="text-xs font-semibold text-yellow-900">Finish Profile</h4>
                <p className="text-[10px] text-yellow-800/80 mt-1">
                  Users with complete profiles are 5x more likely to close deals.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
