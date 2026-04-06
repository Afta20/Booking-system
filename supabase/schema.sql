-- ============================================
-- HIMSI Booking System — Database Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Profiles table (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  npm TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'mahasiswa' CHECK (role IN ('mahasiswa', 'admin')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Facilities table
CREATE TABLE public.facilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('room', 'tool')),
  description TEXT,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'in_use', 'maintenance')),
  image_url TEXT,
  location TEXT,
  capacity INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Bookings table
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  facility_id UUID NOT NULL REFERENCES public.facilities(id) ON DELETE CASCADE,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  purpose TEXT NOT NULL,
  notes TEXT,
  admin_notes TEXT,
  approved_by UUID REFERENCES public.profiles(id),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraint: end_time must be after start_time
  CONSTRAINT valid_time_range CHECK (end_time > start_time)
);

-- ============================================
-- Row Level Security (RLS)
-- ============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Enable insert for auth users" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Facilities policies
CREATE POLICY "Anyone can view facilities" ON public.facilities
  FOR SELECT USING (true);

CREATE POLICY "Only admins can insert facilities" ON public.facilities
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Only admins can update facilities" ON public.facilities
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Only admins can delete facilities" ON public.facilities
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Bookings policies
CREATE POLICY "Users can view own bookings" ON public.bookings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all bookings" ON public.bookings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can create bookings" ON public.bookings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own pending bookings" ON public.bookings
  FOR UPDATE USING (auth.uid() = user_id AND status = 'pending');

CREATE POLICY "Admins can update any booking" ON public.bookings
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- Indexes for performance
-- ============================================

CREATE INDEX idx_bookings_user_id ON public.bookings(user_id);
CREATE INDEX idx_bookings_facility_id ON public.bookings(facility_id);
CREATE INDEX idx_bookings_status ON public.bookings(status);
CREATE INDEX idx_bookings_time_range ON public.bookings(facility_id, start_time, end_time);
CREATE INDEX idx_facilities_type ON public.facilities(type);
CREATE INDEX idx_profiles_role ON public.profiles(role);

-- ============================================
-- Functions
-- ============================================

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, npm, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'npm', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'mahasiswa')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Conflict check function (server-side validation)
CREATE OR REPLACE FUNCTION public.check_booking_conflict(
  p_facility_id UUID,
  p_start_time TIMESTAMPTZ,
  p_end_time TIMESTAMPTZ,
  p_exclude_booking_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.bookings
    WHERE facility_id = p_facility_id
      AND status IN ('pending', 'approved')
      AND start_time < p_end_time
      AND end_time > p_start_time
      AND (p_exclude_booking_id IS NULL OR id != p_exclude_booking_id)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Realtime subscriptions
-- ============================================

ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.facilities;

-- ============================================
-- Seed data (sample facilities)
-- ============================================

INSERT INTO public.facilities (name, type, description, status, location, capacity) VALUES
  ('Ruang Rapat HIMSI', 'room', 'Ruang rapat utama dengan proyektor dan whiteboard', 'available', 'Gedung A Lt. 3', 20),
  ('Aula Serbaguna', 'room', 'Aula besar untuk acara dan seminar', 'available', 'Gedung B Lt. 1', 200),
  ('Lab Komputer 1', 'room', 'Laboratorium dengan 40 unit PC', 'available', 'Gedung C Lt. 2', 40),
  ('Ruang Diskusi Kecil', 'room', 'Ruang diskusi untuk kelompok kecil', 'available', 'Gedung A Lt. 2', 8),
  ('Proyektor Portable', 'tool', 'Proyektor Epson EB-X51 portable', 'available', NULL, NULL),
  ('Sound System', 'tool', 'Set sound system lengkap dengan mixer', 'available', NULL, NULL),
  ('Kamera DSLR', 'tool', 'Canon EOS 200D untuk dokumentasi', 'available', NULL, NULL),
  ('Backdrop & Standing', 'tool', 'Backdrop putih 3x6m dengan standing frame', 'available', NULL, NULL);
