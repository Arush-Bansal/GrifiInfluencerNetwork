"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSearchProfiles, useSearchSuggestions } from "@/hooks/use-search";
import { Search as SearchIcon, User, Loader2, Star } from "lucide-react";



interface Profile {
  id: string;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
  bio: string | null;
  is_verified?: boolean;
}

import { SearchSkeleton } from "@/components/skeletons";

function SearchContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQuery);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [hasSearched, setHasSearched] = useState(!!initialQuery);
  const [isFocused, setIsFocused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const router = useRouter();

  const searchRepo = useSearchProfiles(searchQuery, {}, hasSearched); // Only enabled after search is performed, uses committed searchQuery
  const suggestionsRepo = useSearchSuggestions(query, isFocused);

  const performSearch = () => {
    setHasSearched(true);
    setSearchQuery(query);
  };

  const performanceResults: Profile[] = searchRepo.data || [];
  const results = performanceResults;
  const loading = searchRepo.isFetching;
  const isLoadingSuggestions = suggestionsRepo.isFetching;
  const suggestions = suggestionsRepo.data || [];

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    performSearch();
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
                              <Link href={`/u/${suggestion.username}`} onMouseDown={(e) => e.preventDefault()}>
                                <Avatar className="w-9 h-9 border border-border/50 hover:opacity-80 transition-opacity">
                                  <AvatarImage src={suggestion.avatar_url || ""} />
                                  <AvatarFallback className="bg-primary/5">
                                    <User className="w-4 h-4 text-primary/30" />
                                  </AvatarFallback>
                                </Avatar>
                              </Link>
                              <div className="flex-1 min-w-0" onMouseDown={(e) => {
                                e.preventDefault();
                                router.push(`/u/${suggestion.username}`);
                              }}>
                                <div className="flex items-center gap-1.5">
                                  <p className="font-bold text-sm truncate hover:text-primary transition-colors cursor-pointer">
                                    {suggestion.full_name || suggestion.username}
                                  </p>
                                  {suggestion.is_verified && (
                                    <div className="w-3 h-3 rounded-full bg-blue-500 flex items-center justify-center shrink-0">
                                      <svg className="w-1.5 h-1.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                                      </svg>
                                    </div>
                                  )}
                                </div>
                                {suggestion.username && (
                                  <p className="text-[11px] text-muted-foreground truncate hover:text-primary transition-colors cursor-pointer">
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
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          {loading ? (
            <SearchSkeleton />
          ) : results.length > 0 ? (
            <div className="bg-card/40 border border-border/50 rounded-2xl md:rounded-3xl overflow-hidden divide-y divide-border/20">
              {results.map((profile) => (
                <div 
                  key={profile.id} 
                  className="group flex items-center gap-3 md:gap-4 p-3 md:p-4 hover:bg-primary/[0.02] transition-all duration-200"
                >
                  <Link 
                    href={`/u/${profile.username}`}
                    className="flex-1 flex items-center gap-3 md:gap-4 min-w-0 group/info"
                  >
                    <div className="relative shrink-0">
                      <Avatar className="w-12 h-12 md:w-14 h-14 border border-border/50 shadow-sm group-hover/info:opacity-80 transition-opacity">
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
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <h3 className="font-bold text-sm md:text-base truncate group-hover/info:text-primary transition-colors">
                          {profile.full_name || "Guest User"}
                        </h3>
                        {profile.is_verified && (
                          <div className="w-3.5 h-3.5 rounded-full bg-blue-500 flex items-center justify-center shrink-0">
                            <svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                      </div>
                      
                      {profile.username && (
                        <p className="text-[12px] md:text-[13px] font-medium text-primary/60 mb-1 group-hover/info:text-primary transition-colors">
                          @{profile.username}
                        </p>
                      )}
                      
                      {profile.bio && (
                        <p className="text-[11px] md:text-xs text-muted-foreground line-clamp-1 leading-tight max-w-[90%] font-medium">
                          {profile.bio}
                        </p>
                      )}
                    </div>
                  </Link>
                  
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
    <Suspense fallback={<SearchSkeleton />}>
      <SearchContent />
    </Suspense>
  );
}
