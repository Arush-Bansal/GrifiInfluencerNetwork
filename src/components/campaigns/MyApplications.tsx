"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, MessageSquare, Megaphone, Calendar, Building2 } from "lucide-react";
import { format } from "date-fns";
import { ChatSheet } from "@/components/collabs/ChatSheet";

interface Application {
  id: string;
  status: string;
  message: string;
  created_at: string;
  campaign: {
    title: string;
    brand_id: string;
    brand: {
      username: string;
      full_name: string;
      avatar_url: string;
    };
  };
}

interface MyApplicationsProps {
  influencerId: string;
}

export function MyApplications({ influencerId }: MyApplicationsProps) {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchApplications = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from("campaign_applications")
        .select(`
          id,
          status,
          message,
          created_at,
          campaign:campaigns(
            title,
            brand_id,
            brand:profiles(username, full_name, avatar_url)
          )
        `)
        .eq("influencer_id", influencerId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (error: any) {
      console.error("Error fetching applications:", error.message || error);
      if (error.details) console.error("Error details:", error.details);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [influencerId]);

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <div className="text-center py-12 bg-secondary/20 rounded-xl border-2 border-dashed border-border/50">
        <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          <Megaphone className="w-6 h-6 text-muted-foreground/50" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No applications yet</h3>
        <p className="text-muted-foreground">Apply to campaigns to see them listed here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {applications.map((app) => (
        <Card key={app.id} className="border-border/50 overflow-hidden hover:shadow-md transition-shadow">
          <CardContent className="p-0">
             <div className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Building2 className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg leading-tight mb-1">{app.campaign?.title}</h3>
                      <p className="text-sm text-muted-foreground font-medium">
                        {app.campaign?.brand?.full_name || app.campaign?.brand?.username}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2">
                    <Badge variant={
                      app.status === 'approved' ? 'brand' : 
                      app.status === 'rejected' ? 'destructive' : 'default'
                    } className="px-3 py-1 font-bold uppercase tracking-wider text-[10px]">
                      {app.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {format(new Date(app.created_at), "MMM d, yyyy")}
                    </span>
                  </div>
                </div>
                
                {app.message && (
                  <div className="mt-4 p-3 bg-secondary/30 rounded-lg text-sm text-muted-foreground border border-border/30">
                     <p className="font-bold text-[10px] uppercase tracking-widest mb-1.5 text-muted-foreground/70">Your Pitch:</p>
                     {app.message}
                  </div>
                )}
             </div>
             
             {app.status === 'approved' && (
                <div className="px-4 py-3 bg-primary/5 border-t border-primary/10 flex justify-end">
                   <ChatSheet 
                      partnerId={app.campaign?.brand_id}
                      partnerName={app.campaign?.brand?.full_name || app.campaign?.brand?.username || "Brand"}
                      partnerAvatar={app.campaign?.brand?.avatar_url}
                      trigger={
                        <Button size="sm" className="gap-2">
                          <MessageSquare className="w-4 h-4" />
                          Chat with Brand
                        </Button>
                      }
                   />
                </div>
             )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
