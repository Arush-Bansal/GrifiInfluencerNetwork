"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Search as SearchIcon, ArrowLeft, User, Loader2 } from "lucide-react";

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
  const router = useRouter();
  const { toast } = useToast();

  // Function to perform the search
  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setHasSearched(true);
    setResults([]);

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, username, avatar_url, bio")
        .or(`full_name.ilike.%${searchQuery}%,username.ilike.%${searchQuery}%`)
        .limit(20);

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
      {/* Header */}
      <header className="bg-background border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-semibold tracking-tight">Search Users</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Find People</CardTitle>
          </CardHeader>
          <CardContent>
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
                  <Button variant="outline" size="sm">
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
