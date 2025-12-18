"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ApplyToCampaignModal } from "./ApplyToCampaignModal";
import { MyApplications } from "./MyApplications";
import { Loader2, Megaphone, Search, Building2, Calendar, MessageSquare, ListFilter, LayoutGrid } from "lucide-react";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Campaign {
  id: string;
  title: string;
  description: string;
  status: string;
  created_at: string;
  brand_id: string;
  brand: {
    username: string;
    full_name: string;
    avatar_url: string;
  };
}

interface InfluencerCampaignsProps {
  influencerId: string;
}

export function InfluencerCampaigns({ influencerId }: InfluencerCampaignsProps) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [applications, setApplications] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchData = async () => {
    try {
      // Fetch open campaigns
      const { data: campaignData, error: campaignError } = await (supabase as any)
        .from("campaigns")
        .select(`
          *,
          brand:profiles(username, full_name, avatar_url)
        `)
        .eq("status", "open")
        .order("created_at", { ascending: false });

      if (campaignError) throw campaignError;
      setCampaigns(campaignData || []);

      // Fetch user's existing applications
      const { data: appData, error: appError } = await (supabase as any)
        .from("campaign_applications")
        .select("campaign_id")
        .eq("influencer_id", influencerId);

      if (appError) throw appError;
      setApplications(appData?.map((a: any) => a.campaign_id) || []);
    } catch (error: any) {
      console.error("Error fetching data:", error.message || error);
      if (error.details) console.error("Error details:", error.details);
      if (error.hint) console.error("Error hint:", error.hint);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [influencerId]);

  const filteredCampaigns = campaigns.filter(c => 
    c.title.toLowerCase().includes(search.toLowerCase()) || 
    c.description.toLowerCase().includes(search.toLowerCase()) ||
    c.brand?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    c.brand?.username?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Megaphone className="w-6 h-6 text-primary" />
            Brand Campaigns
          </h2>
          <p className="text-muted-foreground">Find and track your collaboration opportunities.</p>
        </div>
      </div>

      <Tabs defaultValue="explore" className="space-y-6">
        <TabsList className="bg-background/50 border border-border/50 p-1">
          <TabsTrigger value="explore" className="gap-2 px-4">
            <LayoutGrid className="w-4 h-4" />
            Explore
          </TabsTrigger>
          <TabsTrigger value="applied" className="gap-2 px-4">
            <ListFilter className="w-4 h-4" />
            My Applications
            {applications.length > 0 && (
              <Badge variant="brand" className="ml-1 h-4 w-4 p-0 flex items-center justify-center text-[10px]">
                {applications.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="explore" className="space-y-6 animate-in fade-in-50 duration-500">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search campaigns..." 
              className="pl-9 h-10" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {filteredCampaigns.length === 0 ? (
            <Card className="border-dashed border-2 py-12">
              <CardContent className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                  <Search className="w-8 h-8 text-muted-foreground/50" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No campaigns found</h3>
                <p className="text-muted-foreground max-w-sm">
                  {search ? "Try a different search term or check back later." : "There are currently no open campaigns. Check back soon!"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {filteredCampaigns.map((campaign) => (
                <Card key={campaign.id} className="flex flex-col border-border/50 hover:shadow-lg transition-all duration-300 group">
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center">
                          <Building2 className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold leading-none">{campaign.brand?.full_name || campaign.brand?.username}</h4>
                          <p className="text-[10px] text-muted-foreground mt-1">@{campaign.brand?.username}</p>
                        </div>
                      </div>
                      <Badge variant="brand" className="text-[10px] h-5 leading-none px-1.5 font-bold uppercase tracking-wider">
                        {format(new Date(campaign.created_at), "MMM d")}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg group-hover:text-primary transition-colors">{campaign.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                      {campaign.description}
                    </p>
                  </CardContent>
                  <CardFooter className="pt-4 border-t border-border/50 flex justify-between items-center bg-secondary/5">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                       <Calendar className="w-3.5 h-3.5" />
                       Posted {format(new Date(campaign.created_at), "MMM d")}
                    </div>
                    <ApplyToCampaignModal 
                      campaignId={campaign.id} 
                      influencerId={influencerId} 
                      campaignTitle={campaign.title}
                      applied={applications.includes(campaign.id)}
                      onApplied={() => setApplications([...applications, campaign.id])}
                    />
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="applied" className="animate-in fade-in-50 duration-500">
          <MyApplications influencerId={influencerId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
