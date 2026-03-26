import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, ShieldCheck, TrendingUp, Zap, Lock, Users, Award } from "lucide-react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useAllLoanListings, useAllBorrowRequests } from "../hooks/useQueries";

export default function HomePage() {
  const { identity, login } = useInternetIdentity();
  const { data: listings } = useAllLoanListings();
  const { data: requests } = useAllBorrowRequests();

  const activeListings = listings?.filter((l) => l.status === "available").length || 0;
  const activeRequests = requests?.filter((r) => r.status === "open").length || 0;

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-accent/5 border-b border-border">
        <div className="absolute inset-0 bg-grid-white/5 [mask-image:radial-gradient(white,transparent_70%)]" />
        <div className="container relative py-24 lg:py-32">
          <div className="max-w-3xl">
            <Badge className="mb-6 bg-accent/20 text-accent-foreground border-accent/30">
              Powered by Internet Computer
            </Badge>
            <h1 className="text-5xl lg:text-7xl font-display font-bold tracking-tight mb-6 bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
              Peer-to-Peer Lending
              <br />
              <span className="text-primary">Reimagined</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed max-w-2xl">
              Connect directly with lenders and borrowers. Cut out the middlemen. Earn competitive
              returns or access capital backed by crypto and commodity collateral.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              {identity ? (
                <>
                  <Link to="/create-loan-listing">
                    <Button size="lg" className="gap-2 text-base">
                      Start Lending
                      <ArrowRight className="h-5 w-5" />
                    </Button>
                  </Link>
                  <Link to="/create-borrow-request">
                    <Button size="lg" variant="outline" className="gap-2 text-base">
                      Borrow Now
                    </Button>
                  </Link>
                </>
              ) : (
                <Button size="lg" onClick={() => login()} className="gap-2 text-base">
                  Get Started
                  <ArrowRight className="h-5 w-5" />
                </Button>
              )}
              <Link to="/marketplace">
                <Button size="lg" variant="ghost" className="text-base">
                  Explore Marketplace
                </Button>
              </Link>
            </div>

            {/* Stats */}
            {identity && (
              <div className="mt-12 grid grid-cols-2 gap-6 max-w-md">
                <div>
                  <div className="text-4xl font-display font-bold text-primary">
                    {activeListings}
                  </div>
                  <div className="text-sm text-muted-foreground">Active Loan Offers</div>
                </div>
                <div>
                  <div className="text-4xl font-display font-bold text-accent">
                    {activeRequests}
                  </div>
                  <div className="text-sm text-muted-foreground">Borrow Requests</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Value Propositions */}
      <section className="container py-20 lg:py-28">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-display font-bold mb-4">
            Why Choose LendChain
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Transparent, secure, and decentralized lending built on blockchain technology
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardHeader>
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <ShieldCheck className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-xl font-display">Trustless & Secure</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                All loans secured by collateral. Smart contracts ensure automatic execution and
                transparency.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-accent/50 transition-colors">
            <CardHeader>
              <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6 text-accent" />
              </div>
              <CardTitle className="text-xl font-display">Competitive Returns</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Lenders earn higher interest rates by cutting out traditional banking intermediaries.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-success/50 transition-colors">
            <CardHeader>
              <div className="h-12 w-12 rounded-xl bg-success/10 flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-success" />
              </div>
              <CardTitle className="text-xl font-display">Fast Access</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Borrowers get instant access to capital without lengthy approval processes or credit
                checks.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-warning/50 transition-colors">
            <CardHeader>
              <div className="h-12 w-12 rounded-xl bg-warning/10 flex items-center justify-center mb-4">
                <Lock className="h-6 w-6 text-warning" />
              </div>
              <CardTitle className="text-xl font-display">Collateral Backed</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Support for top cryptocurrencies and precious metals as collateral. Your funds are
                protected.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardHeader>
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-xl font-display">Trust Scores</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Built-in reputation system rewards reliable borrowers and lenders with better terms.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-accent/50 transition-colors">
            <CardHeader>
              <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
                <Award className="h-6 w-6 text-accent" />
              </div>
              <CardTitle className="text-xl font-display">Gamification</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Earn badges and increase your reputation to unlock better rates and higher limits.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-y border-border bg-muted/30">
        <div className="container py-20">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl lg:text-5xl font-display font-bold mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join the decentralized lending revolution. Connect your Internet Identity and start
              lending or borrowing in minutes.
            </p>
            {identity ? (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/marketplace">
                  <Button size="lg" className="gap-2">
                    Browse Marketplace
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/dashboard">
                  <Button size="lg" variant="outline">
                    Go to Dashboard
                  </Button>
                </Link>
              </div>
            ) : (
              <Button size="lg" onClick={() => login()} className="gap-2">
                Connect Wallet
                <ArrowRight className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
