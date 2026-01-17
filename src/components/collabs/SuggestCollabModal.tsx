"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Send } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Input } from "@/components/ui/input";
import { CollabRequestInsert } from "@/integrations/supabase/types";

interface SuggestCollabModalProps {
  receiverId: string;
  receiverName: string;
  trigger?: React.ReactNode;
  defaultType?: "collab" | "sponsorship";
  title?: string;
  description?: string;
}

export function SuggestCollabModal({ 
  receiverId, 
  receiverName, 
  trigger, 
  defaultType = "collab",
  title = "Propose Collaboration",
  description
}: SuggestCollabModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  const [type, setType] = useState<"collab" | "sponsorship">(defaultType);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const handleSubmit = async () => {
    if (!message.trim()) {
      toast({
        title: "Message required",
        description: "Please explain your proposal.",
        variant: "destructive",
      });
      return;
    }

    if (!user && !contactInfo.trim()) {
      toast({
        title: "Contact info required",
        description: "Please provide your contact information (email or phone) so the creator can reach you.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const senderId = user?.id;

      const insertData: {
        receiver_id: string;
        message: string;
        type: "collab" | "sponsorship";
        status: "pending";
        sender_id: string | null;
      } = {
        receiver_id: receiverId,
        message: user ? message : `[GUEST ENQUIRY]\nContact: ${contactInfo}\n\nMessage:\n${message}`,
        type: type,
        status: "pending",
        sender_id: senderId || null
      };

      const { error } = await supabase
        .from("collab_requests")
        .insert(insertData as unknown as CollabRequestInsert);

      if (error) throw error;

      toast({
        title: "Request Sent!",
        description: `Your ${type} request has been sent to ${receiverName}.`,
      });

      // Invalidate the connection status query to show "Pending"
      if (senderId) {
        queryClient.invalidateQueries({
          queryKey: ["connection-status", senderId, receiverId]
        });
      }

      setOpen(false);
      setMessage("");
      setContactInfo("");
    } catch (err: unknown) {
      const error = err as { message?: string; details?: string; hint?: string; code?: string };
      console.error("Error sending request detail:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      const errorMessage = error.message || "Failed to send request. Please try again.";
      toast({
        title: "Error Sending Request",
        description: errorMessage,
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
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {description || `Send a proposal to ${receiverName}.`}
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
          {!user && (
            <div className="grid gap-2">
              <label htmlFor="contact" className="text-sm font-medium">Your Contact Info</label>
              <Input
                id="contact"
                placeholder="Email or WhatsApp number"
                value={contactInfo}
                onChange={(e) => setContactInfo(e.target.value)}
              />
              <p className="text-[10px] text-muted-foreground">Since you&apos;re not logged in, please provide a way for the creator to reach you.</p>
            </div>
          )}
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
