"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Check, X, Clock, Send, Inbox, MessageSquare, Users, UserIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { ChatSheet } from "@/components/collabs/ChatSheet";

interface Request {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: "pending" | "accepted" | "rejected" | "completed";
  type: "collab" | "sponsorship";
  message: string;
  created_at: string;
  sender?: {
    id: string;
    username: string;
    full_name: string;
    avatar_url: string;
  };
  receiver?: {
    id: string;
    username: string;
    full_name: string;
    avatar_url: string;
  };
}

export default function CollabRequestsPage() {
  const [incomingRequests, setIncomingRequests] = useState<Request[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<Request[]>([]);
  const [activeConnections, setActiveConnections] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [currentUserId, setCurrentUserId] = useState<string>("");

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) return;
      setCurrentUserId(user.id);

      // 1. Fetch raw requests (no joins) to avoid FK errors
      const { data: inc, error: incError } = await supabase
          .from("collab_requests" as any)
          .select("*")
          .eq("receiver_id", user.id)
          .order("created_at", { ascending: false });

      if (incError) console.error("Error fetching incoming:", incError);
          
      const { data: out, error: outError } = await supabase
          .from("collab_requests" as any)
          .select("*")
          .eq("sender_id", user.id)
          .order("created_at", { ascending: false });

      if (outError) console.error("Error fetching outgoing:", outError);

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
            
          if (profilesError) console.error("Error fetching profiles:", profilesError);
            
          profiles?.forEach(p => {
              profilesMap[p.id] = p;
          });
      }

      // 3. Process requests
      const incoming = inc?.map((r: any) => ({ ...r, sender: profilesMap[r.sender_id] })) || [];
      const outgoing = out?.map((r: any) => ({ ...r, receiver: profilesMap[r.receiver_id] })) || [];

      setIncomingRequests(incoming.filter((r: Request) => r.status === 'pending'));
      setOutgoingRequests(outgoing.filter((r: Request) => r.status === 'pending'));

      // Filter for accepted/active connections
      // A connection is any request where status is 'accepted'
      const activeInc = incoming.filter((r: Request) => r.status === 'accepted');
      const activeOut = outgoing.filter((r: Request) => r.status === 'accepted');
      setActiveConnections([...activeInc, ...activeOut]);

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
      pending: "bg-yellow-100 text-yellow-800",
      accepted: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
      completed: "bg-blue-100 text-blue-800",
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
      <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between mb-8 gap-4 text-center sm:text-left">
        <div>
           <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Collaboration Manager</h1>
           <p className="text-sm sm:text-base text-muted-foreground mt-2">Manage requests and chat with your connections.</p>
        </div>
      </div>

      <Tabs defaultValue="connections" className="w-full">
        <TabsList className="mb-8 w-full h-auto flex-wrap sm:flex-nowrap p-1 bg-muted/50 border">
          <TabsTrigger value="connections" className="gap-2 flex-1 py-2 text-xs sm:text-sm">
            <Users className="w-4 h-4 hidden xs:block" />
            <span>Connections ({activeConnections.length})</span>
          </TabsTrigger>
          <TabsTrigger value="incoming" className="gap-2 flex-1 py-2 text-xs sm:text-sm relative">
             <Inbox className="w-4 h-4 hidden xs:block" />
             <span>Incoming</span>
             {incomingRequests.length > 0 && <span className="ml-1 bg-primary text-primary-foreground text-[10px] rounded-full px-1.5 h-4 flex items-center justify-center min-w-[18px]">{incomingRequests.length}</span>}
          </TabsTrigger>
          <TabsTrigger value="outgoing" className="gap-2 flex-1 py-2 text-xs sm:text-sm">
             <Send className="w-4 h-4 hidden xs:block" />
             <span>Sent</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="connections" className="space-y-4">
           {activeConnections.length === 0 ? (
             <div className="text-center py-16 border rounded-lg bg-muted/10">
                <Users className="w-16 h-16 mx-auto text-muted-foreground mb-4 opacity-20" />
                <h3 className="text-lg font-medium">No active connections</h3>
                <p className="text-muted-foreground max-w-sm mx-auto mt-2">
                   When you accept a request or your request is accepted, the person will appear here.
                </p>
                <Button variant="outline" asChild className="mt-6">
                   <Link href="/dashboard/search">Find people</Link>
                </Button>
             </div>
           ) : (
                <div className="grid md:grid-cols-2 gap-4">
                    {activeConnections.map((req) => {
                        // Determine who the "other" person is
                        const isSenderMe = req.sender_id === currentUserId;
                        const partner = isSenderMe ? req.receiver : req.sender;
                        
                        // Fallback if profile logic failed (shouldn't if IDs are valid)
                        if (!partner) return null;

                        return (
                            <Card key={req.id} className="flex flex-col xs:flex-row overflow-hidden hover:shadow-md transition-shadow">
                                 <div className="w-full h-1 xs:w-1 xs:h-auto bg-green-500/50"></div>
                                 <div className="flex-1 p-4 flex flex-row items-center justify-between gap-4">
                                      <div className="flex items-center gap-3 sm:gap-4 overflow-hidden">
                                          <Avatar className="w-10 h-10 sm:w-12 sm:h-12 border shadow-sm shrink-0">
                                              <AvatarImage src={partner.avatar_url} />
                                              <AvatarFallback><UserIcon className="w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground" /></AvatarFallback>
                                          </Avatar>
                                          <div className="min-w-0 transition-all">
                                              <h4 className="font-semibold text-sm sm:text-base truncate">{partner.full_name || partner.username || "User"}</h4>
                                              <p className="text-[10px] sm:text-xs text-muted-foreground truncate">@{partner.username}</p>
                                              <div className="flex items-center gap-2 mt-1 shrink-0">
                                                  <Badge variant="secondary" className="text-[9px] sm:text-[10px] h-4 sm:h-5 px-1 sm:px-1.5 font-medium">{req.type}</Badge>
                                              </div>
                                          </div>
                                      </div>
                                      <div className="shrink-0">
                                          <ChatSheet 
                                             partnerId={partner.id} 
                                             partnerName={partner.full_name || partner.username || "User"} 
                                             partnerAvatar={partner.avatar_url}
                                             trigger={
                                               <Button size="sm" variant="ghost" className="h-9 w-9 p-0 sm:w-auto sm:px-3 sm:gap-2 text-primary hover:text-primary hover:bg-primary/10">
                                                  <MessageSquare className="w-5 h-5" />
                                                  <span className="hidden sm:inline text-xs font-semibold">Message</span>
                                               </Button>
                                             }
                                          />
                                      </div>
                                 </div>
                            </Card>
                        );
                    })}
                </div>
           )}
        </TabsContent>

        <TabsContent value="incoming" className="space-y-4">
          {incomingRequests.length === 0 ? (
             <div className="text-center py-12 border rounded-lg bg-muted/10">
                <Inbox className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-20" />
                <h3 className="text-lg font-medium">No incoming requests</h3>
                <p className="text-muted-foreground">You haven't received any new collaboration proposals.</p>
             </div>
          ) : (
            incomingRequests.map((req) => (
              <Card key={req.id} className="overflow-hidden">
                <CardHeader className="pb-3 px-4 sm:px-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <Avatar className="w-10 h-10 border shadow-sm">
                        <AvatarImage src={req.sender?.avatar_url} />
                        <AvatarFallback>{req.sender?.full_name?.charAt(0) || "?"}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <CardTitle className="text-base truncate">
                          <Link href={`/u/${req.sender?.username}`} className="hover:underline">
                             {req.sender?.full_name || "Unknown User"}
                          </Link>
                        </CardTitle>
                        <CardDescription className="flex items-center gap-1 mt-0.5 text-xs">
                          <Clock className="w-3 h-3" />
                          {new Date(req.created_at).toLocaleDateString()}
                          <span className="mx-1">•</span>
                          <span className="capitalize">{req.type}</span>
                        </CardDescription>
                      </div>
                    </div>
                    <div className="self-end sm:self-center">
                      <StatusBadge status={req.status} />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted/30 p-4 rounded-md text-sm mb-4 border border-border/50">
                    <MessageSquare className="w-4 h-4 inline-block mr-2 text-muted-foreground" />
                    {req.message}
                  </div>
                  
                  <div className="flex flex-row gap-2 justify-center sm:justify-end">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 sm:flex-none text-destructive hover:bg-destructive/10 hover:text-destructive text-xs h-9"
                        onClick={() => handleStatusUpdate(req.id, 'rejected')}
                      >
                        <X className="w-3.5 h-3.5 mr-1.5" />
                        Reject
                      </Button>
                      <Button 
                        size="sm" 
                        className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700 text-xs h-9"
                        onClick={() => handleStatusUpdate(req.id, 'accepted')}
                      >
                        <Check className="w-3.5 h-3.5 mr-1.5" />
                        Accept
                      </Button>
                    </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="outgoing" className="space-y-4">
          {outgoingRequests.length === 0 ? (
             <div className="text-center py-12 border rounded-lg bg-muted/10">
                <Send className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-20" />
                <h3 className="text-lg font-medium">No pending sent requests</h3>
                <p className="text-muted-foreground">Your request history (pending) appears here.</p>
                <Button variant="link" asChild className="mt-2">
                   <Link href="/dashboard/search">Find people</Link>
                </Button>
             </div>
          ) : (
            outgoingRequests.map((req) => (
              <Card key={req.id}>
                <CardHeader className="pb-3 px-4 sm:px-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <Avatar className="w-10 h-10 border shadow-sm">
                        <AvatarImage src={req.receiver?.avatar_url} />
                        <AvatarFallback>{req.receiver?.full_name?.charAt(0) || "?"}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <CardTitle className="text-base truncate">
                          To: <Link href={`/u/${req.receiver?.username}`} className="hover:underline">
                             {req.receiver?.full_name || "Unknown User"}
                          </Link>
                        </CardTitle>
                        <CardDescription className="flex items-center gap-1 mt-0.5 text-xs">
                          <span className="capitalize">{req.type} request</span>
                          <span className="mx-1">•</span>
                          <span className="flex items-center gap-1">
                             <Clock className="w-3 h-3" />
                             {new Date(req.created_at).toLocaleDateString()}
                          </span>
                        </CardDescription>
                      </div>
                    </div>
                    <div className="self-end sm:self-center">
                      <StatusBadge status={req.status} />
                    </div>
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
