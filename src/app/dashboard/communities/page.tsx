"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/dashboard/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Users, Shield, ArrowRight } from "lucide-react";
import { CreateCommunityModal } from "@/components/communities/CreateCommunityModal";
import Link from "next/link";
import type { User as SupabaseUser } from "@supabase/supabase-js";

interface Community {
  id: string;
  name: string;
  description: string;
  member_count?: number;
}

export default function CommunitiesPage() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchUserAndCommunities = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        setProfile(profile);
      }

      const { data, error } = await supabase
        .from("communities" as any)
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        setCommunities(data);
      }
      setLoading(false);
    };

    fetchUserAndCommunities();
  }, []);

  const filteredCommunities = communities.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-secondary/30">
      <Navbar user={user} username={profile?.username} />

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Discover Communities</h1>
            <p className="text-muted-foreground">Join spaces that match your interests and collaborate with others.</p>
          </div>
          <CreateCommunityModal />
        </div>

        <div className="relative mb-8">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search for a community..."
            className="pl-10 h-12 bg-background border-none shadow-sm text-lg"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-48 bg-muted animate-pulse rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCommunities.map((community) => (
              <Link key={community.id} href={`/dashboard/communities/${community.id}`}>
                <Card className="hover:shadow-md transition-all cursor-pointer group border-none bg-card/50 backdrop-blur-sm">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        <Users className="w-6 h-6" />
                      </div>
                      <Badge variant="default" className="bg-background/50">
                        Public
                      </Badge>
                    </div>
                    <CardTitle className="text-xl group-hover:text-primary transition-colors">{community.name}</CardTitle>
                    <CardDescription className="line-clamp-2 min-h-[40px]">
                      {community.description || "No description provided."}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mt-4 pt-4 border-t">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Users className="w-4 h-4" />
                        <span>Member-only posting</span>
                      </div>
                      <div className="text-primary group-hover:translate-x-1 transition-transform">
                        <ArrowRight className="w-5 h-5" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {!loading && filteredCommunities.length === 0 && (
          <div className="text-center py-20 bg-card rounded-2xl border-2 border-dashed">
            <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4 text-muted-foreground/50">
              <Users className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-semibold mb-1">No communities found</h3>
            <p className="text-muted-foreground mb-6">Be the first one to create a community for this niche!</p>
            <CreateCommunityModal />
          </div>
        )}
      </main>
    </div>
  );
}
