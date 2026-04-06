'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckSquare, Filter } from 'lucide-react';
import BookingCard from '@/components/booking/BookingCard';
import Select from '@/components/ui/Select';
import Card from '@/components/ui/Card';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { createClient } from '@/lib/supabase/client';
import type { BookingWithDetails } from '@/lib/types/database';

export default function ApprovalsPage() {
  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending');
  const supabase = createClient();

  const fetchBookings = async () => {
    let query = supabase
      .from('bookings')
      .select('*, facility:facilities(*), user:profiles(*)')
      .order('created_at', { ascending: false });

    if (statusFilter !== 'all') {
      query = query.eq('status', statusFilter);
    }

    const { data } = await query;
    if (data) setBookings(data as BookingWithDetails[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchBookings();

    const channel = supabase
      .channel('admin-approvals')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, () => {
        fetchBookings();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const handleApprove = async (bookingId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    await supabase
      .from('bookings')
      .update({
        status: 'approved',
        approved_by: user?.id,
        approved_at: new Date().toISOString(),
      })
      .eq('id', bookingId);
  };

  const handleReject = async (bookingId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    await supabase
      .from('bookings')
      .update({
        status: 'rejected',
        approved_by: user?.id,
        approved_at: new Date().toISOString(),
      })
      .eq('id', bookingId);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-3">
            <CheckSquare size={24} className="text-accent-blue" />
            Persetujuan Booking
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            Tinjau dan kelola permintaan booking
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Filter size={16} className="text-text-muted" />
          <Select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setLoading(true);
            }}
            options={[
              { value: 'pending', label: 'Menunggu' },
              { value: 'approved', label: 'Disetujui' },
              { value: 'rejected', label: 'Ditolak' },
              { value: 'all', label: 'Semua' },
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
            <CheckSquare size={48} className="mx-auto mb-3 text-text-muted opacity-30" />
            <h2 className="text-lg font-semibold text-text-secondary">Tidak ada booking</h2>
            <p className="text-sm text-text-muted mt-1">
              {statusFilter === 'pending'
                ? 'Tidak ada permintaan yang perlu ditinjau'
                : 'Tidak ada booking dengan filter ini'}
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
              <BookingCard
                booking={booking}
                showActions
                onApprove={handleApprove}
                onReject={handleReject}
              />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
