'use client';

import { useState, useEffect } from 'react';
import { use } from 'react';
import { ArrowLeft, Download, Share2 } from 'lucide-react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import DigitalPassCard from '@/components/digital-pass/DigitalPassCard';
import { createClient } from '@/lib/supabase/client';
import type { BookingWithDetails } from '@/lib/types/database';
import Skeleton from '@/components/ui/Skeleton';

export default function DigitalPassPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [booking, setBooking] = useState<BookingWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const supabase = createClient();

  useEffect(() => {
    const fetchBooking = async () => {
      const { data, error: fetchError } = await supabase
        .from('bookings')
        .select('*, facility:facilities(*), user:profiles(*)')
        .eq('id', id)
        .single();

      if (fetchError) {
        setError('Booking tidak ditemukan');
      } else if (data?.status !== 'approved') {
        setError('Digital Pass hanya tersedia untuk booking yang sudah disetujui');
      } else {
        setBooking(data as BookingWithDetails);
      }
      setLoading(false);
    };
    fetchBooking();
  }, [id, supabase]);

  if (loading) {
    return (
      <div className="max-w-sm mx-auto space-y-6 py-8">
        <Skeleton className="h-[600px] rounded-3xl" />
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="max-w-sm mx-auto py-8">
        <Card variant="glass" padding="lg">
          <div className="text-center py-8">
            <p className="text-accent-red text-sm">{error || 'Terjadi kesalahan'}</p>
            <Link href="/my-bookings" className="mt-4 inline-block">
              <Button variant="secondary" icon={<ArrowLeft size={16} />}>
                Kembali
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 py-4">
      {/* Header */}
      <div className="flex items-center justify-between max-w-sm mx-auto">
        <Link href="/my-bookings">
          <Button variant="ghost" size="sm" icon={<ArrowLeft size={16} />}>
            Kembali
          </Button>
        </Link>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" icon={<Share2 size={14} />}>
            Share
          </Button>
          <Button variant="primary" size="sm" icon={<Download size={14} />}>
            Simpan
          </Button>
        </div>
      </div>

      {/* Digital Pass */}
      <DigitalPassCard booking={booking} />
    </div>
  );
}
