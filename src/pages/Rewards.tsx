import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award, Gift, TrendingUp, Star } from "lucide-react";
import { format } from "date-fns";

const Rewards = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      setProfile(profileData);

      const { data: transData } = await supabase
        .from("reward_transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      setTransactions(transData || []);
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
        <div className="container mx-auto px-4 pt-24 flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Rewards & Points</h1>
            <p className="text-muted-foreground text-lg">
              Earn points and redeem for campus perks
            </p>
          </div>

          {/* Points Balance */}
          <Card className="mb-8 bg-gradient-to-r from-primary/10 to-accent/10 border-2">
            <CardContent className="pt-6">
              <div className="text-center">
                <Award className="h-16 w-16 mx-auto mb-4 text-yellow-500" />
                <h2 className="text-5xl font-bold text-yellow-600 mb-2">
                  {profile?.reward_points || 0}
                </h2>
                <p className="text-lg text-muted-foreground">Total Points</p>
              </div>
            </CardContent>
          </Card>

          {/* How to Earn */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                How to Earn Points
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <Star className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <h3 className="font-semibold mb-1">Complete a Ride</h3>
                  <Badge variant="secondary">+10 points</Badge>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <Gift className="h-8 w-8 mx-auto mb-2 text-accent" />
                  <h3 className="font-semibold mb-1">Refer a Friend</h3>
                  <Badge variant="secondary">+50 points</Badge>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <Award className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
                  <h3 className="font-semibold mb-1">5-Star Rating</h3>
                  <Badge variant="secondary">+5 points</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reward Perks */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="h-5 w-5" />
                Available Perks
              </CardTitle>
              <CardDescription>Redeem your points for these rewards</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted transition-colors">
                  <div>
                    <h3 className="font-semibold">Campus Cafe - Free Coffee</h3>
                    <p className="text-sm text-muted-foreground">Any regular beverage</p>
                  </div>
                  <Badge variant="outline" className="text-lg px-4 py-2">100 pts</Badge>
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted transition-colors">
                  <div>
                    <h3 className="font-semibold">Library - Extended Hours Pass</h3>
                    <p className="text-sm text-muted-foreground">24-hour access for 1 week</p>
                  </div>
                  <Badge variant="outline" className="text-lg px-4 py-2">200 pts</Badge>
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted transition-colors">
                  <div>
                    <h3 className="font-semibold">Bookstore - 10% Discount</h3>
                    <p className="text-sm text-muted-foreground">Valid on any purchase</p>
                  </div>
                  <Badge variant="outline" className="text-lg px-4 py-2">150 pts</Badge>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted transition-colors">
                  <div>
                    <h3 className="font-semibold">Sports Complex - Free Entry</h3>
                    <p className="text-sm text-muted-foreground">1 week unlimited access</p>
                  </div>
                  <Badge variant="outline" className="text-lg px-4 py-2">250 pts</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Transaction History */}
          <Card>
            <CardHeader>
              <CardTitle>Points History</CardTitle>
              <CardDescription>Your recent point transactions</CardDescription>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Award className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No transactions yet</p>
                  <p className="text-sm">Start earning by completing rides!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {transactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{transaction.reason}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(transaction.created_at), "PPp")}
                        </p>
                      </div>
                      <Badge
                        variant={transaction.points > 0 ? "default" : "secondary"}
                        className="text-lg px-3"
                      >
                        {transaction.points > 0 ? "+" : ""}
                        {transaction.points}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Rewards;
