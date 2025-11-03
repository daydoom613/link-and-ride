import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Car, Calendar, MapPin, Users, DollarSign } from "lucide-react";
import RideMap from "@/components/RideMap";

const CreateRide = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  const [formData, setFormData] = useState({
    origin: "",
    destination: "",
    departureTime: "",
    availableSeats: 1,
    vehicleType: "car" as any,
    pricePerSeat: "",
    preferredMood: "chatty" as any,
    notes: "",
    isRecurring: false,
    isWheelchairAccessible: false,
    isWomenOnly: false,
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }

    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    setProfile(data);
    
    if (data?.vehicle_type) {
      setFormData(prev => ({ ...prev, vehicleType: data.vehicle_type }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("rides").insert({
        sharer_id: user.id,
        origin: formData.origin,
        destination: formData.destination,
        departure_time: formData.departureTime,
        available_seats: formData.availableSeats,
        total_seats: formData.availableSeats,
        vehicle_type: formData.vehicleType,
        price_per_seat: formData.pricePerSeat ? parseFloat(formData.pricePerSeat) : null,
        preferred_mood: formData.preferredMood,
        notes: formData.notes,
        is_recurring: formData.isRecurring,
        is_wheelchair_accessible: formData.isWheelchairAccessible,
        is_women_only: formData.isWomenOnly,
        status: "scheduled",
      });

      if (error) throw error;

      toast({
        title: "Ride created successfully! 🎉",
        description: "Your ride has been posted and is now visible to others.",
      });

      navigate("/rides");
    } catch (error: any) {
      toast({
        title: "Error creating ride",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Offer a Ride</h1>
            <p className="text-muted-foreground text-lg">
              Share your journey and help reduce carbon emissions
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Ride Details</CardTitle>
              <CardDescription>Fill in the details about your ride</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Map Preview */}
                <div className="space-y-2">
                  <Label>Route Preview</Label>
                  <RideMap height="300px" />
                  <p className="text-xs text-muted-foreground">
                    Map visualization will be available once you enter pickup and destination addresses
                  </p>
                </div>
                
                <Separator />
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="origin">
                      <MapPin className="inline h-4 w-4 mr-1" />
                      Starting Point
                    </Label>
                    <Input
                      id="origin"
                      placeholder="e.g., Main Campus Gate"
                      value={formData.origin}
                      onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="destination">
                      <MapPin className="inline h-4 w-4 mr-1" />
                      Destination
                    </Label>
                    <Input
                      id="destination"
                      placeholder="e.g., City Center"
                      value={formData.destination}
                      onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="departureTime">
                      <Calendar className="inline h-4 w-4 mr-1" />
                      Departure Time
                    </Label>
                    <Input
                      id="departureTime"
                      type="datetime-local"
                      value={formData.departureTime}
                      onChange={(e) => setFormData({ ...formData, departureTime: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="availableSeats">
                      <Users className="inline h-4 w-4 mr-1" />
                      Available Seats
                    </Label>
                    <Input
                      id="availableSeats"
                      type="number"
                      min="1"
                      max="6"
                      value={formData.availableSeats}
                      onChange={(e) => setFormData({ ...formData, availableSeats: parseInt(e.target.value) })}
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="vehicleType">
                      <Car className="inline h-4 w-4 mr-1" />
                      Vehicle Type
                    </Label>
                    <Select
                      value={formData.vehicleType}
                      onValueChange={(value: any) => setFormData({ ...formData, vehicleType: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="car">Car</SelectItem>
                        <SelectItem value="bike">Bike</SelectItem>
                        <SelectItem value="scooter">Scooter</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pricePerSeat">
                      <DollarSign className="inline h-4 w-4 mr-1" />
                      Price per Seat (Optional)
                    </Label>
                    <Input
                      id="pricePerSeat"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="₹0"
                      value={formData.pricePerSeat}
                      onChange={(e) => setFormData({ ...formData, pricePerSeat: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="preferredMood">Ride Mood</Label>
                  <Select
                    value={formData.preferredMood}
                    onValueChange={(value: any) => setFormData({ ...formData, preferredMood: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="quiet">Quiet - Prefer silence</SelectItem>
                      <SelectItem value="chatty">Chatty - Love conversations</SelectItem>
                      <SelectItem value="music">Music - Enjoy tunes</SelectItem>
                      <SelectItem value="focus">Focus - Work/study mode</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Additional Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Any additional information about the ride..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="space-y-4 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="isWheelchairAccessible" className="cursor-pointer">
                      Wheelchair Accessible Vehicle
                    </Label>
                    <Switch
                      id="isWheelchairAccessible"
                      checked={formData.isWheelchairAccessible}
                      onCheckedChange={(checked) => setFormData({ ...formData, isWheelchairAccessible: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="isWomenOnly" className="cursor-pointer">
                      Women-Only Ride
                    </Label>
                    <Switch
                      id="isWomenOnly"
                      checked={formData.isWomenOnly}
                      onCheckedChange={(checked) => setFormData({ ...formData, isWomenOnly: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="isRecurring" className="cursor-pointer">
                      Recurring Ride (Same route regularly)
                    </Label>
                    <Switch
                      id="isRecurring"
                      checked={formData.isRecurring}
                      onCheckedChange={(checked) => setFormData({ ...formData, isRecurring: checked })}
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => navigate(-1)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1" disabled={loading}>
                    {loading ? "Creating..." : "Create Ride"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CreateRide;
