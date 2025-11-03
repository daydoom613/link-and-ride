import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Leaf, Car, Award, TrendingUp, Plus, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const Dashboard = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [ecoImpact, setEcoImpact] = useState({
    totalRides: 0,
    co2Saved: 0,
    fuelSaved: 0,
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
        return;
      }
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate("/auth");
      }
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (session?.user) {
      fetchProfileAndData();
    }
  }, [session]);

  const fetchProfileAndData = async () => {
    try {
      // Fetch profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session?.user.id)
        .single();

      setProfile(profileData);

      // Fetch eco impact
      const { data: impactData } = await supabase
        .from("eco_impacts")
        .select("*")
        .eq("user_id", session?.user.id);

      if (impactData) {
        const totalCO2 = impactData.reduce((sum, item) => sum + (item.co2_saved_kg || 0), 0);
        const totalFuel = impactData.reduce((sum, item) => sum + (item.fuel_saved_liters || 0), 0);
        
        setEcoImpact({
          totalRides: impactData.length,
          co2Saved: Math.round(totalCO2 * 10) / 10,
          fuelSaved: Math.round(totalFuel * 10) / 10,
        });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 pt-24 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-24 pb-12">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            Welcome back, {profile?.full_name || "Rider"}! 👋
          </h1>
          <p className="text-muted-foreground text-lg">
            Ready to share or find a ride today?
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <Button
            size="lg"
            className="h-24 bg-gradient-to-r from-primary to-accent hover:opacity-90 text-lg"
            onClick={() => navigate("/rides/create")}
          >
            <Plus className="mr-2 h-6 w-6" />
            Offer a Ride
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="h-24 text-lg border-2 hover:bg-secondary"
            onClick={() => navigate("/rides")}
          >
            <Car className="mr-2 h-6 w-6" />
            Find a Ride
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="border-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Leaf className="h-4 w-4 text-primary" />
                CO₂ Saved
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{ecoImpact.co2Saved} kg</div>
              <p className="text-xs text-muted-foreground mt-1">
                Equivalent to {Math.round(ecoImpact.co2Saved / 2.3)} trees
              </p>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Car className="h-4 w-4 text-accent" />
                Total Rides
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{profile?.total_rides_shared + profile?.total_rides_taken || 0}</div>
              <div className="flex gap-2 mt-1">
                <Badge variant="secondary">{profile?.total_rides_shared || 0} shared</Badge>
                <Badge variant="outline">{profile?.total_rides_taken || 0} taken</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Award className="h-4 w-4 text-yellow-500" />
                Reward Points
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">{profile?.reward_points || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Redeem for campus perks</p>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                Fuel Saved
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-accent">{ecoImpact.fuelSaved}L</div>
              <p className="text-xs text-muted-foreground mt-1">
                ~₹{Math.round(ecoImpact.fuelSaved * 100)} saved
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity Section */}
        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Upcoming Rides</CardTitle>
              <CardDescription>Manage your scheduled rides</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Car className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No upcoming rides yet</p>
                <Button variant="link" className="mt-2" onClick={() => navigate("/rides")}>
                  Find a ride now
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Communities</CardTitle>
              <CardDescription>Join groups with similar interests</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Explore communities to connect with others</p>
                <Button variant="link" className="mt-2" onClick={() => navigate("/communities")}>
                  Browse communities
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
