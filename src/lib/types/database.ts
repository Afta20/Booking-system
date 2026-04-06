export type UserRole = 'mahasiswa' | 'admin';

export type FacilityType = 'room' | 'tool';
export type FacilityStatus = 'available' | 'in_use' | 'maintenance';

export type BookingStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export interface Profile {
  id: string;
  full_name: string;
  npm: string;
  role: UserRole;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Facility {
  id: string;
  name: string;
  type: FacilityType;
  description: string | null;
  status: FacilityStatus;
  image_url: string | null;
  location: string | null;
  capacity: number | null;
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: string;
  user_id: string;
  facility_id: string;
  start_time: string;
  end_time: string;
  status: BookingStatus;
  purpose: string;
  notes: string | null;
  admin_notes: string | null;
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
}

// Joined types for UI display
export interface BookingWithDetails extends Booking {
  facility: Facility;
  user: Profile;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Profile, 'id' | 'created_at'>>;
      };
      facilities: {
        Row: Facility;
        Insert: Omit<Facility, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Facility, 'id' | 'created_at'>>;
      };
      bookings: {
        Row: Booking;
        Insert: Omit<Booking, 'id' | 'created_at' | 'updated_at' | 'approved_at' | 'approved_by' | 'admin_notes'>;
        Update: Partial<Omit<Booking, 'id' | 'created_at'>>;
      };
    };
  };
}
