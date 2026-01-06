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

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
}

interface ChatSheetProps {
  partnerId: string;
  partnerName: string;
  partnerAvatar?: string;
  trigger?: React.ReactNode;
}

import { useAuth } from "@/hooks/use-auth";
import { useCallback } from "react";

export function ChatSheet({ partnerId, partnerName, partnerAvatar, trigger }: ChatSheetProps) {
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
    <Sheet>
      <SheetTrigger asChild>
        {trigger || <Button variant="outline" size="sm"><MessageCircle className="w-4 h-4 mr-2"/> Chat</Button>}
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md flex flex-col h-full p-0">
        <SheetHeader className="p-4 border-b">
          <SheetTitle className="flex items-center gap-3">
             <Avatar className="w-8 h-8">
               <AvatarImage src={partnerAvatar} />
               <AvatarFallback>{(partnerName || "?").charAt(0)}</AvatarFallback>
             </Avatar>
             {partnerName || "Unknown User"}
          </SheetTitle>
        </SheetHeader>
        
        <div className="flex-1 overflow-hidden relative bg-muted/20">
            <ScrollArea className="h-full p-4">
                {loading && messages.length === 0 ? (
                    <div className="flex justify-center p-4"><Loader2 className="animate-spin opacity-50"/></div>
                ) : messages.length === 0 ? (
                    <div className="text-center text-muted-foreground p-8 opacity-50 text-sm">No messages yet. Say hi!</div>
                ) : (
                    <div className="flex flex-col gap-3 min-h-[calc(100vh-200px)] justify-end">
                       {messages.map((msg) => {
                           const isMe = msg.sender_id === currentUserId;
                           return (
                               <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                   <div className={`
                                       max-w-[80%] rounded-lg px-3 py-2 text-sm
                                       ${isMe ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}
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

        <div className="p-4 bg-background border-t">
           <form onSubmit={handleSend} className="flex gap-2">
               <Input 
                 placeholder="Type a message..." 
                 value={newMessage}
                 onChange={(e) => setNewMessage(e.target.value)}
                 className="flex-1"
               />
               <Button type="submit" size="icon" disabled={sending || !newMessage.trim()}>
                   <Send className="w-4 h-4" />
               </Button>
           </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
