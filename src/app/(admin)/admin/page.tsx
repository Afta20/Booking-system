'use client';

import { useState, useEffect } from 'react';
import { Shield, CalendarDays, Building2, Clock, Users } from 'lucide-react';
import BentoGrid, { BentoItem } from '@/components/dashboard/BentoGrid';
import StatCard from '@/components/dashboard/StatCard';
import { createClient } from '@/lib/supabase/client';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalBookings: 0,
    pendingApprovals: 0,
    totalFacilities: 0,
    totalUsers: 0,
    approvedToday: 0,
  });
  const supabase = createClient();

  useEffect(() => {
    const fetchStats = async () => {
      const { count: totalBookings } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true });

      const { count: pendingApprovals } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      const { count: totalFacilities } = await supabase
        .from('facilities')
        .select('*', { count: 'exact', head: true });

      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const { count: approvedToday } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'approved')
        .gte('approved_at', today.toISOString());

      setStats({
        totalBookings: totalBookings || 0,
        pendingApprovals: pendingApprovals || 0,
        totalFacilities: totalFacilities || 0,
        totalUsers: totalUsers || 0,
        approvedToday: approvedToday || 0,
      });
    };

    fetchStats();

    const channel = supabase
      .channel('admin-stats')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, () => {
        fetchStats();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [supabase]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary flex items-center gap-3">
          <Shield size={24} className="text-accent-blue" />
          Admin Panel
        </h1>
        <p className="text-text-secondary text-sm mt-1">
          Kelola booking dan fasilitas kampus
        </p>
      </div>

      <BentoGrid>
        <BentoItem index={0}>
          <StatCard
            title="Total Booking"
            value={stats.totalBookings}
            icon={CalendarDays}
            accentColor="blue"
          />
        </BentoItem>
        <BentoItem index={1}>
          <StatCard
            title="Menunggu Persetujuan"
            value={stats.pendingApprovals}
            subtitle="Segera tinjau"
            icon={Clock}
            accentColor="amber"
          />
        </BentoItem>
        <BentoItem index={2}>
          <StatCard
            title="Total Fasilitas"
            value={stats.totalFacilities}
            icon={Building2}
            accentColor="green"
          />
        </BentoItem>
        <BentoItem index={3}>
          <StatCard
            title="Total Pengguna"
            value={stats.totalUsers}
            icon={Users}
            accentColor="purple"
          />
        </BentoItem>
      </BentoGrid>
    </div>
  );
}
