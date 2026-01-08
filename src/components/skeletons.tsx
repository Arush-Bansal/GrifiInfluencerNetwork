import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function DashboardSkeleton() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-full overflow-hidden">
      <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">
        <div className="lg:col-span-8 space-y-6 sm:space-y-8 min-w-0">
          {/* Welcome Section Skeleton */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 sm:p-6 bg-accent/30 rounded-2xl border border-border/50">
            <div className="space-y-2 flex-1">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-64 md:w-80" />
            </div>
          </div>

          {/* Tabs Skeleton */}
          <div className="space-y-6">
            <div className="flex gap-8 border-b border-border pb-2">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-24" />
            </div>
            
            {/* Feed Items Skeleton */}
            {[1, 2, 3].map((i) => (
              <Card key={i} className="overflow-hidden border border-border/50 shadow-sm">
                <CardHeader className="flex flex-row items-center gap-4 pb-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-[90%]" />
                  <Skeleton className="h-4 w-[40%]" />
                  <Skeleton className="h-48 md:h-64 w-full rounded-xl mt-2" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Sidebar Skeleton */}
        <div className="lg:col-span-4 hidden lg:block space-y-6">
          <Card className="border border-border/50">
            <CardHeader className="pb-4">
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-6">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-3 w-[70%]" />
                    <Skeleton className="h-2 w-[40%]" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border border-border/50">
            <CardHeader>
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent className="space-y-4">
               <Skeleton className="h-20 w-full rounded-lg" />
               <Skeleton className="h-20 w-full rounded-lg" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export function CollabsSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-8 space-y-2">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-4 w-full max-w-md" />
      </div>

      <div className="space-y-8">
        <div className="flex gap-2 p-1 bg-muted/50 border rounded-lg overflow-hidden">
          <Skeleton className="h-10 flex-1 rounded-md" />
          <Skeleton className="h-10 flex-1 rounded-md" />
          <Skeleton className="h-10 flex-1 rounded-md" />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="flex flex-row items-center p-4 gap-4 border border-border/50">
              <Skeleton className="h-12 w-12 rounded-full shrink-0" />
              <div className="flex-1 space-y-2 min-w-0">
                <Skeleton className="h-4 w-[60%]" />
                <Skeleton className="h-3 w-[40%]" />
              </div>
              <Skeleton className="h-9 w-24 rounded-md shrink-0" />
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-secondary/30">
      <main className="container mx-auto px-4 py-8 space-y-8">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-10 w-48 sm:w-64" />
            <Skeleton className="h-4 w-64 sm:w-80" />
          </div>
          <Skeleton className="h-10 w-28 sm:w-32 rounded-lg" />
        </div>

        <Card className="border border-border/50">
          <CardHeader className="pb-4">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-full max-w-md" />
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="space-y-4">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-32 sm:h-40 w-full rounded-xl" />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-8 items-center sm:items-start pt-4 border-t border-border">
              <div className="flex flex-col items-center gap-3 shrink-0">
                <Skeleton className="h-24 w-24 sm:h-28 sm:w-28 rounded-full" />
                <Skeleton className="h-8 w-24 rounded-md" />
              </div>
              
              <div className="flex-1 space-y-6 w-full">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-24 w-full" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/50">
          <CardHeader>
             <Skeleton className="h-6 w-40" />
             <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
             <div className="grid md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((i) => (
                   <div key={i} className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-10 w-full" />
                   </div>
                ))}
             </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

export function SearchSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <main className="container max-w-3xl mx-auto px-4 py-8 md:py-10">
        <div className="mb-8 text-center space-y-3">
          <Skeleton className="h-10 w-48 mx-auto" />
          <Skeleton className="h-4 w-64 mx-auto" />
        </div>
        
        <div className="mb-8 p-3 bg-card border border-border/50 rounded-3xl h-16 flex items-center gap-3">
           <Skeleton className="h-10 w-10 rounded-2xl shrink-0" />
           <Skeleton className="h-10 flex-1 rounded-2xl" />
           <Skeleton className="h-10 w-24 rounded-2xl shrink-0" />
        </div>
        
        <div className="space-y-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex items-center gap-4 p-4 border border-border/10 rounded-2xl shadow-sm bg-card/40">
              <div className="relative shrink-0">
                <Skeleton className="h-12 w-12 md:h-14 md:w-14 rounded-full" />
                <Skeleton className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full" />
              </div>
              <div className="flex-1 space-y-2 min-w-0">
                <Skeleton className="h-5 w-[120px] md:w-[150px]" />
                <Skeleton className="h-3 w-[80px] md:w-[100px]" />
                <Skeleton className="h-3 w-[90%] max-w-[400px]" />
              </div>
              <Skeleton className="h-8 md:h-9 w-16 md:w-20 rounded-full shrink-0" />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export function PublicProfileSkeleton() {
  return (
    <div className="min-h-screen bg-background pb-20">
      <section className="relative h-48 md:h-64 bg-muted animate-pulse border-b border-border" />
      <div className="container mx-auto px-4 max-w-4xl relative">
        <Card className="border border-border shadow-sm -mt-20 relative z-10 bg-card rounded-xl">
          <CardContent className="pt-0 pb-10 px-6 md:px-12 text-center">
            <div className="relative -mt-16 mb-6 inline-block">
              <Skeleton className="w-32 h-32 rounded-full border-4 border-background shadow-md" />
            </div>
            <div className="space-y-4 mb-8 flex flex-col items-center">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-32" />
              <div className="flex gap-4 pt-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
            <div className="flex justify-center gap-3">
              <Skeleton className="h-10 w-32 rounded-lg" />
              <Skeleton className="h-10 w-32 rounded-lg" />
              <Skeleton className="h-10 w-10 rounded-lg" />
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-card p-6 rounded-lg border border-border text-center space-y-3 shadow-sm">
              <Skeleton className="h-8 w-8 mx-auto rounded-lg" />
              <Skeleton className="h-6 w-16 mx-auto" />
              <Skeleton className="h-3 w-20 mx-auto" />
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-12 mt-12">
          <div className="lg:col-span-2 space-y-12">
             <div className="space-y-4 text-left">
                <Skeleton className="h-6 w-32" />
                <div className="p-6 bg-muted border border-border rounded-lg">
                   <Skeleton className="h-20 w-full" />
                </div>
             </div>
             <div className="space-y-6 text-left">
                <Skeleton className="h-6 w-48" />
                <div className="space-y-4">
                   <Card className="p-6 border border-border bg-card">
                      <Skeleton className="h-4 w-24 mb-4" />
                      <Skeleton className="h-12 w-full" />
                   </Card>
                   <Card className="p-6 border border-border bg-card">
                      <Skeleton className="h-4 w-24 mb-4" />
                      <Skeleton className="h-12 w-full" />
                   </Card>
                </div>
             </div>
          </div>
          <div className="space-y-8">
             <Card className="border border-border shadow-sm bg-card rounded-xl overflow-hidden">
                <CardContent className="p-8 space-y-6">
                   <Skeleton className="h-6 w-32" />
                   <Skeleton className="h-4 w-48" />
                   <div className="space-y-2">
                      <Skeleton className="h-10 w-full rounded-lg" />
                      <Skeleton className="h-10 w-full rounded-lg" />
                   </div>
                   <Skeleton className="h-10 w-full rounded-lg" />
                </CardContent>
             </Card>
             <div className="p-8 bg-secondary/20 rounded-[2.5rem] border border-border/50 space-y-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-4 w-32" />
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function OnboardingSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/10 to-primary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-8 flex flex-col items-center">
        <Skeleton className="w-16 h-16 rounded-2xl rotate-3" />
        <Card className="w-full border-none shadow-2xl bg-card/80 backdrop-blur-xl">
          <CardHeader className="text-center space-y-4">
            <Skeleton className="h-10 w-[60%] mx-auto" />
            <Skeleton className="h-4 w-[80%] mx-auto" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-12 w-full rounded-xl" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-12 w-full rounded-xl" />
              </div>
            </div>
            <Skeleton className="h-12 w-full rounded-xl mt-4" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function CampaignListSkeleton() {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i} className="flex flex-col border-border/50 shadow-sm">
          <CardHeader className="space-y-4">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-8 rounded" />
                <div className="space-y-2">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-2 w-16" />
                </div>
              </div>
              <Skeleton className="h-5 w-12 rounded-full" />
            </div>
            <Skeleton className="h-6 w-full" />
          </CardHeader>
          <CardContent className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-[90%]" />
            <Skeleton className="h-4 w-[40%]" />
          </CardContent>
          <div className="p-4 border-t border-border/50 flex justify-between items-center bg-secondary/5">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-9 w-24 rounded-md" />
          </div>
        </Card>
      ))}
    </div>
  );
}

export function CampaignsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-2">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64 md:w-80" />
        </div>
        <Skeleton className="h-10 w-32 rounded-lg" />
      </div>

      <div className="flex gap-2 p-1 bg-muted/50 border border-border/50 rounded-lg w-fit">
        <Skeleton className="h-9 w-24 rounded-md" />
        <Skeleton className="h-9 w-32 rounded-md" />
      </div>

      <CampaignListSkeleton />
    </div>
  );
}
