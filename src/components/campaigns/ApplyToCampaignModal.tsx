"use client";

import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Send, Loader2 } from "lucide-react";

interface ApplyToCampaignModalProps {
  campaignId: string;
  influencerId: string;
  campaignTitle: string;
  onApplied?: () => void;
  applied?: boolean;
}

export function ApplyToCampaignModal({ 
  campaignId, 
  influencerId, 
  campaignTitle, 
  onApplied, 
  applied = false 
}: ApplyToCampaignModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const { toast } = useToast();

  const handleApply = async () => {
    if (!message.trim()) {
      toast({
        title: "Message required",
        description: "Please tell the brand why you're a good fit.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from("campaign_applications").insert({
        campaign_id: campaignId,
        influencer_id: influencerId,
        message: message.trim(),
        status: "pending",
      });

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
           throw new Error("You have already applied to this campaign.");
        }
        throw error;
      }

      toast({
        title: "Application sent!",
        description: `Your application for "${campaignTitle}" has been sent.`,
      });

      setMessage("");
      setOpen(false);
      if (onApplied) onApplied();
    } catch (error: any) {
      console.error("Error applying to campaign:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to send application.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button disabled={applied} variant={applied ? "outline" : "default"} size="sm">
          {applied ? "Applied" : "Apply Now"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Apply for Campaign</DialogTitle>
          <DialogDescription>
            Applying for: <span className="font-semibold text-foreground">{campaignTitle}</span>
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="message">Pitch to Brand</Label>
            <Textarea
              id="message"
              placeholder="Explain why you're the perfect fit for this campaign, your relevant stats, or previous work..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[150px]"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleApply} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Send Application
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
