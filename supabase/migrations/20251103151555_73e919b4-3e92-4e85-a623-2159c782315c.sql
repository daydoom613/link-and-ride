-- Add flexibility radius to profiles
ALTER TABLE profiles ADD COLUMN flexibility_radius_km NUMERIC DEFAULT 2.0 CHECK (flexibility_radius_km >= 0 AND flexibility_radius_km <= 10);

-- Add ride request status and notifications
CREATE TYPE request_status AS ENUM ('pending', 'accepted', 'declined', 'completed', 'cancelled');

ALTER TABLE ride_bookings ADD COLUMN pickup_eta TIMESTAMP WITH TIME ZONE;
ALTER TABLE ride_bookings ADD COLUMN dropoff_eta TIMESTAMP WITH TIME ZONE;
ALTER TABLE ride_bookings ADD COLUMN actual_pickup_location TEXT;
ALTER TABLE ride_bookings ADD COLUMN detour_distance_km NUMERIC;
ALTER TABLE ride_bookings ADD COLUMN detour_surcharge NUMERIC;

-- Create notifications table for real-time updates
CREATE TABLE ride_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  ride_id UUID REFERENCES rides(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES ride_bookings(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE ride_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON ride_notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications"
  ON ride_notifications FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update own notifications"
  ON ride_notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- Create function to send notification
CREATE OR REPLACE FUNCTION send_ride_notification(
  p_user_id UUID,
  p_ride_id UUID,
  p_booking_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_message TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  INSERT INTO ride_notifications (user_id, ride_id, booking_id, notification_type, title, message)
  VALUES (p_user_id, p_ride_id, p_booking_id, p_type, p_title, p_message)
  RETURNING id INTO v_notification_id;
  
  RETURN v_notification_id;
END;
$$;

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE ride_notifications;