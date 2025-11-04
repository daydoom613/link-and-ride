import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, MapPin, Users, Car, Search, Filter } from "lucide-react";
import { format } from "date-fns";

const Rides = () => {
  const navigate = useNavigate();
  const [rides, setRides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterVehicle, setFilterVehicle] = useState<string>("all");
  const [filterMood, setFilterMood] = useState<string>("all");
  const [recommended, setRecommended] = useState<any[]>([]);

  useEffect(() => {
    fetchRides();
  }, []);

  const fetchRides = async () => {
    try {
      const { data, error } = await supabase
        .from("rides")
        .select(`
          *,
          profiles:sharer_id (
            full_name,
            avatar_url,
            rating
          )
        `)
        .eq("status", "scheduled")
        .gte("departure_time", new Date().toISOString())
        .order("departure_time", { ascending: true });

      if (error) throw error;
      const items = data || [];
      setRides(items);
      // naive recommendation: earlier departure + more seats
      const scored = [...items]
        .map(r => ({
          r,
          score: (new Date(r.departure_time).getTime() - Date.now()) / 1000 + (r.available_seats || 0) * -300
        }))
        .sort((a,b) => a.score - b.score)
        .slice(0, 3)
        .map(s => s.r);
      setRecommended(scored);
    } catch (error) {
      console.error("Error fetching rides:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRides = rides.filter((ride) => {
    const matchesSearch =
      searchQuery === "" ||
      ride.origin.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ride.destination.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesVehicle = filterVehicle === "all" || ride.vehicle_type === filterVehicle;
    const matchesMood = filterMood === "all" || ride.preferred_mood === filterMood;

    return matchesSearch && matchesVehicle && matchesMood;
  });

  const formatRating = (value: any): string => {
    if (value === null || value === undefined) return "New";
    const num = typeof value === 'number' ? value : parseFloat(value);
    if (Number.isNaN(num)) return "New";
    return num.toFixed(1);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Find a Ride</h1>
          <p className="text-muted-foreground text-lg">
            Browse available rides and book your journey
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Search & Filter
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search origin or destination..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={filterVehicle} onValueChange={setFilterVehicle}>
                <SelectTrigger>
                  <SelectValue placeholder="Vehicle Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Vehicles</SelectItem>
                  <SelectItem value="car">Car</SelectItem>
                  <SelectItem value="bike">Bike</SelectItem>
                  <SelectItem value="scooter">Scooter</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterMood} onValueChange={setFilterMood}>
                <SelectTrigger>
                  <SelectValue placeholder="Mood Preference" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Moods</SelectItem>
                  <SelectItem value="quiet">Quiet</SelectItem>
                  <SelectItem value="chatty">Chatty</SelectItem>
                  <SelectItem value="music">Music Lover</SelectItem>
                  <SelectItem value="focus">Focus Mode</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Recommended */}
        {recommended.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Recommended for you</CardTitle>
              <CardDescription>Based on upcoming time and seat availability</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                {recommended.map((ride) => (
                  <div key={ride.id} className="p-4 border rounded-lg cursor-pointer hover:bg-muted/40"
                       onClick={() => navigate(`/rides/${ride.id}`)}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium">{ride.origin} → {ride.destination}</div>
                      <Badge className="capitalize" variant="secondary">{ride.vehicle_type}</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {format(new Date(ride.departure_time), "PPp")} • {ride.available_seats} seats
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Rides List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading rides...</p>
          </div>
        ) : filteredRides.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Car className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-semibold mb-2">No rides found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your filters or be the first to offer a ride!
              </p>
              <Button onClick={() => navigate("/rides/create")}>Offer a Ride</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRides.map((ride) => (
              <Card key={ride.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(`/rides/${ride.id}`)}>
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold">
                        {ride.profiles?.full_name?.charAt(0) || "U"}
                      </div>
                      <div>
                        <p className="font-semibold">{ride.profiles?.full_name}</p>
                        <p className="text-xs text-muted-foreground">⭐ {formatRating(ride.profiles?.rating)}</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="capitalize">
                      {ride.vehicle_type}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                    <div className="text-sm">
                      <p className="font-medium">{ride.origin}</p>
                      <p className="text-muted-foreground text-xs">to {ride.destination}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{format(new Date(ride.departure_time), "PPp")}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-accent" />
                    <span className="font-medium">{ride.available_seats} seats available</span>
                  </div>

                  {ride.preferred_mood && (
                    <Badge variant="outline" className="capitalize">
                      {ride.preferred_mood} ride
                    </Badge>
                  )}

                  {ride.price_per_seat && (
                    <p className="text-lg font-bold text-primary">
                      ₹{ride.price_per_seat}/seat
                    </p>
                  )}
                </CardContent>
                
                <CardFooter>
                  <Button className="w-full" onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/rides/${ride.id}`);
                  }}>
                    View Details
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Rides;
