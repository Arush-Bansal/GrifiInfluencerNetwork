"use client";

import { useMyApplications } from "@/hooks/use-campaigns";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, MessageSquare, Megaphone, Calendar, Building2 } from "lucide-react";
import { format } from "date-fns";
import { ChatSheet } from "@/components/collabs/ChatSheet";

interface MyApplicationsProps {
  influencerId: string;
}

export function MyApplications({ influencerId }: MyApplicationsProps) {
  const { data: applications = [], isLoading: loading } = useMyApplications(influencerId);

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
      {applications.map((app: any) => ( // eslint-disable-line @typescript-eslint/no-explicit-any
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
