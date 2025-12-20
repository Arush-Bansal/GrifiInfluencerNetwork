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
  const [suggestions, setSuggestions] = useState<Profile[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
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

  // Fetch suggestions as user types
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!isFocused) return;
      
      if (!query.trim()) {
        // Fetch "featured" or recent users when query is empty
        setIsLoadingSuggestions(true);
        const { data } = await supabase
          .from("profiles")
          .select("id, full_name, username, avatar_url, bio")
          .limit(5);
        setSuggestions(data || []);
        setIsLoadingSuggestions(false);
        return;
      }

      setIsLoadingSuggestions(true);
      const { data } = await supabase
        .from("profiles")
        .select("id, full_name, username, avatar_url, bio")
        .or(`full_name.ilike.%${query}%,username.ilike.%${query}%`)
        .limit(5);
      
      setSuggestions(data || []);
      setIsLoadingSuggestions(false);
    };

    const debounceTimer = setTimeout(() => {
      fetchSuggestions();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [query, isFocused]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(query);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isFocused || suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      const suggestion = suggestions[activeIndex];
      setQuery(suggestion.username || suggestion.full_name || "");
      router.push(`/u/${suggestion.username}`);
      setIsFocused(false);
    } else if (e.key === "Escape") {
      setIsFocused(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="container max-w-3xl mx-auto px-4 py-8 md:py-10">
        <div className="mb-6 md:mb-8 text-center px-4">
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-2 text-primary">
            Find people
          </h1>
          <p className="text-sm text-muted-foreground">
            Search influencers and brands in our network.
          </p>
        </div>

        <div className="mb-6 md:mb-8 relative">
          <Card className="border-none bg-card shadow-xl shadow-primary/5 rounded-2xl md:rounded-3xl">
            <CardContent className="p-2 md:p-3 space-y-3">
              <form onSubmit={handleSearch} className="flex gap-2 items-center">
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={() => setShowFilters(!showFilters)}
                  className={`h-11 md:h-12 w-11 md:w-12 p-0 rounded-xl md:rounded-2xl shrink-0 transition-all border-none bg-secondary/50 hover:bg-primary/10 ${showFilters ? 'text-primary bg-primary/10' : ''}`}
                  title="Toggle Filters"
                >
                  <Filter className="w-4 h-4" />
                </Button>

                <div className="relative flex-1 group min-w-0">
                  <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    placeholder="Search name or @username"
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      setActiveIndex(-1);
                    }}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => {
                      setTimeout(() => setIsFocused(false), 200);
                    }}
                    onKeyDown={handleKeyDown}
                    className="pl-9 h-11 md:h-12 bg-secondary/50 border-transparent focus:bg-background focus:border-primary/30 transition-all rounded-xl md:rounded-2xl text-sm w-full"
                  />
                  
                  {isFocused && (
                    <div className="absolute top-full left-0 right-0 mt-2 z-[100] bg-background border border-primary/10 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200">
                      {isLoadingSuggestions ? (
                        <div className="p-4 flex items-center justify-center">
                          <Loader2 className="w-5 h-5 animate-spin text-primary" />
                        </div>
                      ) : suggestions.length > 0 ? (
                        <div className="max-h-[300px] overflow-y-auto">
                          {suggestions.map((suggestion, index) => (
                            <button
                              key={suggestion.id}
                              type="button"
                              className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-primary/5 text-left transition-all ${
                                activeIndex === index ? "bg-primary/10" : ""
                              }`}
                              onMouseDown={(e) => {
                                e.preventDefault();
                                setQuery(suggestion.username || suggestion.full_name || "");
                                router.push(`/u/${suggestion.username}`);
                                setIsFocused(false);
                              }}
                              onMouseEnter={() => setActiveIndex(index)}
                            >
                              <Avatar className="w-9 h-9 border border-border/50">
                                <AvatarImage src={suggestion.avatar_url || ""} />
                                <AvatarFallback className="bg-primary/5">
                                  <User className="w-4 h-4 text-primary/30" />
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <p className="font-bold text-sm truncate">
                                  {suggestion.full_name || suggestion.username}
                                </p>
                                {suggestion.username && (
                                  <p className="text-[11px] text-muted-foreground truncate">
                                    @{suggestion.username}
                                  </p>
                                )}
                              </div>
                            </button>
                          ))}
                        </div>
                      ) : query.trim() ? (
                        <div className="p-4 text-center text-xs text-muted-foreground">
                          No results found
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>

                <Button type="submit" disabled={loading} className="h-11 md:h-12 px-5 md:px-8 rounded-xl md:rounded-2xl font-bold text-sm shadow-lg shadow-primary/20 shrink-0">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Search"}
                </Button>
              </form>

              {showFilters && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="space-y-1">
                    <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-1">Niche</Label>
                    <MultiSelect
                      options={NICHE_OPTIONS}
                      selected={filters.niches}
                      onChange={(v) => setFilters({ ...filters, niches: v })}
                      placeholder="Niches"
                      className="bg-secondary/50 border-transparent rounded-lg text-xs h-9"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-1">Platform</Label>
                    <MultiSelect
                      options={PLATFORM_OPTIONS}
                      selected={filters.platforms}
                      onChange={(v) => setFilters({ ...filters, platforms: v })}
                      placeholder="Platforms"
                      className="bg-secondary/50 border-transparent rounded-lg text-xs h-9"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-1">Followers</Label>
                    <Input
                      placeholder="Min."
                      value={filters.minFollowers}
                      onChange={(e) => setFilters({ ...filters, minFollowers: e.target.value })}
                      className="h-9 bg-secondary/50 border-transparent rounded-lg text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-1">Eng.</Label>
                    <Input
                      placeholder="Min. %"
                      value={filters.minEngagement}
                      onChange={(e) => setFilters({ ...filters, minEngagement: e.target.value })}
                      className="h-9 bg-secondary/50 border-transparent rounded-lg text-xs"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-primary/40" />
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">Searching</p>
            </div>
          ) : results.length > 0 ? (
            <div className="bg-card/40 border border-border/50 rounded-2xl md:rounded-3xl overflow-hidden divide-y divide-border/20">
              {results.map((profile) => (
                <div 
                  key={profile.id} 
                  className="group flex items-center gap-3 md:gap-4 p-3 md:p-4 hover:bg-primary/[0.02] transition-all duration-200"
                >
                  <div className="relative shrink-0">
                    <Avatar className="w-12 h-12 md:w-14 h-14 border border-border/50 shadow-sm">
                      <AvatarImage src={profile.avatar_url || ""} className="object-cover" />
                      <AvatarFallback className="bg-secondary">
                        <User className="w-6 h-6 text-muted-foreground/30" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-background rounded-full border border-border shadow-sm flex items-center justify-center">
                      <Bot className="w-2.5 h-2.5 text-primary" />
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <h3 className="font-bold text-sm md:text-base truncate group-hover:text-primary transition-colors">
                        {profile.full_name || "Guest User"}
                      </h3>
                      <div className="w-3.5 h-3.5 rounded-full bg-blue-500 flex items-center justify-center shrink-0">
                        <svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>
                    
                    {profile.username && (
                      <p className="text-[12px] md:text-[13px] font-medium text-primary/60 mb-1">
                        @{profile.username}
                      </p>
                    )}
                    
                    {profile.bio && (
                      <p className="text-[11px] md:text-xs text-muted-foreground line-clamp-1 leading-tight max-w-[90%] font-medium">
                        {profile.bio}
                      </p>
                    )}
                  </div>
                  
                  <Button 
                    size="sm"
                    onClick={() => router.push(`/u/${profile.username}`)}
                    className="shrink-0 h-8 md:h-9 px-4 md:px-5 rounded-full font-bold text-[11px] md:text-xs bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all border-none"
                  >
                    View
                  </Button>
                </div>
              ))}
            </div>
          ) : hasSearched ? (
            <div className="text-center py-16 bg-card/20 border border-dashed border-border/50 rounded-2xl">
              <SearchIcon className="w-8 h-8 text-muted-foreground/20 mx-auto mb-3" />
              <h3 className="text-sm font-bold secondary-foreground">No matches found</h3>
              <p className="text-[11px] text-muted-foreground">Try other terms or filters.</p>
            </div>
          ) : (
            <div className="text-center py-16 bg-card/20 border border-dashed border-border/50 rounded-2xl">
              <User className="w-8 h-8 text-primary/10 mx-auto mb-3" />
              <h3 className="text-sm font-bold">Search our network</h3>
              <p className="text-[11px] text-muted-foreground">Find influencers, brands, and creators.</p>
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
