"use client";

import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";

interface DashboardHeaderProps {
  user: any;
  profile: any;
}

export function DashboardHeader({ user, profile }: DashboardHeaderProps) {
  const router = useRouter();

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-background/80 backdrop-blur-md border-b border-border z-40 lg:hidden px-4 flex items-center justify-between">
      <div className="flex items-center gap-2" onClick={() => router.push("/dashboard")}>
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
          <span className="text-primary-foreground font-bold text-lg">G</span>
        </div>
        <span className="text-xl font-bold tracking-tight text-foreground">GRIFI</span>
      </div>

      <Avatar 
        className="w-8 h-8 border border-border cursor-pointer" 
        onClick={() => router.push("/dashboard/profile")}
      >
        <AvatarImage src={user?.user_metadata?.avatar_url || ""} />
        <AvatarFallback className="bg-primary/5 text-primary text-[10px]">
          {profile?.full_name?.charAt(0) || user?.email?.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
    </header>
  );
}
