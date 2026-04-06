'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { getWeekDays, formatDayShort, formatDayNumber, formatMonthYear, OPERATING_HOURS } from '@/lib/utils/dateHelpers';
import { createClient } from '@/lib/supabase/client';
import type { BookingWithDetails } from '@/lib/types/database';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import type { Facility } from '@/lib/types/database';

interface WeeklyCalendarProps {
  facilityId?: string;
}

export default function WeeklyCalendar({ facilityId }: WeeklyCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [selectedFacility, setSelectedFacility] = useState(facilityId || '');
  const supabase = createClient();

  const weekDays = getWeekDays(currentDate);
  const weekStart = weekDays[0];
  const weekEnd = weekDays[6];

  useEffect(() => {
    const fetchFacilities = async () => {
      const { data } = await supabase.from('facilities').select('*').order('name');
      if (data) setFacilities(data);
    };
    fetchFacilities();
  }, [supabase]);

  useEffect(() => {
    const fetchBookings = async () => {
      if (!selectedFacility) return;

      const startOfWeek = new Date(weekStart);
      startOfWeek.setHours(0, 0, 0, 0);
      const endOfWeek = new Date(weekEnd);
      endOfWeek.setHours(23, 59, 59, 999);

      const { data } = await supabase
        .from('bookings')
        .select('*, facility:facilities(*), user:profiles(*)')
        .eq('facility_id', selectedFacility)
        .in('status', ['pending', 'approved'])
        .gte('start_time', startOfWeek.toISOString())
        .lte('end_time', endOfWeek.toISOString());

      if (data) setBookings(data as BookingWithDetails[]);
    };

    fetchBookings();
  }, [selectedFacility, currentDate, supabase, weekStart, weekEnd]);

  const prevWeek = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() - 7);
    setCurrentDate(d);
  };

  const nextWeek = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + 7);
    setCurrentDate(d);
  };

  const goToToday = () => setCurrentDate(new Date());

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const getBookingsForSlot = (day: Date, hour: number) => {
    return bookings.filter((b) => {
      const start = new Date(b.start_time);
      const end = new Date(b.end_time);
      const slotStart = new Date(day);
      slotStart.setHours(hour, 0, 0, 0);
      const slotEnd = new Date(day);
      slotEnd.setHours(hour + 1, 0, 0, 0);
      return start < slotEnd && end > slotStart;
    });
  };

  return (
    <Card variant="glass" padding="md">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <CalendarDays size={20} className="text-accent-blue" />
          <h2 className="text-lg font-semibold text-text-primary">Kalender Mingguan</h2>
        </div>

        <div className="flex items-center gap-2">
          <Select
            value={selectedFacility}
            onChange={(e) => setSelectedFacility(e.target.value)}
            placeholder="Pilih fasilitas"
            options={facilities.map((f) => ({
              value: f.id,
              label: f.name,
            }))}
            className="w-48"
          />
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={prevWeek}>
            <ChevronLeft size={16} />
          </Button>
          <Button variant="ghost" size="sm" onClick={goToToday}>
            Hari ini
          </Button>
          <Button variant="ghost" size="sm" onClick={nextWeek}>
            <ChevronRight size={16} />
          </Button>
        </div>
        <p className="text-sm font-medium text-text-secondary capitalize">
          {formatMonthYear(currentDate)}
        </p>
      </div>

      {/* Calendar Grid */}
      <div className="overflow-x-auto">
        <div className="min-w-[700px]">
          {/* Day Headers */}
          <div className="grid grid-cols-[60px_repeat(7,1fr)] gap-px mb-1">
            <div />
            {weekDays.map((day, i) => (
              <div
                key={i}
                className={cn(
                  'text-center py-2 rounded-lg',
                  isToday(day) && 'bg-accent-blue/10'
                )}
              >
                <p className="text-xs text-text-muted uppercase">{formatDayShort(day)}</p>
                <p
                  className={cn(
                    'text-lg font-bold font-mono',
                    isToday(day) ? 'text-accent-blue' : 'text-text-primary'
                  )}
                >
                  {formatDayNumber(day)}
                </p>
              </div>
            ))}
          </div>

          {/* Time Slots */}
          <div className="grid grid-cols-[60px_repeat(7,1fr)] gap-px">
            {OPERATING_HOURS.map((hour) => (
              <div key={hour} className="contents">
                {/* Time label */}
                <div className="flex items-start justify-end pr-2 pt-1">
                  <span className="text-[10px] text-text-muted font-mono">
                    {hour.toString().padStart(2, '0')}:00
                  </span>
                </div>

                {/* Day cells */}
                {weekDays.map((day, dayIdx) => {
                  const slotBookings = getBookingsForSlot(day, hour);
                  const hasBooking = slotBookings.length > 0;
                  const isPending = slotBookings.some((b) => b.status === 'pending');
                  const isApproved = slotBookings.some((b) => b.status === 'approved');

                  return (
                    <div
                      key={`${hour}-${dayIdx}`}
                      className={cn(
                        'h-10 rounded-md border border-white/3 transition-colors relative',
                        hasBooking
                          ? isApproved
                            ? 'bg-accent-green/10 border-accent-green/20'
                            : 'bg-accent-amber/10 border-accent-amber/20'
                          : 'hover:bg-white/3 cursor-pointer',
                        isToday(day) && !hasBooking && 'bg-accent-blue/3'
                      )}
                    >
                      {hasBooking && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="absolute inset-0.5 rounded flex items-center justify-center"
                        >
                          <span
                            className={cn(
                              'text-[9px] font-medium truncate px-1',
                              isApproved ? 'text-accent-green' : 'text-accent-amber'
                            )}
                          >
                            {slotBookings[0]?.user?.full_name?.split(' ')[0]}
                          </span>
                        </motion.div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 mt-4 pt-3 border-t border-white/5">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-accent-green/20 border border-accent-green/30" />
              <span className="text-xs text-text-muted">Disetujui</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-accent-amber/20 border border-accent-amber/30" />
              <span className="text-xs text-text-muted">Menunggu</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-white/3 border border-white/10" />
              <span className="text-xs text-text-muted">Tersedia</span>
            </div>
          </div>
        </div>
      </div>

      {!selectedFacility && (
        <div className="text-center py-12 text-text-muted">
          <CalendarDays size={40} className="mx-auto mb-2 opacity-30" />
          <p className="text-sm">Pilih fasilitas untuk melihat jadwal</p>
        </div>
      )}
    </Card>
  );
}
