
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Instagram, Youtube, Twitter, Facebook, CheckCircle2, Link2, Loader2, AlertCircle } from "lucide-react";
import { User } from "@supabase/supabase-js";
import { Provider } from "@supabase/supabase-js";

interface SocialVerificationProps {
  user: User | null;
}

export const SocialVerification = ({ user }: SocialVerificationProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);

  // Helper to check if a provider is connected
  // Note: Supabase stores provider names in lowercase, e.g., 'google', 'facebook'
  const isVerified = (provider: string) => {
    return user?.identities?.some((identity) => identity.provider === provider);
  };

  const handleConnect = async (provider: Provider) => {
    setLoading(provider);
    try {
      // Use linkIdentity to link the new OAuth provider to the *currently logged in* user.
      // This is crucial for "verification" where we want to add a credential to the existing account.
      const { data, error } = await supabase.auth.linkIdentity({
        provider: provider,
        options: {
          redirectTo: `${window.location.origin}/dashboard/profile`,
          // Requesting readonly access to prove ownership
          scopes: provider === 'google' ? 'https://www.googleapis.com/auth/youtube.readonly' : undefined,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      // linkIdentity returns data.url if it needs to redirect (which it usually does for OAuth)
      if (data?.url) {
        window.location.href = data.url;
      }
      
      if (error) throw error;
      
    } catch (error: any) {
      console.error(`Error connecting ${provider}:`, error);
      
      let title = "Connection Failed";
      let description = error.message || "Could not initiate verification process.";

      // Handle specific Supabase configuration errors
      if (error.code === 'manual_linking_disabled' || error.message?.includes("Manual linking is disabled")) {
          title = "Configuration Required";
          description = "Please enable 'Manual Linking' in your Supabase Dashboard under Authentication > URL Configuration.";
      } else if (error.message?.includes("Unsupported provider") || error.message?.includes("provider is not enabled")) {
          title = "Provider Not Enabled";
          description = `The ${provider} login provider is not enabled in Supabase. Please enable it in Authentication > Providers.`;
      }

      toast({
        title,
        description,
        variant: "destructive",
      });
      setLoading(null);
    }
  };

  const platforms = [
    {
      name: "Instagram",
      // Instagram uses 'facebook' provider often for business accounts or 'instagram' if configured separately.
      // We'll assume 'facebook' for Graph API access which is common for influencers, 
      // but 'linkedin' or others are also valid providers. 
      // Let's stick to 'facebook' or 'instagram' based on Supabase config. 
      // For this generic implementation, we'll use 'facebook' as it's the most common way to auth Instagram Pros.
      provider: "facebook" as Provider, 
      icon: Instagram,
      color: "text-pink-600",
      description: "Verify ownership via Facebook/Instagram",
    },
    {
      name: "YouTube",
      provider: "google" as Provider,
      icon: Youtube,
      color: "text-red-600",
      description: "Verify channel ownership via Google",
    },
    {
        name: "Twitter / X",
        provider: "twitter" as Provider,
        icon: Twitter,
        color: "text-blue-400",
        description: "Verify account via Twitter",
      }
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <CardTitle>Verification Center</CardTitle>
        </div>
        <CardDescription>
          Connect your social accounts to verify ownership. Verified accounts receive a badge on their profile.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {platforms.map((platform) => {
          const verified = isVerified(platform.provider);
          const isLoading = loading === platform.provider;

          return (
            <div
              key={platform.name}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg bg-card hover:bg-secondary/20 transition-all gap-4"
            >
              <div className="flex items-center gap-4">
                <div className={`p-2.5 rounded-full bg-secondary ${platform.color} bg-opacity-10`}>
                  <platform.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${platform.color}`} />
                </div>
                <div>
                  <h3 className="font-semibold flex items-center gap-2 text-sm sm:text-base">
                    {platform.name}
                    {verified && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-800 uppercase tracking-tight">
                        Verified
                      </span>
                    )}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">{platform.description}</p>
                </div>
              </div>

              <div className="w-full sm:w-auto">
                {verified ? (
                  <div className="flex items-center justify-center sm:justify-end gap-2 text-green-600 font-bold text-xs sm:text-sm px-3 py-2 bg-green-50 rounded-md sm:bg-transparent sm:p-0">
                    <CheckCircle2 className="w-4 h-4" />
                    Connected
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    onClick={() => handleConnect(platform.provider)}
                    disabled={isLoading}
                    className="w-full sm:w-auto shadow-sm"
                    size="sm"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        <span className="sm:hidden">Connecting...</span>
                        <span className="hidden sm:inline">Connecting</span>
                      </>
                    ) : (
                      <>
                        <Link2 className="w-4 h-4 mr-2" />
                        Connect {platform.name}
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          );
        })}
        
        <div className="mt-4 space-y-3">
            <div className="p-3 bg-blue-50 text-blue-800 rounded-md flex gap-3 text-sm">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p>
                    Connecting your accounts allows us to verify you own the handles you claim. 
                    We will not post anything to your accounts.
                </p>
            </div>
            
            <div className="text-xs text-muted-foreground px-1">
                <p>Note: If you encounter a "Manual linking is disabled" error, please contact the administrator to enable this feature in the platform settings.</p>
            </div>
        </div>

      </CardContent>
    </Card>
  );
};
