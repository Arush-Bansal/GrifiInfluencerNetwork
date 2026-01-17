"use client";

import { useEffect, useRef, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { MessageCircle, Send, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useCallback } from "react";

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
}

interface ChatContentProps {
  partnerId: string;
  partnerName: string;
  partnerAvatar?: string;
  embedded?: boolean;
}

export interface ChatSheetProps {
  partnerId: string;
  partnerName: string;
  partnerAvatar?: string;
  trigger?: React.ReactNode;
}

export function ChatContent({ partnerId, partnerName, partnerAvatar, embedded = false }: ChatContentProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const { user } = useAuth();
  const currentUserId = user?.id;
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const fetchMessages = useCallback(async () => {
    if (!currentUserId) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .or(`and(sender_id.eq.${currentUserId},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${currentUserId})`)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setMessages((data || []) as Message[]);
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  }, [currentUserId, partnerId]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newMessage.trim() || !currentUserId) return;

    setSending(true);
    try {
      const { error } = await supabase
        .from("messages")
        .insert({
          sender_id: currentUserId,
          receiver_id: partnerId,
          content: newMessage
        });

      if (error) throw error;

      // Optimistic append
      const tempMsg: Message = {
        id: "temp-" + Date.now(),
        sender_id: currentUserId,
        receiver_id: partnerId,
        content: newMessage,
        created_at: new Date().toISOString()
      };
      setMessages((prev) => [...prev, tempMsg]);
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Failed to send",
        variant: "destructive"
      });
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    if (!currentUserId) return;
    
    fetchMessages();

    const channel = supabase
      .channel(`chat:${partnerId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
           const newMsg = payload.new as Message;
           if (
               (newMsg.sender_id === partnerId && newMsg.receiver_id === currentUserId) ||
               (newMsg.sender_id === currentUserId && newMsg.receiver_id === partnerId)
           ) {
              setMessages(prev => {
                  if (prev.some(m => m.id === newMsg.id)) return prev;
                  return [...prev.filter(m => !m.id.startsWith("temp-")), newMsg];
              });
           }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [partnerId, currentUserId, fetchMessages]);

  return (
    <div className={`flex flex-col h-full bg-white ${embedded ? "" : "p-0"}`}>
        {!embedded && (
            <SheetHeader className="p-4 border-b border-slate-100">
                <SheetTitle className="flex items-center gap-3 text-slate-900 font-semibold">
                    <Avatar className="w-9 h-9 border border-slate-200">
                        <AvatarImage src={partnerAvatar} />
                        <AvatarFallback className="bg-slate-100 text-slate-500 font-medium">{(partnerName || "?").charAt(0)}</AvatarFallback>
                    </Avatar>
                    {partnerName || "Network Member"}
                </SheetTitle>
            </SheetHeader>
        )}
        
        <div className={`flex-1 overflow-hidden relative bg-white`}>
            <ScrollArea className="h-full px-4 pt-4">
                {loading && messages.length === 0 ? (
                    <div className="flex justify-center p-8"><Loader2 className="animate-spin text-slate-300 w-6 h-6"/></div>
                ) : messages.length === 0 ? (
                    <div className="text-center text-slate-400 p-12 text-sm italic font-medium">No messages in this workspace yet.</div>
                ) : (
                    <div className="flex flex-col gap-4 min-h-full pb-6">
                       {messages.map((msg) => {
                           const isMe = msg.sender_id === currentUserId;
                           return (
                               <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                   <div className={`
                                       max-w-[75%] px-4 py-2.5 text-[14px] leading-relaxed
                                       ${isMe 
                                         ? 'bg-indigo-600 text-white rounded-2xl rounded-tr-none shadow-sm' 
                                         : 'bg-slate-100 text-slate-700 rounded-2xl rounded-tl-none border border-slate-200/50'}
                                   `}>
                                       {msg.content}
                                   </div>
                               </div>
                           );
                       })}
                       <div ref={scrollRef} />
                    </div>
                )}
            </ScrollArea>
        </div>

        <div className={`p-4 bg-white border-t border-slate-100`}>
           <form onSubmit={handleSend} className="flex gap-2">
               <Input 
                 placeholder="Compose message..." 
                 value={newMessage}
                 onChange={(e) => setNewMessage(e.target.value)}
                 className="flex-1 h-11 bg-slate-50/50 border-slate-200 focus-visible:ring-indigo-500 rounded-xl"
               />
               <Button 
                type="submit" 
                size="icon" 
                disabled={sending || !newMessage.trim()}
                className="h-11 w-11 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all shadow-sm"
               >
                   <Send className="w-4 h-4" />
               </Button>
           </form>
        </div>
    </div>
  );
}

export function ChatSheet({ partnerId, partnerName, partnerAvatar, trigger }: ChatSheetProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        {trigger || <Button variant="outline" size="sm"><MessageCircle className="w-4 h-4 mr-2"/> Chat</Button>}
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md flex flex-col h-full p-0">
        <ChatContent 
            partnerId={partnerId} 
            partnerName={partnerName} 
            partnerAvatar={partnerAvatar} 
        />
      </SheetContent>
    </Sheet>
  );
}
