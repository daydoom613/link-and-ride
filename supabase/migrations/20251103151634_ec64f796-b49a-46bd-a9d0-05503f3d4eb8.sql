-- Fix search path for send_ride_notification function
DROP FUNCTION IF EXISTS send_ride_notification(UUID, UUID, UUID, TEXT, TEXT, TEXT);

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