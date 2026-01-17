"use client";

import { useAuth } from "@/hooks/use-auth";
import { useCollabRequests, useUpdateCollabStatus } from "@/hooks/use-collabs";
import { ChatSheet } from "@/components/collabs/ChatSheet";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Check, X, Clock, Send, Inbox, MessageSquare, Users, User as UserIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";


import { CollabsSkeleton } from "@/components/skeletons";

export default function CollabRequestsPage() {
  const { toast } = useToast();
  const { user, isLoading: authLoading } = useAuth();
  const { data, isLoading: requestsLoading, error: requestsError } = useCollabRequests(user?.id);
  
  const incomingRequests = data?.incoming || [];
  const outgoingRequests = data?.outgoing || [];
  const activeConnections = data?.active || [];
  const loading = authLoading || requestsLoading;
  const currentUserId = user?.id || "";

  const updateStatus = useUpdateCollabStatus();

  const handleStatusUpdate = async (requestId: string, newStatus: "accepted" | "rejected") => {
    if (!user) return;
    updateStatus.mutate({
      requestId,
      status: newStatus,
      userId: user.id
    }, {
      onSuccess: () => {
        toast({
          title: `Request ${newStatus}`,
          description: `You have ${newStatus} the request.`,
        });
      },
      onError: () => {
        toast({
          title: "Error",
          description: "Failed to update request status.",
          variant: "destructive"
        });
      }
    });
  };

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

  if (requestsError) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <div className="text-destructive font-semibold">Failed to load collaboration requests.</div>
        <p className="text-muted-foreground text-sm max-w-md text-center">
            {(requestsError as Error).message || "An unknown error occurred."}
        </p>
        <Button onClick={() => window.location.reload()} variant="outline">
            Retry
        </Button>
      </div>
    );
  }

  if (loading) {
    return <CollabsSkeleton />;
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
                        const isSenderMe = req.sender_id === currentUserId;
                        const partner = isSenderMe ? req.receiver : req.sender;
                        
                        if (!partner) return null;

                        return (
                            <Card key={req.id} className="group overflow-hidden hover:shadow-lg transition-all duration-300 border-border/60 hover:border-primary/30">
                                 <div className="p-5 flex flex-row items-center justify-between gap-4">
                                       <Link href={`/u/${partner.username}`} className="flex items-center gap-4 min-w-0 group/info">
                                           <div className="relative">
                                             <Avatar className="w-12 h-12 sm:w-14 sm:h-14 border-2 border-background shadow-sm ring-1 ring-border/50 group-hover/info:opacity-80 transition-opacity">
                                                 <AvatarImage src={partner.avatar_url || undefined} />
                                                 <AvatarFallback className="bg-muted text-muted-foreground"><UserIcon className="w-6 h-6" /></AvatarFallback>
                                             </Avatar>
                                             <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-background rounded-full"></div>
                                           </div>
                                           <div className="min-w-0">
                                               <h4 className="font-bold text-sm sm:text-base truncate tracking-tight group-hover/info:text-primary transition-colors">{partner.full_name || partner.username || "User"}</h4>
                                               <p className="text-xs text-muted-foreground truncate mb-1.5 group-hover/info:text-primary/70 transition-colors">@{partner.username}</p>
                                               <div className="flex items-center gap-2">
                                                   <Badge variant="default" className="text-[10px] h-5 px-2 font-semibold capitalize bg-primary/5 text-primary border-primary/10">{req.type}</Badge>
                                               </div>
                                           </div>
                                       </Link>
                                      <div className="shrink-0">
                                          <ChatSheet 
                                             partnerId={partner.id} 
                                             partnerName={partner.full_name || partner.username || "User"} 
                                             partnerAvatar={partner.avatar_url || undefined}
                                             trigger={
                                               <Button size="sm" variant="outline" className="h-10 px-4 gap-2 rounded-full border-primary/20 hover:bg-primary/5 hover:text-primary hover:border-primary transition-colors text-xs font-semibold">
                                                  <MessageSquare className="w-4 h-4" />
                                                  <span className="hidden xs:inline">Message</span>
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
                <p className="text-muted-foreground">You haven&apos;t received any new collaboration proposals.</p>
             </div>
          ) : (
            incomingRequests.map((req) => (
              <Card key={req.id} className="overflow-hidden border-border/60 hover:shadow-md transition-all">
                <CardHeader className="pb-4 pt-6 px-6">
                  <div className="flex items-center justify-between gap-4">
                     <Link href={`/u/${req.sender?.username}`} className="flex items-center gap-4 group/sender">
                       <Avatar className="w-12 h-12 border shadow-sm group-hover/sender:opacity-80 transition-opacity">
                         <AvatarImage src={req.sender?.avatar_url || undefined} />
                         <AvatarFallback className="bg-muted text-muted-foreground">{req.sender?.full_name?.charAt(0) || "?"}</AvatarFallback>
                       </Avatar>
                       <div className="min-w-0">
                         <CardTitle className="text-base font-bold truncate group-hover/sender:text-primary transition-colors">
                              {req.sender?.full_name || "Unknown User"}
                         </CardTitle>
                         <CardDescription className="flex items-center gap-2 mt-1 text-xs font-medium">
                           <Badge variant="outline" className="h-5 px-1.5 text-[10px] font-semibold border-primary/20 text-primary capitalize">{req.type}</Badge>
                           <span className="text-muted-foreground/60">•</span>
                           <span className="flex items-center gap-1 text-muted-foreground/80">
                             <Clock className="w-3 h-3 text-muted-foreground/60" />
                             {new Date(req.created_at).toLocaleDateString()}
                           </span>
                         </CardDescription>
                       </div>
                     </Link>
                    <div className="shrink-0">
                      <StatusBadge status={req.status} />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="px-6 pb-6">
                  <div className="bg-muted/40 p-4 rounded-xl text-sm mb-5 border border-border/40 text-muted-foreground italic">
                    <MessageSquare className="w-4 h-4 inline-block mr-2 text-primary/40 not-italic" />
                    &ldquo;{req.message}&rdquo;
                  </div>
                  
                  <div className="flex flex-row gap-3 justify-end">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="rounded-full text-muted-foreground hover:bg-destructive/5 hover:text-destructive text-xs font-semibold h-9 px-5"
                        onClick={() => handleStatusUpdate(req.id, 'rejected')}
                      >
                        <X className="w-3.5 h-3.5 mr-1.5" />
                        Reject
                      </Button>
                      <Button 
                        size="sm" 
                        className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold h-9 px-6 shadow-sm"
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
              <Card key={req.id} className="overflow-hidden border-border/60">
                <CardHeader className="pb-4 pt-6 px-6">
                  <div className="flex items-center justify-between gap-4">
                     <Link href={`/u/${req.receiver?.username}`} className="flex items-center gap-4 group/receiver">
                       <Avatar className="w-12 h-12 border shadow-sm group-hover/receiver:opacity-80 transition-opacity">
                         <AvatarImage src={req.receiver?.avatar_url || undefined} />
                         <AvatarFallback className="bg-muted text-muted-foreground">{req.receiver?.full_name?.charAt(0) || "?"}</AvatarFallback>
                       </Avatar>
                       <div className="min-w-0">
                         <CardTitle className="text-base font-bold truncate group-hover/receiver:text-primary transition-colors">
                           To: {req.receiver?.full_name || "Unknown User"}
                         </CardTitle>
                         <CardDescription className="flex items-center gap-2 mt-1 text-xs font-medium">
                           <Badge variant="outline" className="h-5 px-1.5 text-[10px] font-semibold border-primary/20 text-primary capitalize">{req.type}</Badge>
                           <span className="text-muted-foreground/60">•</span>
                           <span className="flex items-center gap-1 text-muted-foreground/80">
                             <Clock className="w-3 h-3 text-muted-foreground/60" />
                             {new Date(req.created_at).toLocaleDateString()}
                           </span>
                         </CardDescription>
                       </div>
                     </Link>
                    <div className="shrink-0">
                      <StatusBadge status={req.status} />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="px-6 pb-6">
                  <p className="text-sm text-muted-foreground bg-accent/30 p-3 rounded-lg border border-accent-foreground/5 italic">
                     &ldquo;{req.message}&rdquo;
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
