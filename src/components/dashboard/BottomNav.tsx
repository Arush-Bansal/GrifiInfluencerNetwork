"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Search,
  MessageSquare,
  Users,
  User,
  Plus,
} from "lucide-react";

interface BottomNavProps {
  className?: string;
  role: string | null;
}

export function BottomNav({ className, role }: BottomNavProps) {
  const pathname = usePathname();

  const navItems = [
    {
      title: "Home",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Explore",
      href: "/dashboard/search",
      icon: Search,
    },
    {
      title: "Create",
      href: role === "brand" ? "/dashboard/campaigns/new" : "/dashboard",
      icon: Plus,
      isAction: true,
    },
    {
      title: "Collabs",
      href: "/dashboard/collabs",
      icon: MessageSquare,
    },
    {
      title: "Profile",
      href: "/dashboard/profile",
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
            item.isAction 
              ? "bg-primary text-primary-foreground p-3 rounded-full -mt-8 shadow-lg shadow-primary/30 active:scale-95 transition-transform"
              : pathname === item.href
                ? "text-primary"
                : "text-muted-foreground"
          )}
        >
          <item.icon className={cn(item.isAction ? "w-6 h-6" : "w-5 h-5")} />
          {!item.isAction && (
            <span className="text-[10px] font-medium leading-none">{item.title}</span>
          )}
        </Link>
      ))}
    </nav>
  );
}
