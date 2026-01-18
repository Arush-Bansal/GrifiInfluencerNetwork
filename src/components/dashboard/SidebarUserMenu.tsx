"use client";

import { useRouter } from "next/navigation";
import { LogOut, ExternalLink, Settings } from "lucide-react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DashboardProfile } from "@/types/dashboard";
import Link from "next/link";

interface SidebarUserMenuProps {
  user: User | null;
  profile: DashboardProfile | null;
  role: string | null;
}

export function SidebarUserMenu({ user, profile, role }: SidebarUserMenuProps) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.clear();
      sessionStorage.clear();
      router.push("/auth");
      router.refresh();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
          <Link href={`/u/${profile?.username || user?.user_metadata?.username}`} className="flex items-center gap-3 px-3 py-3 rounded-lg cursor-pointer hover:bg-accent transition-colors group">
            <Avatar className="w-9 h-9 border border-border group-hover:opacity-80 transition-opacity">
              <AvatarImage src={user?.user_metadata?.avatar_url || ""} />
              <AvatarFallback className="bg-primary/5 text-primary text-xs">
                {profile?.full_name.charAt(0) || user?.email?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate text-foreground group-hover:text-primary transition-colors">
                {profile?.full_name || "User"}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {role?.replace("_", " ") || "Member"}
              </p>
            </div>
          </Link>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 mb-2">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{profile?.full_name || "User"}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user?.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/dashboard/profile" className="flex items-center w-full cursor-pointer">
            <Settings className="mr-2 h-4 w-4 text-muted-foreground" />
            <span>Settings</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
