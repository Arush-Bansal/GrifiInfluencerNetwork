import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Zap, Users, TrendingUp, Bot } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b-2 border-border bg-background sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xl">G</span>
            </div>
            <span className="text-2xl font-bold tracking-tight">GRIFI</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/auth">
              <Button variant="outline" className="border-2">Log In</Button>
            </Link>
            <Link href="/auth?mode=signup">
              <Button className="shadow-sm hover:shadow-md transition-shadow">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block mb-6 px-4 py-2 bg-secondary border-2 border-border shadow-xs">
            <span className="font-mono text-sm">AI-POWERED SPONSORSHIP MATCHING</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-tight">
            WE BRING<br />
            <span className="bg-primary text-primary-foreground px-4 py-1">SPONSORS</span><br />
            TO INFLUENCERS
          </h1>
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Grifi uses artificial intelligence to match influencers with perfect brand sponsors. 
            Stop searching. Start earning.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth?mode=signup">
              <Button size="lg" className="text-lg px-8 py-6 shadow-md hover:shadow-lg transition-shadow">
                Join as Influencer
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-2">
              I'm a Brand
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="bg-secondary border-y-2 border-border py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">HOW IT WORKS</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard
              icon={<Users className="w-8 h-8" />}
              title="Create Profile"
              description="Sign up and build your influencer profile with your niche, audience, and content style."
            />
            <FeatureCard
              icon={<Bot className="w-8 h-8" />}
              title="AI Analysis"
              description="Our AI analyzes your profile and engagement to understand your unique value."
            />
            <FeatureCard
              icon={<Zap className="w-8 h-8" />}
              title="Smart Matching"
              description="Get matched with brands that align perfectly with your audience and content."
            />
            <FeatureCard
              icon={<TrendingUp className="w-8 h-8" />}
              title="Earn More"
              description="Close deals faster and earn more with AI-optimized sponsorship rates."
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-3 gap-8 text-center">
          <div className="p-8 border-2 border-border bg-background shadow-sm">
            <div className="text-5xl font-bold mb-2">10K+</div>
            <div className="text-muted-foreground">Influencers</div>
          </div>
          <div className="p-8 border-2 border-border bg-background shadow-sm">
            <div className="text-5xl font-bold mb-2">500+</div>
            <div className="text-muted-foreground">Brand Partners</div>
          </div>
          <div className="p-8 border-2 border-border bg-background shadow-sm">
            <div className="text-5xl font-bold mb-2">$5M+</div>
            <div className="text-muted-foreground">Deals Closed</div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary text-primary-foreground py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">READY TO GROW?</h2>
          <p className="text-xl mb-8 opacity-90 max-w-xl mx-auto">
            Join thousands of influencers already using Grifi to land their dream sponsorships.
          </p>
          <Link href="/auth?mode=signup">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-6 shadow-md">
              Start Free Today
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t-2 border-border py-8">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold">G</span>
            </div>
            <span className="font-bold">GRIFI</span>
          </div>
          <div className="text-muted-foreground text-sm">
            © 2024 Grifi. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => (
  <div className="p-6 bg-background border-2 border-border shadow-sm hover:shadow-md transition-shadow">
    <div className="w-14 h-14 bg-primary text-primary-foreground flex items-center justify-center mb-4">
      {icon}
    </div>
    <h3 className="text-xl font-bold mb-2">{title}</h3>
    <p className="text-muted-foreground">{description}</p>
  </div>
);

export default Index;
