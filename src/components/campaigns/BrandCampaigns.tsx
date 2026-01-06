"use client";

import { useBrandCampaigns } from "@/hooks/use-campaigns";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreateCampaignModal } from "./CreateCampaignModal";
import { CampaignApplicationsList } from "./CampaignApplicationsList";
import { Loader2, Megaphone, Users, Calendar } from "lucide-react";
import { format } from "date-fns";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";


interface BrandCampaignsProps {
  brandId: string;
}

export function BrandCampaigns({ brandId }: BrandCampaignsProps) {
  const { data: campaigns = [], isLoading: loading, refetch } = useBrandCampaigns(brandId);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Megaphone className="w-6 h-6 text-primary" />
            Your Campaigns
          </h2>
          <p className="text-muted-foreground">Manage your active campaigns and applications.</p>
        </div>
        <CreateCampaignModal brandId={brandId} onCampaignCreated={() => refetch()} />
      </div>

      {campaigns.length === 0 ? (
        <Card className="border-dashed border-2 py-12">
          <CardContent className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Megaphone className="w-8 h-8 text-muted-foreground/50" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No campaigns yet</h3>
            <p className="text-muted-foreground max-w-sm mb-6">
              Launch your first campaign to start receiving applications from top influencers.
            </p>
            <CreateCampaignModal brandId={brandId} onCampaignCreated={() => refetch()} />
          </CardContent>
        </Card>
      ) : (
        <Accordion type="single" collapsible className="space-y-4">
          {campaigns.map((campaign: any) => ( // eslint-disable-line @typescript-eslint/no-explicit-any
            <AccordionItem key={campaign.id} value={campaign.id} className="border bg-card rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <AccordionTrigger className="px-6 py-4 hover:no-underline [&[data-state=open]>div>div>h3]:text-primary animate-in fade-in duration-300">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full pr-4 text-left">
                  <div className="space-y-1">
                    <h3 className="font-bold text-lg transition-colors">{campaign.title}</h3>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1.5 font-medium">
                        <Calendar className="w-3.5 h-3.5" />
                        {format(new Date(campaign.created_at), "MMM d, yyyy")}
                      </span>
                      <Badge variant={campaign.status === "open" ? "brand" : "default"} className="text-[10px] h-4 leading-none font-bold uppercase tracking-wider">
                        {campaign.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6 pt-2 border-t border-border/50 bg-secondary/10">
                <div className="grid md:grid-cols-12 gap-6">
                  <div className="md:col-span-12">
                    <h4 className="text-sm font-semibold mb-3 flex items-center gap-2 text-foreground/80">
                       <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                       Campaign Overview
                    </h4>
                    <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      {campaign.description}
                    </p>
                  </div>
                  
                  <div className="md:col-span-12 border-t border-border/50 pt-6">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="text-sm font-semibold flex items-center gap-2">
                           <Users className="w-4 h-4 text-primary" />
                           Applications
                        </h4>
                    </div>
                    <CampaignApplicationsList campaignId={campaign.id} />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </div>
  );
}
