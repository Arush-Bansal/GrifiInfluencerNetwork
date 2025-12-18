"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Search as SearchIcon, ArrowLeft, User, Loader2, Filter, Bot } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MultiSelect, Option } from "@/components/ui/multi-select";
import type { User as SupabaseUser } from "@supabase/supabase-js";

const NICHE_OPTIONS: Option[] = [
  { value: "tech", label: "Technology" },
  { value: "lifestyle", label: "Lifestyle" },
  { value: "gaming", label: "Gaming" },
  { value: "fitness", label: "Fitness" },
  { value: "beauty", label: "Beauty" },
  { value: "food", label: "Food" },
  { value: "travel", label: "Travel" },
  { value: "business", label: "Business" },
];

const PLATFORM_OPTIONS: Option[] = [
  { value: "instagram", label: "Instagram" },
  { value: "youtube", label: "YouTube" },
  { value: "tiktok", label: "TikTok" },
  { value: "twitter", label: "Twitter/X" },
  { value: "linkedin", label: "LinkedIn" },
];

interface Profile {
  id: string;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
  bio: string | null;
}

function SearchContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [filters, setFilters] = useState({
    niches: [] as string[],
    platforms: [] as string[],
    minFollowers: "",
    minEngagement: "",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [currentUser, setCurrentUser] = useState<SupabaseUser | null>(null);
  const [profileUsername, setProfileUsername] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const loadUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setCurrentUser(session.user);
        
        // Fetch username from profiles
        const { data } = await supabase
          .from("profiles")
          .select("username")
          .eq("id", session.user.id)
          .single();
        
        if (data?.username) {
          setProfileUsername(data.username);
        }
      }
    };
    loadUser();
  }, []);

  // Function to perform the search
  const performSearch = async (searchQuery: string) => {
    setLoading(true);
    setHasSearched(true);
    setResults([]);

    try {
      let queryBuilder = supabase
        .from("profiles")
        .select("id, full_name, username, avatar_url, bio, niche, platform, followers, engagement_rate");

      if (searchQuery.trim()) {
        queryBuilder = queryBuilder.or(`full_name.ilike.%${searchQuery}%,username.ilike.%${searchQuery}%`);
      }

      if (filters.niches.length > 0) {
        queryBuilder = queryBuilder.in('niche', filters.niches);
      }
      
      if (filters.platforms.length > 0) {
        queryBuilder = queryBuilder.in('platform', filters.platforms);
      }
      
      if (filters.minFollowers) {
        const followers = parseInt(filters.minFollowers.replace(/,/g, ''));
        if (!isNaN(followers)) {
          queryBuilder = queryBuilder.gte('followers', followers);
        }
      }
      
      if (filters.minEngagement) {
        const engagement = parseFloat(filters.minEngagement);
        if (!isNaN(engagement)) {
          queryBuilder = queryBuilder.gte('engagement_rate', engagement);
        }
      }

      const { data, error } = await queryBuilder.limit(20);

      if (error) {
        throw error;
      }

      setResults(data || []);
    } catch (error: any) {
      console.error("Search error:", error);
      toast({
        title: "Search failed",
        description: error.message === 'relation "profiles" does not exist' 
          ? "The profiles table does not exist. Please contact support." 
          : "Could not fetch users. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery);
    }
  }, [initialQuery]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(query);
  };

  return (
    <div className="min-h-screen bg-secondary/30">
      <main className="container mx-auto px-4 py-8">
        <Card className="mb-8">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Find People</CardTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowFilters(!showFilters)}
              className="text-muted-foreground"
            >
              <Filter className="w-4 h-4 mr-2" />
              {showFilters ? "Hide Filters" : "Show Filters"}
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or username..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button type="submit" disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Search"}
              </Button>
            </form>

            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="space-y-2">
                  <Label>Content Niches</Label>
                  <MultiSelect
                    options={NICHE_OPTIONS}
                    selected={filters.niches}
                    onChange={(v) => setFilters({ ...filters, niches: v })}
                    placeholder="All Niches"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Main Platforms</Label>
                  <MultiSelect
                    options={PLATFORM_OPTIONS}
                    selected={filters.platforms}
                    onChange={(v) => setFilters({ ...filters, platforms: v })}
                    placeholder="All Platforms"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Min Followers</Label>
                  <Input
                    type="text"
                    placeholder="e.g. 10000"
                    value={filters.minFollowers}
                    onChange={(e) => setFilters({ ...filters, minFollowers: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Min Engagement (%)</Label>
                  <Input
                    type="text"
                    placeholder="e.g. 2.5"
                    value={filters.minEngagement}
                    onChange={(e) => setFilters({ ...filters, minEngagement: e.target.value })}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : results.length > 0 ? (
            results.map((profile) => (
              <Card key={profile.id} className="overflow-hidden hover:bg-accent/5 transition-colors">
                <CardContent className="p-4 flex items-center gap-4">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={profile.avatar_url || ""} />
                    <AvatarFallback>
                      <User className="w-6 h-6 text-muted-foreground" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">
                      {profile.full_name || "Unnamed User"}
                    </h3>
                    {profile.username && (
                      <p className="text-sm text-muted-foreground truncate">
                        @{profile.username}
                      </p>
                    )}
                    {profile.bio && (
                      <p className="text-sm text-muted-foreground truncate mt-1">
                        {profile.bio}
                      </p>
                    )}
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => router.push(`/u/${profile.username}`)}
                  >
                    View
                  </Button>
                </CardContent>
              </Card>
            ))
          ) : hasSearched ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No users found matching "{query}"</p>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <SearchIcon className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>Enter a name or username to start searching</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>}>
      <SearchContent />
    </Suspense>
  );
}
