"use client";

import { useState } from "react";
import { useCreateCampaign } from "@/hooks/use-campaigns";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Plus, Loader2 } from "lucide-react";

interface CreateCampaignModalProps {
  brandId: string;
  onCampaignCreated?: () => void;
}

export function CreateCampaignModal({ brandId, onCampaignCreated }: CreateCampaignModalProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const createMutation = useCreateCampaign();
  const { toast } = useToast();

  const handleCreate = async () => {
    if (!title.trim() || !description.trim()) {
      toast({
        title: "Missing fields",
        description: "Please provide both a title and description.",
        variant: "destructive",
      });
      return;
    }

    createMutation.mutate({ brand_id: brandId, title, description }, {
      onSuccess: () => {
        toast({
          title: "Campaign created!",
          description: "Your campaign is now live and influencers can apply.",
        });
        setTitle("");
        setDescription("");
        setOpen(false);
        if (onCampaignCreated) onCampaignCreated();
      },
      onError: (error: Error) => {
        toast({
          title: "Error",
          description: error.message || "Failed to create campaign.",
          variant: "destructive",
        });
      }
    });
  };

  const loading = createMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Launch New Campaign
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Launch a Campaign</DialogTitle>
          <DialogDescription>
            Create a campaign to find the best influencers for your brand.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Campaign Title</Label>
            <Input
              id="title"
              placeholder="e.g. Summer Collection 2024"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe what you're looking for, goals, and requirements..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[150px]"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Launching...
              </>
            ) : (
              "Launch Campaign"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
