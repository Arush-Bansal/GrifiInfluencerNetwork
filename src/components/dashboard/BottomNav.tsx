"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  MessageSquare,
  User,
  Users,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

interface BottomNavProps {
  className?: string;
}

export function BottomNav({ className }: BottomNavProps) {
  const pathname = usePathname();
  const { profile } = useAuth();

  const profileHref = profile?.username ? `/u/${profile.username}` : "/dashboard/profile";

  const navItems = [
    {
      title: "Home",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Inbound",
      href: "/dashboard/collabs",
      icon: MessageSquare,
    },
    {
      title: "Network",
      href: "/dashboard/network",
      icon: Users,
    },
    {
      title: "Your Page",
      href: profileHref,
      icon: User,
    },
  ];

  return (
    <nav className={cn("fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border px-4 py-2 flex items-center justify-around lg:hidden", className)}>
      {navItems.map((item) => (
        <Link
          key={item.title}
          href={item.href}
          className={cn(
            "flex flex-col items-center gap-1 transition-colors relative",
            pathname === item.href
              ? "text-primary"
              : "text-muted-foreground"
          )}
        >
          <item.icon className="w-5 h-5" />
          <span className="text-[10px] font-medium leading-none">{item.title}</span>
        </Link>
      ))}
    </nav>
  );
}
