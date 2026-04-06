'use client';

import WeeklyCalendar from '@/components/booking/WeeklyCalendar';
import { CalendarDays } from 'lucide-react';
import Link from 'next/link';
import Button from '@/components/ui/Button';

export default function BookingPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-3">
            <CalendarDays size={24} className="text-accent-blue" />
            Jadwal Booking
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            Lihat ketersediaan jadwal fasilitas
          </p>
        </div>
        <Link href="/booking/new">
          <Button icon={<CalendarDays size={16} />}>Booking Baru</Button>
        </Link>
      </div>

      <WeeklyCalendar />
    </div>
  );
}
