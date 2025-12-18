"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

export function CreateCommunityModal() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const { toast } = useToast();
  const router = useRouter();

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast({
        title: "Name required",
        description: "Please give your community a name.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        toast({
            title: "Authentication required",
            description: "You must be logged in to create a community.",
            variant: "destructive",
        });
        return;
      }

      // 1. Create the community
      const result = await supabase
        .from("communities" as any)
        .insert({
          name: name.trim(),
          description: description.trim(),
          created_by: user.id,
        })
        .select()
        .single();
      
      const community = result.data as any;
      const communityError = result.error;

      if (communityError) throw communityError;

      // 2. Add creator as admin
      const { error: memberError } = await supabase
        .from("community_members" as any)
        .insert({
          community_id: community.id,
          user_id: user.id,
          role: 'admin'
        });

      if (memberError) throw memberError;

      toast({
        title: "Community Created!",
        description: `${name} is now live.`,
      });
      setOpen(false);
      setName("");
      setDescription("");
      router.push(`/dashboard/communities/${community.id}`);
    } catch (error: any) {
      console.error("Error creating community:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create community. Name might already be taken.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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
