'use client';

import { useState, useEffect } from 'react';
import { CalendarDays, Building2, Clock, CheckCircle, AlertTriangle, TrendingUp } from 'lucide-react';
import BentoGrid, { BentoItem } from '@/components/dashboard/BentoGrid';
import StatCard from '@/components/dashboard/StatCard';
import FacilityStatusCard from '@/components/dashboard/FacilityStatusCard';
import BookingCard from '@/components/booking/BookingCard';
import Card from '@/components/ui/Card';
import { createClient } from '@/lib/supabase/client';
import type { Facility, BookingWithDetails } from '@/lib/types/database';

export default function DashboardPage() {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [recentBookings, setRecentBookings] = useState<BookingWithDetails[]>([]);
  const [stats, setStats] = useState({
    totalBookings: 0,
    availableFacilities: 0,
    pendingApprovals: 0,
    activeBookings: 0,
  });
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      // Fetch facilities
      const { data: facilityData } = await supabase
        .from('facilities')
        .select('*')
        .order('name');
      if (facilityData) setFacilities(facilityData);

      // Fetch recent bookings for current user
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: bookingData } = await supabase
          .from('bookings')
          .select('*, facility:facilities(*), user:profiles(*)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5);
        if (bookingData) setRecentBookings(bookingData as BookingWithDetails[]);

        // Fetch stats
        const { count: totalCount } = await supabase
          .from('bookings')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        const { count: pendingCount } = await supabase
          .from('bookings')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('status', 'pending');

        const { count: activeCount } = await supabase
          .from('bookings')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('status', 'approved')
          .gte('end_time', new Date().toISOString());

        setStats({
          totalBookings: totalCount || 0,
          availableFacilities: facilityData?.filter((f) => f.status === 'available').length || 0,
          pendingApprovals: pendingCount || 0,
          activeBookings: activeCount || 0,
        });
      }
    };

    fetchData();

    // Realtime subscriptions
    const bookingsChannel = supabase
      .channel('bookings-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, () => {
        fetchData();
      })
      .subscribe();

    const facilitiesChannel = supabase
      .channel('facilities-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'facilities' }, () => {
        fetchData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(bookingsChannel);
      supabase.removeChannel(facilitiesChannel);
    };
  }, [supabase]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
        <p className="text-text-secondary text-sm mt-1">
          Ringkasan status fasilitas dan booking terkini
        </p>
      </div>

      {/* Stats Bento Grid */}
      <BentoGrid>
        <BentoItem index={0}>
          <StatCard
            title="Total Booking"
            value={stats.totalBookings}
            subtitle="Sepanjang waktu"
            icon={CalendarDays}
            accentColor="blue"
            trend={{ value: 12, positive: true }}
          />
        </BentoItem>
        <BentoItem index={1}>
          <StatCard
            title="Fasilitas Tersedia"
            value={stats.availableFacilities}
            subtitle={`dari ${facilities.length} fasilitas`}
            icon={Building2}
            accentColor="green"
          />
        </BentoItem>
        <BentoItem index={2}>
          <StatCard
            title="Menunggu Persetujuan"
            value={stats.pendingApprovals}
            subtitle="Perlu ditinjau"
            icon={AlertTriangle}
            accentColor="amber"
          />
        </BentoItem>
        <BentoItem index={3}>
          <StatCard
            title="Booking Aktif"
            value={stats.activeBookings}
            subtitle="Saat ini"
            icon={CheckCircle}
            accentColor="purple"
          />
        </BentoItem>
      </BentoGrid>

      {/* Second Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Status Fasilitas */}
        <BentoItem index={4} className="lg:col-span-2">
          <Card variant="glass" padding="md">
            <div className="flex items-center gap-2 mb-4">
              <Building2 size={18} className="text-accent-blue" />
              <h2 className="text-lg font-semibold text-text-primary">Status Fasilitas</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {facilities.slice(0, 6).map((facility) => (
                <FacilityStatusCard key={facility.id} facility={facility} />
              ))}
            </div>
            {facilities.length === 0 && (
              <div className="text-center py-8 text-text-muted">
                <Building2 size={40} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">Belum ada data fasilitas</p>
              </div>
            )}
          </Card>
        </BentoItem>

        {/* Recent Bookings */}
        <BentoItem index={5}>
          <Card variant="glass" padding="md">
            <div className="flex items-center gap-2 mb-4">
              <Clock size={18} className="text-accent-green" />
              <h2 className="text-lg font-semibold text-text-primary">Booking Terbaru</h2>
            </div>
            <div className="space-y-3">
              {recentBookings.slice(0, 3).map((booking) => (
                <BookingCard key={booking.id} booking={booking} compact />
              ))}
            </div>
            {recentBookings.length === 0 && (
              <div className="text-center py-8 text-text-muted">
                <CalendarDays size={40} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">Belum ada booking</p>
              </div>
            )}
          </Card>
        </BentoItem>
      </div>

      {/* Quick Stats Footer */}
      <BentoItem index={6}>
        <Card variant="glass" padding="md">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={18} className="text-accent-blue" />
            <h2 className="text-sm font-semibold text-text-primary">Info Cepat</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold font-mono text-accent-blue">
                {facilities.filter((f) => f.type === 'room').length}
              </p>
              <p className="text-xs text-text-muted">Ruangan</p>
            </div>
            <div>
              <p className="text-2xl font-bold font-mono text-accent-green">
                {facilities.filter((f) => f.type === 'tool').length}
              </p>
              <p className="text-xs text-text-muted">Peralatan</p>
            </div>
            <div>
              <p className="text-2xl font-bold font-mono text-accent-amber">{stats.pendingApprovals}</p>
              <p className="text-xs text-text-muted">Pending</p>
            </div>
            <div>
              <p className="text-2xl font-bold font-mono text-accent-purple">{stats.activeBookings}</p>
              <p className="text-xs text-text-muted">Aktif</p>
            </div>
          </div>
        </Card>
      </BentoItem>
    </div>
  );
}
