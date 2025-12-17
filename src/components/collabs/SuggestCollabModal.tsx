"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Send } from "lucide-react";

interface SuggestCollabModalProps {
  receiverId: string;
  receiverName: string;
  trigger?: React.ReactNode;
}

export function SuggestCollabModal({ receiverId, receiverName, trigger }: SuggestCollabModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [type, setType] = useState<"collab" | "sponsorship">("collab");
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!message.trim()) {
      toast({
        title: "Message required",
        description: "Please explain your proposal.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const senderId = sessionData.session?.user?.id;

      if (!senderId) {
        toast({
            title: "Authentication required",
            description: "You must be logged in to send a request.",
            variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from("collab_requests" as any)
        .insert({
          sender_id: senderId,
          receiver_id: receiverId,
          message: message,
          type: type,
          status: "pending"
        });

      if (error) throw error;

      toast({
        title: "Request Sent!",
        description: `Your ${type} request has been sent to ${receiverName}.`,
      });
      setOpen(false);
      setMessage("");
    } catch (error: any) {
      console.error("Error sending request:", error);
      toast({
        title: "Error",
        description: "Failed to send request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button>Connect</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Propose Collaboration</DialogTitle>
          <DialogDescription>
            Send a proposal to {receiverName}.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label htmlFor="type" className="text-sm font-medium">Type</label>
            <Select value={type} onValueChange={(val: "collab" | "sponsorship") => setType(val)}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="collab">Collaboration</SelectItem>
                <SelectItem value="sponsorship">Sponsorship</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <label htmlFor="message" className="text-sm font-medium">Message</label>
            <Textarea
              id="message"
              placeholder="Hi, I'd like to collaborate with you on..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
            Send Request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
