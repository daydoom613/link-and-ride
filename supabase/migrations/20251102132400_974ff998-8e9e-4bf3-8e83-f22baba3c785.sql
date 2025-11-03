-- Create enum types
CREATE TYPE user_role AS ENUM ('student', 'faculty', 'staff');
CREATE TYPE gender_type AS ENUM ('male', 'female', 'other', 'prefer_not_to_say');
CREATE TYPE vehicle_type AS ENUM ('car', 'bike', 'scooter');
CREATE TYPE mood_type AS ENUM ('quiet', 'chatty', 'music', 'focus');
CREATE TYPE ride_status AS ENUM ('scheduled', 'active', 'completed', 'cancelled');

-- Profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role user_role NOT NULL DEFAULT 'student',
  gender gender_type,
  phone TEXT,
  bio TEXT,
  avatar_url TEXT,
  preferred_mood mood_type DEFAULT 'chatty',
  vehicle_type vehicle_type,
  vehicle_number TEXT,
  is_verified BOOLEAN DEFAULT false,
  total_rides_shared INTEGER DEFAULT 0,
  total_rides_taken INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0.00,
  total_ratings INTEGER DEFAULT 0,
  reward_points INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Rides table
CREATE TABLE rides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sharer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  origin TEXT NOT NULL,
  destination TEXT NOT NULL,
  origin_lat DECIMAL(10, 8),
  origin_lng DECIMAL(11, 8),
  destination_lat DECIMAL(10, 8),
  destination_lng DECIMAL(11, 8),
  departure_time TIMESTAMPTZ NOT NULL,
  available_seats INTEGER NOT NULL CHECK (available_seats > 0),
  total_seats INTEGER NOT NULL CHECK (total_seats > 0),
  vehicle_type vehicle_type NOT NULL,
  preferred_mood mood_type,
  price_per_seat DECIMAL(10,2),
  is_recurring BOOLEAN DEFAULT false,
  recurrence_pattern TEXT,
  status ride_status DEFAULT 'scheduled',
  is_wheelchair_accessible BOOLEAN DEFAULT false,
  is_women_only BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ride bookings table
CREATE TABLE ride_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id UUID NOT NULL REFERENCES rides(id) ON DELETE CASCADE,
  rider_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  seats_booked INTEGER DEFAULT 1 CHECK (seats_booked > 0),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  pickup_location TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  feedback TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(ride_id, rider_id)
);

-- Communities table
CREATE TABLE communities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon_url TEXT,
  member_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User communities junction table
CREATE TABLE user_communities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, community_id)
);

-- Eco impact tracking
CREATE TABLE eco_impacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  ride_id UUID REFERENCES rides(id) ON DELETE SET NULL,
  distance_km DECIMAL(10,2),
  fuel_saved_liters DECIMAL(10,2),
  co2_saved_kg DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Rewards and challenges
CREATE TABLE reward_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  points INTEGER NOT NULL,
  reason TEXT NOT NULL,
  ride_id UUID REFERENCES rides(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE rides ENABLE ROW LEVEL SECURITY;
ALTER TABLE ride_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE eco_impacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE reward_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- RLS Policies for rides
CREATE POLICY "Rides are viewable by everyone"
  ON rides FOR SELECT
  USING (true);

CREATE POLICY "Users can create rides"
  ON rides FOR INSERT
  WITH CHECK (auth.uid() = sharer_id);

CREATE POLICY "Sharers can update own rides"
  ON rides FOR UPDATE
  USING (auth.uid() = sharer_id);

CREATE POLICY "Sharers can delete own rides"
  ON rides FOR DELETE
  USING (auth.uid() = sharer_id);

-- RLS Policies for ride_bookings
CREATE POLICY "Users can view their bookings"
  ON ride_bookings FOR SELECT
  USING (auth.uid() = rider_id OR auth.uid() IN (SELECT sharer_id FROM rides WHERE id = ride_id));

CREATE POLICY "Users can create bookings"
  ON ride_bookings FOR INSERT
  WITH CHECK (auth.uid() = rider_id);

CREATE POLICY "Users can update their bookings"
  ON ride_bookings FOR UPDATE
  USING (auth.uid() = rider_id);

-- RLS Policies for communities
CREATE POLICY "Communities are viewable by everyone"
  ON communities FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create communities"
  ON communities FOR INSERT
  WITH CHECK (auth.uid() = created_by);

-- RLS Policies for user_communities
CREATE POLICY "User communities are viewable by members"
  ON user_communities FOR SELECT
  USING (true);

CREATE POLICY "Users can join communities"
  ON user_communities FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave communities"
  ON user_communities FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for eco_impacts
CREATE POLICY "Users can view own eco impact"
  ON eco_impacts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can create eco impacts"
  ON eco_impacts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for reward_transactions
CREATE POLICY "Users can view own rewards"
  ON reward_transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can create reward transactions"
  ON reward_transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create function to automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, is_verified)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', 'New User'),
    new.email_confirmed_at IS NOT NULL
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rides_updated_at BEFORE UPDATE ON rides
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ride_bookings_updated_at BEFORE UPDATE ON ride_bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert some default communities
INSERT INTO communities (name, description, icon_url) VALUES
  ('Tech Enthusiasts', 'For all the techies who love to discuss technology during rides', '🚀'),
  ('Early Birds', 'Morning commuters who prefer quiet, peaceful rides', '🌅'),
  ('Music Lovers', 'Share your favorite tunes during the journey', '🎵'),
  ('Fitness Freaks', 'Health-conscious riders who discuss wellness and fitness', '💪'),
  ('Book Club', 'Literature enthusiasts who love reading recommendations', '📚');