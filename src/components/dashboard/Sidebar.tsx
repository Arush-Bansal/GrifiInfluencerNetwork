"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Search,
  MessageSquare,
  PlusCircle,
  ExternalLink,
} from "lucide-react";
import { User } from "@supabase/supabase-js";
import { DashboardProfile } from "@/types/dashboard";
import { SidebarUserMenu } from "./SidebarUserMenu";
import { UserRole } from "@/types/enums";
import { Logo } from "@/components/brand/Logo";

interface SidebarProps {
  className?: string;
  user: User | null;
  role: string | null;
  profile: DashboardProfile | null;
}

export function Sidebar({ className, user, role, profile }: SidebarProps) {
  const pathname = usePathname();

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

  const isInfluencer = role === UserRole.INFLUENCER;
  const isBrand = role === UserRole.BRAND;

  return (
    <aside className={cn("flex flex-col w-72 h-screen border-r border-border bg-background sticky top-0", className)}>
      <Link 
        href="/dashboard" 
        className="p-6 flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer"
      >
        <Logo size={32} />
        <span className="text-xl font-bold tracking-tight text-foreground uppercase">GRIFI</span>
      </Link>

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

        <div className="">
          {/* <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">
            Professional
          </div> */}
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
              <Link
                href={`/u/${profile?.username}`}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  pathname === `/u/${profile?.username}`
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                <ExternalLink className="w-4 h-4" />
                Visit Your Page
              </Link>
            </>
          )}
        </div>
      </nav>

      <div className="p-4 mt-auto border-t border-border">
        <SidebarUserMenu user={user} profile={profile} role={role} />
      </div>
    </aside>
  );
}
