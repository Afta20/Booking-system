'use client';

import { motion } from 'framer-motion';
import { Building2, Wrench, CalendarDays, Clock, MapPin, ArrowRight } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import { cn } from '@/lib/utils/cn';
import { formatDateTime, formatTimeRange, formatRelative } from '@/lib/utils/dateHelpers';
import type { BookingWithDetails, BookingStatus } from '@/lib/types/database';
import Link from 'next/link';

interface BookingCardProps {
  booking: BookingWithDetails;
  compact?: boolean;
  showActions?: boolean;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
}

const statusConfig: Record<BookingStatus, { label: string; variant: 'pending' | 'approved' | 'rejected' | 'cancelled' }> = {
  pending: { label: 'Menunggu', variant: 'pending' },
  approved: { label: 'Disetujui', variant: 'approved' },
  rejected: { label: 'Ditolak', variant: 'rejected' },
  cancelled: { label: 'Dibatalkan', variant: 'cancelled' },
};

export default function BookingCard({
  booking,
  compact = false,
  showActions = false,
  onApprove,
  onReject,
}: BookingCardProps) {
  const config = statusConfig[booking.status];

  if (compact) {
    return (
      <motion.div
        whileHover={{ x: 4 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="flex items-center gap-3 p-3 rounded-xl bg-white/3 hover:bg-white/5 transition-colors cursor-default"
      >
        <div
          className={cn(
            'p-2 rounded-lg shrink-0',
            booking.facility?.type === 'room' ? 'bg-accent-purple/10' : 'bg-accent-green/10'
          )}
        >
          {booking.facility?.type === 'room' ? (
            <Building2 size={14} className="text-accent-purple" />
          ) : (
            <Wrench size={14} className="text-accent-green" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-text-primary truncate">
            {booking.facility?.name}
          </p>
          <p className="text-xs text-text-muted">{formatRelative(booking.start_time)}</p>
        </div>
        <Badge variant={config.variant} dot>{config.label}</Badge>
      </motion.div>
    );
  }

  return (
    <motion.div
      whileHover={{ scale: 1.01, y: -2 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="glass-card rounded-2xl p-5 group cursor-default relative overflow-hidden"
    >
      {/* Glow accent on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div
          className={cn(
            'absolute -top-20 -right-20 w-40 h-40 rounded-full blur-[80px]',
            booking.status === 'approved' ? 'bg-accent-green/10' : 'bg-accent-blue/10'
          )}
        />
      </div>

      <div className="relative">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'p-2.5 rounded-xl',
                booking.facility?.type === 'room' ? 'bg-accent-purple/10' : 'bg-accent-green/10'
              )}
            >
              {booking.facility?.type === 'room' ? (
                <Building2 size={20} className="text-accent-purple" />
              ) : (
                <Wrench size={20} className="text-accent-green" />
              )}
            </div>
            <div>
              <h3 className="text-base font-semibold text-text-primary">{booking.facility?.name}</h3>
              <div className="flex items-center gap-2">
                <Badge variant={booking.facility?.type === 'room' ? 'room' : 'tool'}>
                  {booking.facility?.type === 'room' ? 'Ruangan' : 'Peralatan'}
                </Badge>
              </div>
            </div>
          </div>
          <Badge variant={config.variant} dot>{config.label}</Badge>
        </div>

        {/* Details */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <CalendarDays size={14} className="text-text-muted shrink-0" />
            <span>{formatDateTime(booking.start_time)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <Clock size={14} className="text-text-muted shrink-0" />
            <span>{formatTimeRange(booking.start_time, booking.end_time)}</span>
          </div>
          {booking.facility?.location && (
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <MapPin size={14} className="text-text-muted shrink-0" />
              <span>{booking.facility.location}</span>
            </div>
          )}
        </div>

        {/* Purpose */}
        <p className="text-sm text-text-secondary bg-white/3 rounded-xl px-3 py-2 mb-4">
          <span className="text-text-muted text-xs">Keperluan:</span>
          <br />
          {booking.purpose}
        </p>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <p className="text-xs text-text-muted">
            Oleh: {booking.user?.full_name}
          </p>

          {showActions && booking.status === 'pending' && (
            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onReject?.(booking.id)}
                className="px-3 py-1.5 rounded-lg bg-accent-red/10 text-accent-red text-xs font-medium hover:bg-accent-red/20 transition-colors"
              >
                Tolak
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onApprove?.(booking.id)}
                className="px-3 py-1.5 rounded-lg bg-accent-green/10 text-accent-green text-xs font-medium hover:bg-accent-green/20 transition-colors"
              >
                Setujui
              </motion.button>
            </div>
          )}

          {booking.status === 'approved' && (
            <Link href={`/digital-pass/${booking.id}`}>
              <motion.span
                whileHover={{ x: 4 }}
                className="inline-flex items-center gap-1 text-xs text-accent-blue font-medium"
              >
                Digital Pass <ArrowRight size={12} />
              </motion.span>
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  );
}
