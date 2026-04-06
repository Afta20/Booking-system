import { SupabaseClient } from '@supabase/supabase-js';
import type { Booking, BookingWithDetails } from '@/lib/types/database';

export interface ConflictResult {
  hasConflict: boolean;
  conflictingBookings: BookingWithDetails[];
}

/**
 * Check if a proposed booking time conflicts with existing bookings.
 * Uses overlap detection: two ranges overlap if start1 < end2 AND end1 > start2.
 */
export async function checkBookingConflict(
  supabase: SupabaseClient,
  facilityId: string,
  startTime: Date,
  endTime: Date,
  excludeBookingId?: string
): Promise<ConflictResult> {
  let query = supabase
    .from('bookings')
    .select('*, facility:facilities(*), user:profiles(*)')
    .eq('facility_id', facilityId)
    .in('status', ['pending', 'approved'])
    .lt('start_time', endTime.toISOString())
    .gt('end_time', startTime.toISOString());

  if (excludeBookingId) {
    query = query.neq('id', excludeBookingId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error checking booking conflict:', error);
    return { hasConflict: false, conflictingBookings: [] };
  }

  return {
    hasConflict: (data?.length ?? 0) > 0,
    conflictingBookings: (data ?? []) as BookingWithDetails[],
  };
}

/**
 * Validate booking time constraints:
 * - Start must be in the future
 * - End must be after start
 * - Duration must be between 30 minutes and 12 hours
 * - Must be within operating hours (07:00 - 21:00)
 */
export function validateBookingTime(
  startTime: Date,
  endTime: Date
): { valid: boolean; error?: string } {
  const now = new Date();

  if (startTime <= now) {
    return { valid: false, error: 'Waktu mulai harus di masa depan' };
  }

  if (endTime <= startTime) {
    return { valid: false, error: 'Waktu selesai harus setelah waktu mulai' };
  }

  const durationMs = endTime.getTime() - startTime.getTime();
  const durationMinutes = durationMs / (1000 * 60);

  if (durationMinutes < 30) {
    return { valid: false, error: 'Durasi minimal 30 menit' };
  }

  if (durationMinutes > 720) {
    return { valid: false, error: 'Durasi maksimal 12 jam' };
  }

  const startHour = startTime.getHours();
  const endHour = endTime.getHours();
  const endMinutes = endTime.getMinutes();

  if (startHour < 7 || startHour >= 21) {
    return { valid: false, error: 'Jam operasional: 07:00 - 21:00' };
  }

  if (endHour > 21 || (endHour === 21 && endMinutes > 0)) {
    return { valid: false, error: 'Jam operasional: 07:00 - 21:00' };
  }

  return { valid: true };
}
