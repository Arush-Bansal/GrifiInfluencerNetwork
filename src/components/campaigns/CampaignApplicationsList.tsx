"use client";

import { useCampaignApplications, useUpdateApplicationStatus } from "@/hooks/use-campaigns";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Check, X, MessageSquare, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChatSheet } from "@/components/collabs/ChatSheet";


interface CampaignApplicationsListProps {
  campaignId: string;
}

export function CampaignApplicationsList({ campaignId }: CampaignApplicationsListProps) {
  const { data: applications = [], isLoading: loading } = useCampaignApplications(campaignId);
  const updateStatus = useUpdateApplicationStatus();
  const { toast } = useToast();

  const handleStatusUpdate = async (applicationId: string, newStatus: "approved" | "rejected") => {
    updateStatus.mutate({ applicationId, campaignId, status: newStatus }, {
      onSuccess: () => {
        toast({
          title: `Application ${newStatus}`,
          description: `The application has been ${newStatus} successfully.`,
        });
      },
      onError: (error: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
        toast({
          title: "Error",
          description: error.message || "Failed to update status.",
          variant: "destructive",
        });
      }
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No applications yet for this campaign.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 pt-4">
      {applications.map((app) => (
        <Card key={app.id} className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex gap-3">
                <Avatar className="w-10 h-10 border border-border/50">
                  <AvatarImage src={app.influencer?.avatar_url} />
                  <AvatarFallback>{app.influencer?.username?.[0]?.toUpperCase() || "U"}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-sm">{app.influencer?.full_name || app.influencer?.username}</h4>
                    <Badge variant={
                      app.status === 'approved' ? 'brand' : 
                      app.status === 'rejected' ? 'destructive' : 'default'
                    } className="text-[10px] px-1.5 py-0 h-4">
                      {app.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">@{app.influencer?.username}</p>
                </div>
              </div>
              
              {app.status === 'pending' && (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                    onClick={() => handleStatusUpdate(app.id, 'rejected')}
                    disabled={updateStatus.isPending}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="default"
                    className="h-8 w-8 p-0"
                    onClick={() => handleStatusUpdate(app.id, 'approved')}
                    disabled={updateStatus.isPending}
                  >
                    <Check className="w-4 h-4" />
                  </Button>
                </div>
              )}
                            {app.status === 'approved' && (
                    <div className="flex gap-2">
                       <ChatSheet 
                          partnerId={app.influencer_id}
                          partnerName={app.influencer?.full_name || app.influencer?.username || "Influencer"}
                          partnerAvatar={app.influencer?.avatar_url}
                          trigger={
                            <Button size="sm" variant="outline" className="gap-2 h-8">
                              <MessageSquare className="w-3.5 h-3.5" />
                              Chat
                            </Button>
                          }
                       />
                    </div>
                  )}
            </div>
            
            {app.message && (
              <div className="mt-3 p-2 bg-secondary/50 rounded text-xs text-muted-foreground ring-1 ring-border/50">
                <p className="font-medium text-[10px] uppercase tracking-wider mb-1 text-muted-foreground/70">Message:</p>
                {app.message}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
