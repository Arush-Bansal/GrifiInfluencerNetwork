"use client";

import { useAuth } from "@/hooks/use-auth";
import { useCollabRequests } from "@/hooks/use-collabs";
import { Button } from "@/components/ui/button";
import { useMemo, useState, useEffect, useRef } from "react";
import { CollabSidebar } from "@/components/collabs/CollabSidebar";
import { CollabDetails } from "@/components/collabs/CollabDetails";
import { ArrowLeft, MessageSquare } from "lucide-react";
import { CollabsSkeleton } from "@/components/skeletons";

interface Profile {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
}

interface CollabRequest {
  id: string;
  sender_id: string | null;
  receiver_id: string;
  status: string;
  type: string;
  message: string | null;
  created_at: string;
  sender?: Profile;
  receiver?: Profile;
}

export default function CollabRequestsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { data, isLoading: requestsLoading, error: requestsError } = useCollabRequests(user?.id);
  const [selectedRequest, setSelectedRequest] = useState<CollabRequest | null>(null);
  const hasAutoSelected = useRef(false);
  
  const incomingRequests = useMemo(() => data?.incoming || [], [data?.incoming]);
  const outgoingRequests = useMemo(() => data?.outgoing || [], [data?.outgoing]);
  const activeConnections = useMemo(() => data?.active || [], [data?.active]);
  const loading = authLoading || requestsLoading;
  const currentUserId = user?.id || "";

  // Auto-select first active connection or request if none selected and on desktop
  useEffect(() => {
    if (loading || selectedRequest || hasAutoSelected.current) return;
    
    const firstOption = activeConnections[0] || incomingRequests[0];
    if (firstOption) {
      hasAutoSelected.current = true;
      // Defer to avoid cascading render warning while allowing auto-selection
      setTimeout(() => setSelectedRequest(firstOption), 0);
    }
  }, [loading, selectedRequest, activeConnections, incomingRequests]);

  if (requestsError) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 gap-4">
        <div className="text-destructive font-bold text-lg">Failed to load collaborations</div>
        <p className="text-muted-foreground text-sm max-w-md text-center">
            {(requestsError as Error).message || "An unknown error occurred."}
        </p>
        <Button onClick={() => window.location.reload()} variant="outline" className="rounded-full px-8">
            Retry Connection
        </Button>
      </div>
    );
  }

  if (loading) {
    return <CollabsSkeleton />;
  }

  return (
    <div className="flex h-full lg:h-[calc(100vh-2rem)] bg-white border border-slate-200 sm:rounded-xl shadow-sm overflow-hidden min-h-[600px]">
      {/* Sidebar - Hidden on mobile if a request is selected */}
      <div className={`
        w-full md:w-80 lg:w-[380px] shrink-0 border-r border-slate-100 flex-col
        ${selectedRequest ? "hidden md:flex" : "flex"}
      `}>
        <CollabSidebar 
            incoming={incomingRequests}
            outgoing={outgoingRequests}
            active={activeConnections}
            selectedId={selectedRequest?.id}
            onSelect={setSelectedRequest}
            currentUserId={currentUserId}
        />
      </div>

      {/* Details Area - Full screen on mobile if a request is selected */}
      <div className={`
        flex-1 flex-col relative bg-white
        ${selectedRequest ? "flex" : "hidden md:flex"}
      `}>
        {selectedRequest ? (
          <div className="flex flex-col h-full bg-white overflow-hidden">
            {/* Mobile Back Button */}
            <div className="md:hidden p-4 border-b border-slate-100 flex items-center bg-white sticky top-0 z-10 shrink-0">
               <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSelectedRequest(null)}
                className="gap-2 -ml-2 text-slate-500 font-semibold"
               >
                 <ArrowLeft className="h-4 w-4" />
                 Back to List
               </Button>
            </div>
            
            <div className="flex-1 overflow-hidden">
                <CollabDetails 
                    request={selectedRequest}
                    currentUserId={currentUserId}
                />
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-slate-50/30">
             <div className="p-8 bg-white border border-slate-100 rounded-3xl shadow-sm mb-6 opacity-80">
                <MessageSquare className="w-10 h-10 text-slate-300" />
             </div>
             <h3 className="text-xl font-bold text-slate-900 mb-2">Network Workspace</h3>
             <p className="text-slate-500 max-w-sm leading-relaxed text-sm">
                Connect with creators and brands in your network. Select a connection from the list to view details and start collaborating.
             </p>
          </div>
        )}
      </div>
    </div>
  );
}
