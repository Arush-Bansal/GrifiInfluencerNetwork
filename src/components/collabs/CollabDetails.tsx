"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, User as UserIcon, Mail, Phone, ExternalLink, ShieldCheck } from "lucide-react";
import { ChatContent } from "./ChatSheet";
import { useUpdateCollabStatus } from "@/hooks/use-collabs";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

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

interface CollabDetailsProps {
  request: CollabRequest;
  currentUserId: string;
}

export function CollabDetails({ request, currentUserId }: CollabDetailsProps) {
  const { toast } = useToast();
  const updateStatus = useUpdateCollabStatus();
  const isSenderMe = request.sender_id === currentUserId;
  const partner = isSenderMe ? request.receiver : request.sender;
  const isPending = request.status === "pending";
  const isAccepted = request.status === "accepted";
  const isRejected = request.status === "rejected";
  
  // Guest inquiry logic
  const isGuest = !request.sender_id && !isSenderMe;
  let guestContact = "";
  let cleanMessage = request.message || "";

  if (isGuest && request.message?.startsWith("[GUEST ENQUIRY]")) {
    const contactMatch = request.message.match(/Contact: (.*)\n/);
    if (contactMatch) {
      guestContact = contactMatch[1];
      cleanMessage = request.message.split("Message:\n")[1] || request.message;
    }
  }

  const handleStatusUpdate = async (newStatus: "accepted" | "rejected") => {
    updateStatus.mutate({
      requestId: request.id,
      status: newStatus,
      userId: currentUserId
    }, {
      onSuccess: () => {
        toast({
          title: `Request ${newStatus}`,
          description: `You have ${newStatus} the request.`,
        });
      }
    });
  };

  if (!partner && !isGuest) return <div className="p-8 text-center text-muted-foreground">Select a collaboration to view details.</div>;

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden">
      {/* Header */}
      <div className="p-4 md:p-8 border-b border-slate-100 flex flex-col sm:flex-row items-start justify-between gap-4 md:gap-6 bg-white/80 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-3 md:gap-5 w-full sm:w-auto min-w-0">
          <div className="relative shrink-0">
            <Avatar className="h-12 w-12 md:h-16 md:w-16 border border-slate-200 shadow-none">
              <AvatarImage src={partner?.avatar_url || undefined} />
              <AvatarFallback className="bg-slate-100 text-slate-500 text-lg font-medium">
                {isGuest ? "G" : (partner?.full_name?.charAt(0) || "?")}
              </AvatarFallback>
            </Avatar>
            {isGuest && (
              <div className="absolute -top-1 -right-1 bg-white rounded-full p-1 border border-slate-200 shadow-sm" title="Guest User">
                 <ShieldCheck className="h-4 w-4 text-slate-400" />
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
             <div className="flex items-center gap-2 md:gap-3 flex-wrap mb-0.5">
                <h2 className="text-lg md:text-2xl font-bold tracking-tight text-slate-900 leading-tight truncate">
                   {isGuest ? "Guest Inquiry" : (partner?.full_name || partner?.username || "Network Member")}
                </h2>
                {!isGuest && partner && (
                   <Link href={`/u/${partner.username}`} target="_blank" className="text-slate-400 hover:text-indigo-600 transition-colors shrink-0">
                      <ExternalLink className="h-3.5 w-3.5 md:h-4 md:w-4" />
                   </Link>
                )}
                {isGuest && <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200 font-medium px-1.5 md:px-2 py-0 text-[10px] md:text-xs">Public</Badge>}
             </div>
             {!isGuest && partner && <p className="text-sm font-medium text-slate-500 truncate">@{partner.username}</p>}
             {isGuest && guestContact && (
                <div className="flex items-center gap-2 mt-2 text-xs font-medium text-slate-500">
                   {guestContact.includes('@') ? <Mail className="h-3.5 w-3.5 text-slate-400" /> : <Phone className="h-3.5 w-3.5 text-slate-400" />}
                   <span className="tracking-wide select-all truncate">{guestContact}</span>
                </div>
             )}
          </div>
        </div>

        <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start w-full sm:w-auto gap-3 shrink-0">
            <div className="flex items-center gap-2">
                <Badge variant="outline" className="px-2 py-0.5 font-semibold uppercase tracking-wider text-[9px] md:text-[10px] border-slate-200 text-slate-500 bg-slate-50/50">
                   {request.type}
                </Badge>
                <Badge className={`
                    px-2 py-0.5 font-semibold text-[9px] md:text-[10px] uppercase tracking-wider
                    ${request.status === 'accepted' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                      request.status === 'rejected' ? 'bg-rose-50 text-rose-700 border-rose-100' :
                      'bg-slate-100 text-slate-600 border-slate-200'}
                `} variant="outline">
                    {request.status}
                </Badge>
            </div>
            <span className="text-[9px] md:text-[10px] uppercase font-bold tracking-widest text-slate-400">
                {new Date(request.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto bg-white p-4 md:p-8 custom-scrollbar">
        <div className="max-w-3xl mx-auto space-y-8 md:space-y-12 pb-12">
            
            {/* Initial Pitch */}
            <section className="space-y-4">
                <h3 className="text-xs uppercase font-bold tracking-[0.2em] text-slate-400 px-1">
                   Inquiry Details
                </h3>
                <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-6 relative overflow-hidden">
                   <div className="absolute top-0 left-0 bottom-0 w-1 bg-slate-200" />
                   <p className="text-base leading-relaxed text-slate-600 italic font-medium pl-2">
                      &ldquo;{cleanMessage}&rdquo;
                   </p>
                </div>
            </section>

            {/* Actions for Pending */}
            {!isSenderMe && isPending && (
                <section className="border border-slate-200 rounded-2xl p-6 md:p-8 flex flex-col items-center text-center gap-6 bg-white shadow-none ring-1 ring-slate-100/50">
                   <div className="p-4 bg-slate-50 rounded-full border border-slate-100">
                      <Clock className="w-8 h-8 text-slate-400" />
                   </div>
                   <div className="max-w-md space-y-2">
                      <h4 className="font-bold text-xl text-slate-900">Collaboration Proposal</h4>
                      <p className="text-sm text-slate-500 leading-relaxed">Review the details above before making a decision. Accepting this request will establish a direct connection and open a private workspace.</p>
                   </div>
                   <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                      <Button 
                         variant="outline" 
                         className="flex-1 sm:px-10 border-slate-200 hover:bg-slate-50 hover:text-rose-600 h-11 font-semibold transition-all px-8"
                         onClick={() => handleStatusUpdate('rejected')}
                         disabled={updateStatus.isPending}
                      >
                         Decline
                      </Button>
                      <Button 
                         className="flex-1 sm:px-14 bg-indigo-600 hover:bg-indigo-700 text-white h-11 font-semibold shadow-sm px-8"
                         onClick={() => handleStatusUpdate('accepted')}
                         disabled={updateStatus.isPending}
                      >
                         Establish Connection
                      </Button>
                   </div>
                </section>
            )}

            {/* Chat Section for Accepted */}
            {!isGuest && isAccepted && (
                <section className="space-y-4">
                    <h3 className="text-xs uppercase font-bold tracking-[0.2em] text-slate-400 px-1">
                       Workspace Chat
                    </h3>
                    <div className="h-[400px] md:h-[500px] border border-slate-200 rounded-2xl bg-white overflow-hidden ring-1 ring-slate-50 shadow-none">
                        {partner && (
                            <ChatContent 
                                partnerId={partner.id}
                                partnerName={partner.full_name || partner.username || "Member"}
                                partnerAvatar={partner.avatar_url || undefined}
                                embedded={true}
                            />
                        )}
                    </div>
                </section>
            )}

            {/* Guest Actions */}
            {isGuest && (
                <section className="border border-slate-200 rounded-2xl p-6 md:p-8 flex flex-col items-center text-center gap-6 bg-white shadow-none ring-1 ring-slate-100/50">
                   <div className="p-4 bg-slate-50 rounded-full border border-slate-100">
                      <UserIcon className="w-8 h-8 text-slate-400" />
                   </div>
                   <div className="max-w-md space-y-2">
                      <h4 className="font-bold text-xl text-slate-900">Public Interaction</h4>
                      <p className="text-sm text-slate-500 leading-relaxed">This inquiry originated from outside the network. Use the verified contact information below to respond via official channels.</p>
                   </div>
                   <div className="flex gap-4 w-full sm:w-auto pt-2">
                       {guestContact && (
                           <Button asChild className="flex-1 sm:px-12 bg-slate-900 hover:bg-slate-800 text-white font-semibold h-11 shadow-sm px-10">
                               <a href={guestContact.includes('@') ? `mailto:${guestContact}` : `https://wa.me/${guestContact.replace(/\+/g, '')}`}>
                                   Reachable via {guestContact.includes('@') ? 'Email' : 'WhatsApp'}
                               </a>
                           </Button>
                       )}
                   </div>
                </section>
            )}

            {/* Rejected State */}
            {isRejected && (
                 <div className="text-center py-16 border border-slate-100 border-dashed rounded-3xl bg-slate-50/30">
                     <p className="text-sm font-medium text-slate-400">This collaboration request was declined.</p>
                 </div>
            )}
        </div>
      </div>
    </div>
  );
}
