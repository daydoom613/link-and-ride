import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { User, Mail, Phone, Car, Star, Award, Copy, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [referralCode, setReferralCode] = useState("");
  const [copied, setCopied] = useState(false);

  const [formData, setFormData] = useState<{
    full_name: string;
    phone: string;
    bio: string;
    gender: string;
    vehicle_type: string;
    vehicle_number: string;
    preferred_mood: string;
    flexibility_radius_km: number;
  }>({
    full_name: "",
    phone: "",
    bio: "",
    gender: "",
    vehicle_type: "",
    vehicle_number: "",
    preferred_mood: "",
    flexibility_radius_km: 2.0,
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
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

      if (data) {
        setProfile(data);
        setFormData({
          full_name: data.full_name || "",
          phone: data.phone || "",
          bio: data.bio || "",
          gender: data.gender || "",
          vehicle_type: data.vehicle_type || "",
          vehicle_number: data.vehicle_number || "",
          preferred_mood: data.preferred_mood || "",
          flexibility_radius_km: data.flexibility_radius_km || 2.0,
        });
        
        // Generate referral code (simple implementation)
        setReferralCode(user.id.substring(0, 8).toUpperCase());
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Filter out empty strings for enum fields
      const updateData: any = { ...formData };
      if (!updateData.gender) delete updateData.gender;
      if (!updateData.vehicle_type) delete updateData.vehicle_type;
      if (!updateData.preferred_mood) delete updateData.preferred_mood;

      const { error } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("id", user.id);

      if (error) throw error;

      toast({
        title: "Profile updated!",
        description: "Your profile has been saved successfully.",
      });

      fetchProfile();
    } catch (error: any) {
      toast({
        title: "Error updating profile",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const copyReferralCode = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    toast({
      title: "Copied!",
      description: "Referral code copied to clipboard",
    });
    setTimeout(() => setCopied(false), 2000);
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
            <h1 className="text-4xl font-bold mb-2">Your Profile</h1>
            <p className="text-muted-foreground text-lg">
              Manage your account settings and preferences
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Stats Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader className="text-center">
                  <div className="mx-auto h-24 w-24 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-4xl font-bold mb-4">
                    {profile?.full_name?.charAt(0) || "U"}
                  </div>
                  <CardTitle>{profile?.full_name}</CardTitle>
                  <CardDescription>{profile?.email}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Rating</span>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{profile?.rating?.toFixed(1) || "0.0"}</span>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total Ratings</span>
                    <span className="font-medium">{profile?.total_ratings || 0}</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Rides Shared</span>
                    <Badge variant="secondary">{profile?.total_rides_shared || 0}</Badge>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Rides Taken</span>
                    <Badge variant="outline">{profile?.total_rides_taken || 0}</Badge>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <Award className="h-4 w-4 text-yellow-500" />
                      Points
                    </span>
                    <span className="font-bold text-yellow-600">{profile?.reward_points || 0}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Referral Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Refer & Earn</CardTitle>
                  <CardDescription>Share your code</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Input value={referralCode} readOnly className="font-mono" />
                    <Button size="icon" variant="outline" onClick={copyReferralCode}>
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Earn 50 points for each referral!
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Main Form */}
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Edit Profile</CardTitle>
                  <CardDescription>Update your personal information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">
                      <User className="inline h-4 w-4 mr-1" />
                      Full Name
                    </Label>
                    <Input
                      id="full_name"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">
                      <Mail className="inline h-4 w-4 mr-1" />
                      Email (Read-only)
                    </Label>
                    <Input id="email" value={profile?.email} disabled />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">
                        <Phone className="inline h-4 w-4 mr-1" />
                        Phone Number
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+91 XXXXX XXXXX"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="gender">Gender</Label>
                      <Select
                        value={formData.gender}
                        onValueChange={(value) => setFormData({ ...formData, gender: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                          <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      placeholder="Tell others about yourself..."
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      rows={3}
                    />
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Car className="h-5 w-5" />
                      Vehicle Information
                    </h3>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="vehicle_type">Vehicle Type</Label>
                        <Select
                          value={formData.vehicle_type}
                          onValueChange={(value) => setFormData({ ...formData, vehicle_type: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select vehicle" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="car">Car</SelectItem>
                            <SelectItem value="bike">Bike</SelectItem>
                            <SelectItem value="scooter">Scooter</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="vehicle_number">Vehicle Number</Label>
                        <Input
                          id="vehicle_number"
                          placeholder="e.g., MH 01 AB 1234"
                          value={formData.vehicle_number}
                          onChange={(e) => setFormData({ ...formData, vehicle_number: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="preferred_mood">Preferred Ride Mood</Label>
                      <Select
                        value={formData.preferred_mood}
                        onValueChange={(value) => setFormData({ ...formData, preferred_mood: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select mood" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="quiet">Quiet</SelectItem>
                          <SelectItem value="chatty">Chatty</SelectItem>
                          <SelectItem value="music">Music</SelectItem>
                          <SelectItem value="focus">Focus</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="flexibility_radius_km">
                        Drop-Off Flexibility Radius (km)
                      </Label>
                      <Input
                        id="flexibility_radius_km"
                        type="number"
                        min="0"
                        max="10"
                        step="0.5"
                        value={formData.flexibility_radius_km}
                        onChange={(e) =>
                          setFormData({ ...formData, flexibility_radius_km: parseFloat(e.target.value) })
                        }
                      />
                      <p className="text-sm text-muted-foreground">
                        How far off-route (0-10 km) are you willing to detour for drop-offs? 
                        Higher flexibility may increase booking requests and earn you more.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button variant="outline" className="flex-1" onClick={() => navigate(-1)}>
                      Cancel
                    </Button>
                    <Button className="flex-1" onClick={handleSave} disabled={saving}>
                      {saving ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
