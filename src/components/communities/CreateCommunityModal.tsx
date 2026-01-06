"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useCreateCommunity } from "@/hooks/use-community";

export function CreateCommunityModal() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const { toast } = useToast();
  const router = useRouter();
  const { user } = useAuth();
  const createMutation = useCreateCommunity();

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast({
        title: "Name required",
        description: "Please give your community a name.",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to create a community.",
        variant: "destructive",
      });
      return;
    }

    createMutation.mutate({
      name: name.trim(),
      description: description.trim(),
      userId: user.id
    }, {
      onSuccess: (community: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
        toast({
          title: "Community Created!",
          description: `${name} is now live.`,
        });
        setOpen(false);
        setName("");
        setDescription("");
        router.push(`/dashboard/communities/${community.id}`);
      },
      onError: (error: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
        console.error("Error creating community:", error);
        toast({
          title: "Error",
          description: error.message || "Failed to create community. Name might already be taken.",
          variant: "destructive",
        });
      }
    });
  };

  const loading = createMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Create Community
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create a Community</DialogTitle>
          <DialogDescription>
            Build a space for your audience and fellow creators.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label htmlFor="name" className="text-sm font-medium">Community Name</label>
            <Input
                id="name"
                placeholder="e.g. Tech Enthusiasts"
                value={name}
                onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <label htmlFor="description" className="text-sm font-medium">Description</label>
            <Textarea
              id="description"
              placeholder="What is this community about?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
