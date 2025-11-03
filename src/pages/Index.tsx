import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Car, Users, Leaf, Award, TrendingDown, Shield } from "lucide-react";
import Navbar from "@/components/Navbar";
import heroImage from "@/assets/hero-carpooling.jpg";

const Index = () => {
  const features = [
    {
      icon: Car,
      title: "Smart Matching",
      description: "AI-powered ride matching based on routes, timing, and preferences",
    },
    {
      icon: Users,
      title: "Community-Focused",
      description: "Join communities and connect with like-minded campus members",
    },
    {
      icon: Leaf,
      title: "Eco-Impact Tracking",
      description: "See your contribution to reducing carbon emissions and fuel waste",
    },
    {
      icon: Award,
      title: "Rewards & Gamification",
      description: "Earn points and redeem them for campus perks and benefits",
    },
    {
      icon: TrendingDown,
      title: "Cost Savings",
      description: "Split fuel costs and save money on daily commutes",
    },
    {
      icon: Shield,
      title: "Safe & Verified",
      description: "Campus-only access with verified users and safety features",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                Share Rides,{" "}
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Save Planet
                </span>
              </h1>
              <p className="text-xl text-muted-foreground">
                Join the campus ride-sharing revolution. Connect with fellow students and staff,
                reduce your carbon footprint, and make every commute count.
              </p>
              <div className="flex gap-4">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity shadow-lg"
                  asChild
                >
                  <Link to="/auth">
                    <Leaf className="mr-2 h-5 w-5" />
                    Start Sharing Rides
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/auth">Learn More</Link>
                </Button>
              </div>
              
              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 pt-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">2,500+</div>
                  <div className="text-sm text-muted-foreground">Active Users</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">10k+</div>
                  <div className="text-sm text-muted-foreground">Rides Shared</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">50 tons</div>
                  <div className="text-sm text-muted-foreground">CO₂ Saved</div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <img
                src={heroImage}
                alt="Students carpooling"
                className="rounded-2xl shadow-2xl w-full"
                style={{ boxShadow: "var(--shadow-eco)" }}
              />
              <div className="absolute -bottom-6 -right-6 bg-card p-6 rounded-xl shadow-lg border border-border">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <Leaf className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Your Impact Today</div>
                    <div className="text-2xl font-bold text-primary">-12kg CO₂</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-secondary/20">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Why Choose EcoRide?</h2>
            <p className="text-xl text-muted-foreground">
              Everything you need for safe, sustainable campus commuting
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="border-2 hover:border-primary transition-colors">
                  <CardContent className="p-6">
                    <div className="bg-gradient-to-br from-primary/10 to-accent/10 w-14 h-14 rounded-lg flex items-center justify-center mb-4">
                      <Icon className="h-7 w-7 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <Card className="bg-gradient-to-r from-primary to-accent p-12 text-center border-0">
            <CardContent className="space-y-6">
              <h2 className="text-4xl font-bold text-primary-foreground">
                Ready to Make a Difference?
              </h2>
              <p className="text-xl text-primary-foreground/90 max-w-2xl mx-auto">
                Join thousands of students making their daily commute more sustainable,
                social, and cost-effective.
              </p>
              <Button
                size="lg"
                variant="secondary"
                className="bg-background hover:bg-background/90"
                asChild
              >
                <Link to="/auth">
                  Create Your Account
                  <Leaf className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4">
        <div className="container mx-auto text-center text-muted-foreground">
          <p>© 2025 EcoRide Campus. Making campuses greener, one ride at a time.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
