"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UnifiedFeed } from "@/components/dashboard/UnifiedFeed";
import { CreatePost } from "@/components/dashboard/CreatePost";
import { useQueryClient } from "@tanstack/react-query";
import { DashboardSkeleton } from "@/components/skeletons";
import { mapToDashboardProfile } from "@/lib/view-models";
import { Search as SearchIcon, Globe, Users, Loader2, Star, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSearchProfiles, useSearchSuggestions } from "@/hooks/use-search";
import Link from "next/link";

function DiscoverTab() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQuery);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [hasSearched, setHasSearched] = useState(!!initialQuery);
  const [isFocused, setIsFocused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const router = useRouter();

  const searchRepo = useSearchProfiles(searchQuery, {}, hasSearched);
  const suggestionsRepo = useSearchSuggestions(query, isFocused);

  const performSearch = () => {
    setHasSearched(true);
    setSearchQuery(query);
  };

  const results = searchRepo.data || [];
  const loading = searchRepo.isFetching;
  const isLoadingSuggestions = suggestionsRepo.isFetching;
  const suggestions = suggestionsRepo.data || [];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch();
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="relative">
        <Card className="border-none bg-card shadow-xl shadow-primary/5 rounded-3xl">
          <CardContent className="p-3">
            <form onSubmit={handleSearch} className="flex gap-2 items-center">
              <div className="relative flex-1 group min-w-0">
                <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  placeholder="Search name or @username"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setActiveIndex(-1);
                  }}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                  className="pl-11 h-12 bg-secondary/50 border-transparent focus:bg-background focus:border-primary/30 transition-all rounded-2xl text-sm w-full"
                />
                
                {isFocused && (
                  <div className="absolute top-full left-0 right-0 mt-2 z-[100] bg-background border border-primary/10 rounded-2xl shadow-2xl overflow-hidden">
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
                              router.push(`/u/${suggestion.username}`);
                            }}
                          >
                            <Avatar className="w-9 h-9 border border-border/50">
                              <AvatarImage src={suggestion.avatar_url || ""} />
                              <AvatarFallback className="bg-primary/5">
                                <User className="w-4 h-4 text-primary/30" />
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-sm truncate">{suggestion.full_name || suggestion.username}</p>
                              {suggestion.username && <p className="text-[11px] text-muted-foreground truncate">@{suggestion.username}</p>}
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : query.trim() ? (
                      <div className="p-4 text-center text-xs text-muted-foreground">No matches found</div>
                    ) : null}
                  </div>
                )}
              </div>

              <Button type="submit" disabled={loading} className="h-12 px-8 rounded-2xl font-bold text-sm shadow-lg shadow-primary/20 shrink-0">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Search"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 bg-muted/50 animate-pulse rounded-2xl" />
          ))
        ) : results.length > 0 ? (
          results.map((profile) => (
            <Link key={profile.id} href={`/u/${profile.username}`}>
              <Card className="border-none bg-card/50 hover:bg-card shadow-sm hover:shadow-md transition-all group overflow-hidden">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="relative shrink-0">
                    <Avatar className="w-14 h-14 border-2 border-background shadow-sm">
                      <AvatarImage src={profile.avatar_url || ""} className="object-cover" />
                      <AvatarFallback className="bg-secondary">
                        <User className="w-6 h-6 text-muted-foreground/30" />
                      </AvatarFallback>
                    </Avatar>
                    {profile.is_verified && (
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-background rounded-full border border-border shadow-sm flex items-center justify-center">
                        <Star className="w-2.5 h-2.5 text-primary fill-primary" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-base truncate group-hover:text-primary transition-colors">
                      {profile.full_name || "Guest User"}
                    </h3>
                    <p className="text-xs font-medium text-primary/60 truncate">@{profile.username}</p>
                    {profile.bio && <p className="text-[11px] text-muted-foreground line-clamp-1 mt-1">{profile.bio}</p>}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        ) : hasSearched ? (
          <div className="col-span-full py-12 text-center text-muted-foreground font-serif">
            No creators found for &quot;{searchQuery}&quot;
          </div>
        ) : (
          <div className="col-span-full py-20 text-center space-y-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary/40">
              <Users className="w-8 h-8" />
            </div>
            <div>
              <p className="font-serif text-2xl">Find your network</p>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto mt-1">Search for influencers, brands, and creative partners.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const NetworkContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { user, profile: serverProfile, role, isLoading: loading } = useAuth();
  
  const currentTab = searchParams.get("tab") || "feed";

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth");
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return <DashboardSkeleton />;
  }

  const profile = mapToDashboardProfile(serverProfile);

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("tab", value);
    router.push(`/dashboard/network?${params.toString()}`);
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-full overflow-hidden">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="space-y-1">
          <h1 className="text-3xl font-serif font-bold tracking-tight">Network</h1>
          <p className="text-muted-foreground text-sm">Discover and connect with your professional circle.</p>
        </div>

        <Tabs value={currentTab} onValueChange={handleTabChange} className="space-y-8">
          <div className="border-b border-border">
            <TabsList className="bg-transparent rounded-none p-0 h-auto flex justify-start gap-8 border-none pb-[2px]">
              <TabsTrigger 
                value="feed" 
                className="data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none shadow-none px-2 py-3 text-sm font-bold transition-all"
              >
                <Globe className="w-4 h-4 mr-2" />
                Global Feed
              </TabsTrigger>
              <TabsTrigger 
                value="discover" 
                className="data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none shadow-none px-2 py-3 text-sm font-bold transition-all"
              >
                <Users className="w-4 h-4 mr-2" />
                Discover
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="feed" className="animate-in fade-in slide-in-from-bottom-2 duration-500 outline-none">
            <div className="space-y-6">
              {role !== 'influencer' && (
                <div className="hidden lg:block mb-8">
                  <CreatePost 
                    userId={user?.id || ""} 
                    userProfile={{ username: profile.username }}
                    onPostCreated={() => {
                      queryClient.invalidateQueries({ queryKey: ["feed"] });
                    }}
                  />
                </div>
              )}
              <UnifiedFeed userId={user?.id || ""} />
            </div>
          </TabsContent>

          <TabsContent value="discover" className="outline-none">
            <DiscoverTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default function NetworkPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <NetworkContent />
    </Suspense>
  );
}
