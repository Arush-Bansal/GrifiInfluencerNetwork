"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Search,
  MessageSquare,
  LogOut,
  PlusCircle,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Tables } from "@/integrations/supabase/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Settings } from "lucide-react";

interface SidebarProps {
  className?: string;
  user: User | null;
  role: string | null;
  profile: Tables<"profiles"> | null | undefined;
}

export function Sidebar({ className, user, role, profile }: SidebarProps) {
  const pathname = usePathname();
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

  const navItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Explore",
      href: "/dashboard/search",
      icon: Search,
    },
    {
      title: "Collaborations",
      href: "/dashboard/collabs",
      icon: MessageSquare,
    },
  ];

  const isInfluencer = role === "influencer";
  const isBrand = role === "brand";

  return (
    <aside className={cn("flex flex-col w-72 h-screen border-r border-border bg-background sticky top-0", className)}>
      <div className="p-6 flex items-center gap-2">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
          <span className="text-primary-foreground font-bold text-lg">G</span>
        </div>
        <span className="text-xl font-bold tracking-tight text-foreground">GRIFI</span>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">
          Menu
        </div>
        {navItems.map((item) => (
          <Link
            key={item.title}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              pathname === item.href
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            )}
          >
            <item.icon className="w-4 h-4" />
            {item.title}
          </Link>
        ))}

        <div className="pt-6">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">
            Professional
          </div>
          {isBrand && (
            <Link
              href="/dashboard/campaigns/new"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              Create Campaign
            </Link>
          )}
          {isInfluencer && (
            <>
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground h-9 px-3"
                onClick={() => router.push(`/u/${profile?.username}`)}
              >
                <ExternalLink className="w-4 h-4" />
                View Public Page
              </Button>
              <Link
                href="/dashboard/profile"
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
              >
                <ShieldCheck className="w-4 h-4" />
                Verify Socials
              </Link>
            </>
          )}
        </div>
      </nav>


      <div className="p-4 mt-auto border-t border-border">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center gap-3 px-3 py-3 rounded-lg cursor-pointer hover:bg-accent transition-colors">
              <Avatar className="w-9 h-9 border border-border">
                <AvatarImage src={user?.user_metadata?.avatar_url || ""} />
                <AvatarFallback className="bg-primary/5 text-primary text-xs">
                  {profile?.full_name?.charAt(0) || user?.email?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate text-foreground">
                  {profile?.full_name || "User"}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {role?.replace("_", " ") || "Member"}
                </p>
              </div>
            </div>
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
            <DropdownMenuItem onClick={() => router.push(`/u/${profile?.username || user?.user_metadata?.username}`)}>
              <ExternalLink className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>Go to Public Page</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/dashboard/profile")}>
              <Settings className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>View Profile</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}
