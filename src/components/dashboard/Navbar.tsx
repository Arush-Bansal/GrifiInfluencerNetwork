"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  User, 
  LogOut, 
  Search,
  ExternalLink,
  Inbox,
  Users,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import Link from "next/link";

interface NavbarProps {
  user?: SupabaseUser | null;
  username?: string | null;
}

export const Navbar = ({ user, username }: NavbarProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/dashboard/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      localStorage.clear();
      sessionStorage.clear();
      router.push("/auth");
      router.refresh();
    }
  };

  const isProfilePage = pathname === "/dashboard/profile";

  return (
    <header className="bg-background border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div 
          className="flex items-center gap-2 cursor-pointer" 
          onClick={() => router.push(user ? '/dashboard' : '/')}
        >
          <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
            <span className="text-primary-foreground font-semibold text-lg">G</span>
          </div>
          <span className="text-xl font-semibold tracking-tight">GRIFI</span>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Desktop Search */}
          <form onSubmit={handleSearchSubmit} className="relative mr-2 hidden md:block">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search users..."
              className="w-64 pl-9 h-9 bg-background"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
          
          {/* Mobile Search Icon */}
          <Button variant="ghost" size="icon" className="md:hidden mr-2 text-muted-foreground" asChild>
            <Link href="/dashboard/search">
              <Search className="w-5 h-5" />
              <span className="sr-only">Search</span>
            </Link>
          </Button>

          {user ? (
            <>
              {/* Public Profile Link / Setup */}
              {username || user?.user_metadata?.username ? (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => window.open(`/u/${username || user?.user_metadata?.username}`, '_blank')}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">
                     View Public
                  </span>
                </Button>
              ) : (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => router.push("/dashboard/profile")}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <User className="w-4 h-4 mr-2 opacity-50" />
                  <span className="hidden sm:inline">
                     Setup Page
                  </span>
                </Button>
              )}

              {/* Communities Link */}
              <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => router.push("/dashboard/communities")} 
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Users className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">
                     Communities
                  </span>
                </Button>

              {/* Requests Link */}
              <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => router.push("/dashboard/collabs")} 
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Inbox className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">
                     Requests
                  </span>
                </Button>

              {/* Profile Link */}
              {!isProfilePage && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => router.push("/dashboard/profile")} 
                  className="text-muted-foreground hover:text-foreground"
                >
                  <User className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">
                     Profile
                  </span>
                </Button>
              )}

              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleLogout} 
                className="text-muted-foreground hover:text-foreground"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </>
          ) : (
             <Button 
                variant="default" 
                size="sm" 
                onClick={() => router.push("/auth")} 
              >
                Sign In
              </Button>
          )}
        </div>
      </div>
    </header>
  );
};
