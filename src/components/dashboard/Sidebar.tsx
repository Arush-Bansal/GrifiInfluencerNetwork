"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Search,
  MessageSquare,
  Users,
  Briefcase,
  User,
  LogOut,
  PlusCircle,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface SidebarProps {
  className?: string;
  user: any;
  role: string | null;
  profile: any;
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
    {
      title: "Communities",
      href: "/dashboard/communities",
      icon: Users,
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
                onClick={() => window.open(`/u/${profile?.username}`, "_blank")}
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
        <div className="flex items-center gap-3 px-3 py-3 mb-2">
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
        <div className="space-y-1">
          <Link
            href="/dashboard/profile"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          >
            <User className="w-4 h-4" />
            Settings
          </Link>
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10 h-9 px-3"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </div>
    </aside>
  );
}
