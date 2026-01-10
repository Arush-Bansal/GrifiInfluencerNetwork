"use client";

import { useAuth } from "@/hooks/use-auth";
import { useUpdateProfile, useCheckUsername } from "@/hooks/use-profile";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, Check, XCircle, LogOut } from "lucide-react";
import { ProfileSkeleton } from "@/components/skeletons";
import { supabase } from "@/integrations/supabase/client";

const ProfilePage = () => {
  const router = useRouter();
  const { toast } = useToast();
  const { user, profile: serverProfile, isLoading: initialLoading } = useAuth();
  
  const [username, setUsername] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (serverProfile) {
      setUsername(serverProfile.username || "");
    }
  }, [serverProfile]);

  const { data: usernameResult, isFetching: isCheckingUsername } = useCheckUsername(username, serverProfile?.username || undefined);
  const usernameStatus = isCheckingUsername ? 'checking' : 
                   (username === (serverProfile?.username || user?.user_metadata?.username) ? 'available' : 
                   (usernameResult?.available ? 'available' : (username.length >= 3 ? 'unavailable' : 'idle')));

  const updateProfileMutation = useUpdateProfile();

  useEffect(() => {
    if (!initialLoading && !user) {
      router.push("/auth");
    }
  }, [initialLoading, user, router]);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      router.push("/auth");
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    } catch (error: unknown) {
      const err = error as Error;
      toast({
        title: "Error logging out",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  const handleSave = async () => {
    if (!user) return;
    
    if (usernameStatus === 'unavailable') {
        toast({
            title: "Username Taken",
            description: "Please choose a different username before saving.",
            variant: "destructive"
        });
        return;
    }

    setSaving(true);

    try {
      await updateProfileMutation.mutateAsync({
        userId: user.id,
        updates: {
          ...serverProfile,
          username: username,
        },
        authUpdates: {
          username: username,
        }
      });

      toast({
        title: "Profile Updated",
        description: "Your username has been saved successfully.",
      });
    } catch (error: unknown) {
      const err = error as Error;
      console.error("Critical error saving profile:", err);
      toast({
        title: "Error",
        description: err.message || "Failed to update profile.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (initialLoading || !user) {
    return <ProfileSkeleton />;
  }

  return (
    <div className="container mx-auto px-4 py-8 lg:py-12 max-w-4xl">
      <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Account Settings</h1>
          <p className="text-muted-foreground mt-1">Manage your identity and session</p>
        </div>

        <div className="grid lg:grid-cols-5 gap-8 items-start">
          <div className="lg:col-span-3">
            <Card className="border-border/50 bg-background/50 backdrop-blur-sm shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Public Identity</CardTitle>
                <CardDescription>Update your username below. This is your public handle.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-sm font-medium">Username</Label>
                    <div className="relative">
                      <Input 
                        id="username" 
                        placeholder="username" 
                        value={username} 
                        onChange={(e) => {
                           const val = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '');
                           setUsername(val);
                        }} 
                        className={`h-11 transition-all duration-200 pr-10 ${
                          usernameStatus === 'unavailable' ? 'border-destructive focus-visible:ring-destructive' : 
                          usernameStatus === 'available' && username.length >= 3 ? 'border-green-500/50 focus-visible:ring-green-500/20' : ''
                        }`}
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        {isCheckingUsername && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                        {usernameStatus === 'available' && username.length >= 3 && <Check className="h-4 w-4 text-green-500" />}
                        {usernameStatus === 'unavailable' && <XCircle className="h-4 w-4 text-destructive" />}
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-[11px]">
                      <code className="text-muted-foreground bg-accent/50 px-1.5 py-0.5 rounded">
                        grifi.in/u/{username || "..."}
                      </code>
                      {usernameStatus === 'unavailable' && <span className="text-destructive font-semibold">Not available</span>}
                      {usernameStatus === 'available' && username.length >= 3 && <span className="text-green-600 font-semibold">Available!</span>}
                    </div>
                  </div>

                  <Button 
                    onClick={handleSave} 
                    disabled={saving || usernameStatus === 'unavailable' || username.length < 3 || username === serverProfile?.username} 
                    className="w-full h-11 font-bold transition-all shadow-md active:scale-[0.98]"
                  >
                    {saving ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    Save Username
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-4">
            <Card className="border-destructive/20 bg-destructive/5 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold text-destructive flex items-center gap-2 uppercase tracking-tight">
                  <LogOut className="w-4 h-4" />
                  Logout
                </CardTitle>
                <CardDescription className="text-xs">End your current session safely.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  variant="destructive" 
                  onClick={handleLogout}
                  className="w-full h-10 text-sm font-bold transition-all"
                >
                  Logout Session
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

