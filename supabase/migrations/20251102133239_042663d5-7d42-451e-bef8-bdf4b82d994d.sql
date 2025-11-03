-- Add user roles table for secure role management
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert roles"
ON public.user_roles
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update roles"
ON public.user_roles
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- Update handle_new_user to assign default user role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, is_verified)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', 'New User'),
    new.email_confirmed_at IS NOT NULL
  );
  
  -- Assign default user role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, 'user');
  
  RETURN new;
END;
$$;

-- Add referral system
CREATE TABLE public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  referred_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  referral_code TEXT NOT NULL,
  bonus_awarded BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (referrer_id, referred_id)
);

ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their referrals"
ON public.referrals
FOR SELECT
USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

CREATE POLICY "Users can create referrals"
ON public.referrals
FOR INSERT
WITH CHECK (auth.uid() = referred_id);

-- Add ratings table
CREATE TABLE public.ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id UUID REFERENCES public.rides(id) ON DELETE CASCADE NOT NULL,
  rated_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  rater_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (ride_id, rated_user_id, rater_user_id)
);

ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view ratings"
ON public.ratings
FOR SELECT
USING (true);

CREATE POLICY "Users can create ratings"
ON public.ratings
FOR INSERT
WITH CHECK (auth.uid() = rater_user_id);

-- Add lost and found table
CREATE TABLE public.lost_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ride_id UUID REFERENCES public.rides(id) ON DELETE CASCADE,
  reporter_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  item_description TEXT NOT NULL,
  item_image_url TEXT,
  status TEXT DEFAULT 'lost' CHECK (status IN ('lost', 'found', 'returned')),
  found_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.lost_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view lost items"
ON public.lost_items
FOR SELECT
USING (true);

CREATE POLICY "Users can create lost items"
ON public.lost_items
FOR INSERT
WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Users can update their lost items"
ON public.lost_items
FOR UPDATE
USING (auth.uid() = reporter_id OR auth.uid() = found_by);

-- Add events table
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view events"
ON public.events
FOR SELECT
USING (true);

CREATE POLICY "Users can create events"
ON public.events
FOR INSERT
WITH CHECK (auth.uid() = created_by);

-- Trigger for updated_at
CREATE TRIGGER update_lost_items_updated_at
BEFORE UPDATE ON public.lost_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();