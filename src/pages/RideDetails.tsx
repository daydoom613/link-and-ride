import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Calendar, MapPin, Users, Car, Clock, AlertCircle, Star } from "lucide-react";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import RideMap from "@/components/RideMap";
import ChatPanel from "@/components/ChatPanel";

const RideDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [ride, setRide] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [seatsToBook, setSeatsToBook] = useState(1);
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    fetchRideDetails();
    fetchCurrentUser();
  }, [id]);

  const fetchCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      setCurrentUser(data);
    }
  };

  const fetchRideDetails = async () => {
    try {
      const { data, error } = await supabase
        .from("rides")
        .select(`
          *,
          profiles:sharer_id (
            id,
            full_name,
            avatar_url,
            rating,
            total_ratings,
            bio,
            phone
          ),
          ride_bookings (
            id,
            rider_id,
            seats_booked,
            status,
            profiles:rider_id (
              full_name,
              avatar_url
            )
          )
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      setRide(data);
    } catch (error) {
      console.error("Error fetching ride:", error);
      toast({
        title: "Error loading ride",
        description: "Could not load ride details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async () => {
    if (!currentUser) {
      navigate("/auth");
      return;
    }

    if (seatsToBook > ride.available_seats) {
      toast({
        title: "Not enough seats",
        description: "Please select fewer seats",
        variant: "destructive",
      });
      return;
    }

    setBooking(true);
    try {
      const { error } = await supabase.from("ride_bookings").insert({
        ride_id: ride.id,
        rider_id: currentUser.id,
        seats_booked: seatsToBook,
        status: "pending",
      });

      if (error) throw error;

      // Update available seats
      await supabase
        .from("rides")
        .update({ available_seats: ride.available_seats - seatsToBook })
        .eq("id", ride.id);

      // Send notification to driver
      await supabase.rpc('send_ride_notification', {
        p_user_id: ride.sharer_id,
        p_ride_id: ride.id,
        p_booking_id: null,
        p_type: 'booking_request',
        p_title: 'New Booking Request',
        p_message: `${currentUser.full_name} wants to book ${seatsToBook} seat(s) for your ride from ${ride.origin} to ${ride.destination}`
      });

      toast({
        title: "Booking successful! 🎉",
        description: "Your booking request has been sent to the driver",
      });

      fetchRideDetails();
    } catch (error: any) {
      toast({
        title: "Booking failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setBooking(false);
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

  if (!ride) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 pt-24 text-center">
          <AlertCircle className="h-16 w-16 mx-auto mb-4 text-destructive" />
          <h2 className="text-2xl font-bold mb-2">Ride not found</h2>
          <Button onClick={() => navigate("/rides")}>Browse Rides</Button>
        </div>
      </div>
    );
  }

  const isOwner = currentUser?.id === ride.sharer_id;
  const alreadyBooked = ride.ride_bookings?.some((b: any) => b.rider_id === currentUser?.id);

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
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
          ← Back
        </Button>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Details */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl">Ride Details</CardTitle>
                    <CardDescription>Journey information</CardDescription>
                  </div>
                  <Badge variant="secondary" className="text-lg capitalize px-4 py-2">
                    {ride.vehicle_type}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <p className="font-semibold text-lg">{ride.origin}</p>
                      <p className="text-sm text-muted-foreground">Starting point</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 ml-2">
                    <div className="h-8 w-0.5 bg-border"></div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-accent mt-1" />
                    <div>
                      <p className="font-semibold text-lg">{ride.destination}</p>
                      <p className="text-sm text-muted-foreground">Destination</p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">{format(new Date(ride.departure_time), "PPP")}</p>
                      <p className="text-sm text-muted-foreground">Date</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">{format(new Date(ride.departure_time), "p")}</p>
                      <p className="text-sm text-muted-foreground">Time</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-accent" />
                    <div>
                      <p className="font-medium">{ride.available_seats} / {ride.total_seats} available</p>
                      <p className="text-sm text-muted-foreground">Seats</p>
                    </div>
                  </div>

                  {ride.price_per_seat && (
                    <div className="flex items-center gap-3">
                      <Car className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium text-lg text-primary">₹{ride.price_per_seat}</p>
                        <p className="text-sm text-muted-foreground">Per seat</p>
                      </div>
                    </div>
                  )}
                </div>

                {ride.preferred_mood && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm font-medium mb-2">Ride Mood</p>
                      <Badge variant="outline" className="capitalize">{ride.preferred_mood}</Badge>
                    </div>
                  </>
                )}

                {ride.notes && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm font-medium mb-2">Additional Notes</p>
                      <p className="text-muted-foreground">{ride.notes}</p>
                    </div>
                  </>
                )}

                <div className="flex flex-wrap gap-2">
                  {ride.is_wheelchair_accessible && (
                    <Badge variant="secondary">♿ Wheelchair Accessible</Badge>
                  )}
                  {ride.is_women_only && (
                    <Badge variant="secondary">👩 Women Only</Badge>
                  )}
                  {ride.is_recurring && (
                    <Badge variant="secondary">🔄 Recurring</Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Map Card */}
            <Card>
              <CardHeader>
                <CardTitle>Route Map</CardTitle>
                <CardDescription>Visual route overview</CardDescription>
              </CardHeader>
              <CardContent>
                <RideMap 
                  origin={ride.origin}
                  destination={ride.destination}
                  originCoords={ride.origin_lat && ride.origin_lng ? [ride.origin_lng, ride.origin_lat] : undefined}
                  destCoords={ride.destination_lat && ride.destination_lng ? [ride.destination_lng, ride.destination_lat] : undefined}
                  height="300px"
                />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Driver Card */}
            <Card>
              <CardHeader>
                <CardTitle>Driver</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-2xl font-bold">
                    {ride.profiles?.full_name?.charAt(0) || "U"}
                  </div>
                  <div>
                    <p className="font-semibold text-lg">{ride.profiles?.full_name}</p>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span>{formatRating(ride.profiles?.rating)}</span>
                      <span>({ride.profiles?.total_ratings || 0} reviews)</span>
                    </div>
                  </div>
                </div>
                {ride.profiles?.bio && (
                  <p className="text-sm text-muted-foreground">{ride.profiles.bio}</p>
                )}
              </CardContent>
            </Card>

            {/* Booking & Chat Card */}
            {!isOwner && (
              <Card>
                <CardHeader>
                  <CardTitle>Book This Ride</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {ride.available_seats > 0 ? (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="seats">Number of Seats</Label>
                        <Input
                          id="seats"
                          type="number"
                          min="1"
                          max={ride.available_seats}
                          value={seatsToBook}
                          onChange={(e) => setSeatsToBook(parseInt(e.target.value))}
                        />
                      </div>
                      {ride.price_per_seat && (
                        <div className="p-3 bg-muted rounded-lg">
                          <p className="text-sm text-muted-foreground">Total Cost</p>
                          <p className="text-2xl font-bold text-primary">
                            ₹{(ride.price_per_seat * seatsToBook).toFixed(2)}
                          </p>
                        </div>
                      )}
                      {alreadyBooked ? (
                        <Button className="w-full" disabled>
                          Already Booked
                        </Button>
                      ) : (
                        <Button
                          className="w-full"
                          onClick={handleBooking}
                          disabled={booking}
                        >
                          {booking ? "Booking..." : "Book Now"}
                        </Button>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-muted-foreground">No seats available</p>
                    </div>
                  )}
                  <div className="pt-2">
                    <Button variant="secondary" className="w-full" onClick={() => setShowChat(true)}>
                      Message Driver
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Passengers List */}
            {ride.ride_bookings && ride.ride_bookings.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Passengers ({ride.ride_bookings.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {ride.ride_bookings.map((booking: any) => (
                      <div key={booking.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-sm font-bold">
                            {booking.profiles?.full_name?.charAt(0) || "U"}
                          </div>
                          <span className="text-sm font-medium">{booking.profiles?.full_name}</span>
                        </div>
                        <Badge variant="outline">{booking.seats_booked} seat(s)</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
        {showChat && (
          <div className="fixed inset-0 bg-black/30 flex items-end md:items-center justify-center z-50">
            <div className="bg-background w-full md:max-w-lg md:rounded-lg md:shadow-xl">
              <ChatPanel rideId={ride.id} otherUserId={ride.sharer_id} onClose={() => setShowChat(false)} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RideDetails;
