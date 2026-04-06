'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ClipboardList, Filter } from 'lucide-react';
import BookingCard from '@/components/booking/BookingCard';
import Select from '@/components/ui/Select';
import Card from '@/components/ui/Card';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { createClient } from '@/lib/supabase/client';
import type { BookingWithDetails, BookingStatus } from '@/lib/types/database';

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const supabase = createClient();

  useEffect(() => {
    const fetchBookings = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let query = supabase
        .from('bookings')
        .select('*, facility:facilities(*), user:profiles(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data } = await query;
      if (data) setBookings(data as BookingWithDetails[]);
      setLoading(false);
    };

    fetchBookings();

    // Realtime
    const channel = supabase
      .channel('my-bookings')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, () => {
        fetchBookings();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [statusFilter, supabase]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-3">
            <ClipboardList size={24} className="text-accent-blue" />
            Booking Saya
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            Riwayat dan status peminjaman Anda
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Filter size={16} className="text-text-muted" />
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: 'all', label: 'Semua Status' },
              { value: 'pending', label: 'Menunggu' },
              { value: 'approved', label: 'Disetujui' },
              { value: 'rejected', label: 'Ditolak' },
              { value: 'cancelled', label: 'Dibatalkan' },
            ]}
            className="w-40"
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <Card variant="glass" padding="lg">
          <div className="text-center py-12">
            <ClipboardList size={48} className="mx-auto mb-3 text-text-muted opacity-30" />
            <h2 className="text-lg font-semibold text-text-secondary">Belum ada booking</h2>
            <p className="text-sm text-text-muted mt-1">
              {statusFilter === 'all'
                ? 'Anda belum pernah melakukan booking'
                : `Tidak ada booking dengan status "${statusFilter}"`}
            </p>
          </div>
        </Card>
      ) : (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.08 } },
          }}
        >
          {bookings.map((booking) => (
            <motion.div
              key={booking.id}
              variants={{
                hidden: { opacity: 0, y: 20 },
                show: { opacity: 1, y: 0 },
              }}
            >
              <BookingCard booking={booking} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
