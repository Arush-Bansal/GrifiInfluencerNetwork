"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Check, X, Clock, Send, Inbox, MessageSquare } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";

interface Request {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: "pending" | "accepted" | "rejected" | "completed";
  type: "collab" | "sponsorship";
  message: string;
  created_at: string;
  sender?: {
    username: string;
    full_name: string;
    avatar_url: string;
  };
  receiver?: {
    username: string;
    full_name: string;
    avatar_url: string;
  };
}

export default function CollabRequestsPage() {
  const [incomingRequests, setIncomingRequests] = useState<Request[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) return;

      // 1. Fetch raw requests (no joins) to avoid FK errors
      const { data: inc, error: incError } = await supabase
          .from("collab_requests" as any)
          .select("*")
          .eq("receiver_id", user.id)
          .order("created_at", { ascending: false });

      if (incError) {
        console.error("Error fetching incoming:", incError);
        // Don't throw immediately, try to fetch others
      }
          
      const { data: out, error: outError } = await supabase
          .from("collab_requests" as any)
          .select("*")
          .eq("sender_id", user.id)
          .order("created_at", { ascending: false });

      if (outError) {
        console.error("Error fetching outgoing:", outError);
      }

      // 2. Identify all unique user IDs to fetch profiles for
      const userIds = new Set<string>();
      inc?.forEach((r: any) => userIds.add(r.sender_id));
      out?.forEach((r: any) => userIds.add(r.receiver_id));
      
      let profilesMap: Record<string, any> = {};
      if (userIds.size > 0) {
          const { data: profiles, error: profilesError } = await supabase
            .from("profiles")
            .select("id, username, full_name, avatar_url")
            .in("id", Array.from(userIds));
            
          if (profilesError) {
             console.error("Error fetching profiles:", profilesError);
          }
            
          profiles?.forEach(p => {
              profilesMap[p.id] = p;
          });
      }

      // 3. Attach profile data to requests
      setIncomingRequests(inc?.map((r: any) => ({ ...r, sender: profilesMap[r.sender_id] })) || []);
      setOutgoingRequests(out?.map((r: any) => ({ ...r, receiver: profilesMap[r.receiver_id] })) || []);

    } catch (error) {
      console.error("Error fetching requests:", error);
      toast({
        title: "Error loading requests",
        description: "Please check your network connection.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (requestId: string, newStatus: "accepted" | "rejected") => {
    try {
        const { error } = await supabase
            .from("collab_requests" as any)
            .update({ status: newStatus })
            .eq("id", requestId);
            
        if (error) throw error;
        
        toast({
            title: `Request ${newStatus}`,
            description: `You have ${newStatus} the request.`,
        });
        
        fetchRequests(); // Refresh
    } catch (error) {
        toast({
            title: "Error",
            description: "Failed to update request status.",
            variant: "destructive"
        });
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const StatusBadge = ({ status }: { status: string }) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
      accepted: "bg-green-100 text-green-800 hover:bg-green-100",
      rejected: "bg-red-100 text-red-800 hover:bg-red-100",
      completed: "bg-blue-100 text-blue-800 hover:bg-blue-100",
    };
    return (
      <Badge className={styles[status as keyof typeof styles] || ""} variant="outline">
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div>
           <h1 className="text-3xl font-bold tracking-tight">Collaboration Requests</h1>
           <p className="text-muted-foreground mt-2">Manage your incoming and outgoing proposals.</p>
        </div>
      </div>

      <Tabs defaultValue="incoming" className="w-full">
        <TabsList className="mb-8">
          <TabsTrigger value="incoming" className="gap-2">
             <Inbox className="w-4 h-4" />
             Incoming ({incomingRequests.filter(r => r.status === 'pending').length})
          </TabsTrigger>
          <TabsTrigger value="outgoing" className="gap-2">
             <Send className="w-4 h-4" />
             Sent
          </TabsTrigger>
        </TabsList>

        <TabsContent value="incoming" className="space-y-4">
          {incomingRequests.length === 0 ? (
             <div className="text-center py-12 border rounded-lg bg-muted/10">
                <Inbox className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-20" />
                <h3 className="text-lg font-medium">No incoming requests</h3>
                <p className="text-muted-foreground">You haven't received any collaboration proposals yet.</p>
             </div>
          ) : (
            incomingRequests.map((req) => (
              <Card key={req.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={req.sender?.avatar_url} />
                        <AvatarFallback>{req.sender?.full_name?.charAt(0) || "?"}</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-base">
                          <Link href={`/u/${req.sender?.username}`} className="hover:underline">
                             {req.sender?.full_name || "Unknown User"}
                          </Link>
                          <span className="font-normal text-muted-foreground text-sm ml-2">
                             requests a {req.type}
                          </span>
                        </CardTitle>
                        <CardDescription className="flex items-center gap-1 mt-1">
                          <Clock className="w-3 h-3" />
                          {new Date(req.created_at).toLocaleDateString()}
                        </CardDescription>
                      </div>
                    </div>
                    <StatusBadge status={req.status} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted/30 p-4 rounded-md text-sm mb-4 border border-border/50">
                    <MessageSquare className="w-4 h-4 inline-block mr-2 text-muted-foreground" />
                    {req.message}
                  </div>
                  
                  {req.status === 'pending' && (
                    <div className="flex gap-2 justify-end">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => handleStatusUpdate(req.id, 'rejected')}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Reject
                      </Button>
                      <Button 
                        size="sm" 
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => handleStatusUpdate(req.id, 'accepted')}
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Accept
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="outgoing" className="space-y-4">
          {outgoingRequests.length === 0 ? (
             <div className="text-center py-12 border rounded-lg bg-muted/10">
                <Send className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-20" />
                <h3 className="text-lg font-medium">No sent requests</h3>
                <p className="text-muted-foreground">You haven't sent any collaboration proposals yet.</p>
                <Button variant="link" asChild className="mt-2">
                   <Link href="/dashboard/search">Find people to collaborate with</Link>
                </Button>
             </div>
          ) : (
            outgoingRequests.map((req) => (
              <Card key={req.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={req.receiver?.avatar_url} />
                        <AvatarFallback>{req.receiver?.full_name?.charAt(0) || "?"}</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-base">
                          To: <Link href={`/u/${req.receiver?.username}`} className="hover:underline">
                             {req.receiver?.full_name || "Unknown User"}
                          </Link>
                        </CardTitle>
                        <CardDescription className="flex items-center gap-1 mt-1">
                          <span className="capitalize">{req.type} request</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                             <Clock className="w-3 h-3" />
                             {new Date(req.created_at).toLocaleDateString()}
                          </span>
                        </CardDescription>
                      </div>
                    </div>
                    <StatusBadge status={req.status} />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground border-l-2 border-primary/20 pl-4 py-1">
                     {req.message}
                  </p>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
