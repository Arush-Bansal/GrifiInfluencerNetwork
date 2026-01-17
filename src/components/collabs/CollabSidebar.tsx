"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search, Archive } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

interface CollabSidebarProps {
  incoming: CollabRequest[];
  outgoing: CollabRequest[];
  active: CollabRequest[];
  selectedId?: string;
  onSelect: (request: CollabRequest) => void;
  currentUserId: string;
}

export function CollabSidebar({ 
  incoming, 
  outgoing, 
  active, 
  selectedId, 
  onSelect,
  currentUserId 
}: CollabSidebarProps) {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("active");

  const getFilteredList = () => {
    let list: CollabRequest[] = [];
    if (activeTab === "active") list = active;
    else if (activeTab === "incoming") list = incoming;
    else if (activeTab === "outgoing") list = outgoing;

    if (!search) return list;
    
    return list.filter(req => {
      const isSenderMe = req.sender_id === currentUserId;
      const partner = isSenderMe ? req.receiver : req.sender;
      const name = partner?.full_name || partner?.username || (req.sender_id ? "Unknown" : "Guest");
      return name.toLowerCase().includes(search.toLowerCase());
    });
  };

  const filteredList = getFilteredList();

  return (
    <div className="flex flex-col h-full border-r bg-slate-50/50">
      <div className="p-6 space-y-5">
        <h2 className="text-xl font-bold tracking-tight text-slate-900">Connections</h2>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search network..."
            className="pl-9 h-11 border-slate-200 bg-white focus-visible:ring-indigo-500 shadow-sm rounded-xl"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 w-full h-11 bg-slate-200/50 p-1 border border-slate-200/60 rounded-xl">
            <TabsTrigger value="active" className="text-xs font-semibold py-1.5 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm rounded-lg transition-all">
               Active
            </TabsTrigger>
            <TabsTrigger value="incoming" className="text-xs font-semibold py-1.5 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm relative rounded-lg transition-all">
               Inbox
               {incoming.length > 0 && (
                 <span className="absolute -top-1 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-[10px] text-white font-bold ring-2 ring-white">
                   {incoming.length}
                 </span>
               )}
            </TabsTrigger>
            <TabsTrigger value="outgoing" className="text-xs font-semibold py-1.5 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm rounded-lg transition-all">
               Sent
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pt-2">
        {filteredList.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center gap-3 opacity-40">
             <Archive className="w-10 h-10 text-slate-300" />
             <p className="text-sm font-medium text-slate-500 line-clamp-2 px-6">No {activeTab} connections found</p>
          </div>
        ) : (
          <div className="space-y-0.5">
            {filteredList.map((req) => {
              const isSenderMe = req.sender_id === currentUserId;
              const partner = isSenderMe ? req.receiver : req.sender;
              const isSelected = selectedId === req.id;
              const isGuest = !req.sender_id && !isSenderMe;

              return (
                <button
                  key={req.id}
                  onClick={() => onSelect(req)}
                  className={`
                    w-full flex items-center gap-4 px-4 py-4 text-left transition-all relative
                    ${isSelected 
                      ? "bg-white border-y border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.02)]" 
                      : "hover:bg-slate-100/30"}
                  `}
                >
                  {isSelected && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-600 rounded-r-full" />
                  )}
                  
                  <div className="relative shrink-0">
                    <Avatar className={`h-12 w-12 border border-slate-200 shadow-none ${isGuest ? 'grayscale opacity-80' : ''}`}>
                      <AvatarImage src={partner?.avatar_url || undefined} />
                      <AvatarFallback className="bg-slate-100 text-slate-500 font-medium">
                        {isGuest ? "G" : (partner?.full_name?.charAt(0) || "?")}
                      </AvatarFallback>
                    </Avatar>
                    {activeTab === "active" && (
                      <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 border-2 border-white" />
                    )}
                  </div>
                  
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <span className={`text-[15px] ${isSelected ? "font-bold text-slate-900" : "font-medium text-slate-700"} truncate`}>
                        {isGuest ? "Guest Inquiry" : (partner?.full_name || partner?.username || "Network Member")}
                      </span>
                      <span className="text-[10px] text-slate-400 shrink-0 font-bold uppercase tracking-tight">
                        {new Date(req.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={`text-[10px] h-4.5 px-1.5 font-bold border-slate-200 text-slate-500 uppercase tracking-wider bg-slate-100/50`}>
                        {req.type}
                      </Badge>
                      {req.message && (
                        <p className="text-xs text-slate-400 truncate font-normal italic">
                          {req.message.length > 30 ? req.message.substring(0, 30) + "..." : req.message}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
