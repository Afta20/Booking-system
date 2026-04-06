'use client';

import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { Building2, Wrench, CalendarDays, Clock, MapPin, User, CheckCircle2, Hexagon } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { formatDateTime, formatTimeRange } from '@/lib/utils/dateHelpers';
import type { BookingWithDetails } from '@/lib/types/database';

const QRCodeSVG = dynamic(
  () => import('qrcode.react').then((mod) => mod.QRCodeSVG),
  { ssr: false }
);

interface DigitalPassCardProps {
  booking: BookingWithDetails;
}

export default function DigitalPassCard({ booking }: DigitalPassCardProps) {
  const qrValue = JSON.stringify({
    id: booking.id,
    facility: booking.facility?.name,
    user: booking.user?.full_name,
    start: booking.start_time,
    end: booking.end_time,
    status: booking.status,
  });

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="max-w-sm mx-auto"
    >
      {/* Card */}
      <div className="relative rounded-3xl overflow-hidden">
        {/* Gradient border effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-accent-blue via-accent-green to-accent-blue rounded-3xl p-[1px]">
          <div className="w-full h-full bg-dark-800 rounded-3xl" />
        </div>

        <div className="relative glass-card rounded-3xl p-0 overflow-hidden">
          {/* Header */}
          <div className="relative px-6 pt-6 pb-4 bg-gradient-to-br from-accent-blue/10 to-accent-green/5">
            {/* Background pattern */}
            <div
              className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
                backgroundSize: '20px 20px',
              }}
            />

            <div className="relative flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                  className="p-2 rounded-xl bg-accent-blue/20"
                >
                  <Hexagon size={20} className="text-accent-blue" />
                </motion.div>
                <div>
                  <p className="text-xs font-bold text-accent-blue tracking-widest uppercase">HIMSI Book</p>
                  <p className="text-[9px] text-text-muted">Digital Pass</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 bg-accent-green/10 rounded-full px-3 py-1 border border-accent-green/20">
                <CheckCircle2 size={12} className="text-accent-green" />
                <span className="text-[10px] font-semibold text-accent-green uppercase tracking-wider">
                  Approved
                </span>
              </div>
            </div>

            <h2 className="text-xl font-bold text-text-primary">{booking.facility?.name}</h2>
            <div className="flex items-center gap-1.5 mt-1">
              {booking.facility?.type === 'room' ? (
                <Building2 size={12} className="text-accent-purple" />
              ) : (
                <Wrench size={12} className="text-accent-green" />
              )}
              <span className="text-xs text-text-secondary">
                {booking.facility?.type === 'room' ? 'Ruangan' : 'Peralatan'}
              </span>
            </div>
          </div>

          {/* Divider - ticket tear effect */}
          <div className="relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 bg-dark-900 rounded-full" />
            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-6 h-6 bg-dark-900 rounded-full" />
            <div className="border-t border-dashed border-white/10 mx-6" />
          </div>

          {/* Body */}
          <div className="px-6 py-5 space-y-4">
            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-text-muted">
                  <User size={10} />
                  <span className="text-[10px] uppercase tracking-wider font-medium">Peminjam</span>
                </div>
                <p className="text-sm font-semibold text-text-primary">{booking.user?.full_name}</p>
                <p className="text-[10px] text-text-muted font-mono">{booking.user?.npm}</p>
              </div>

              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-text-muted">
                  <MapPin size={10} />
                  <span className="text-[10px] uppercase tracking-wider font-medium">Lokasi</span>
                </div>
                <p className="text-sm font-semibold text-text-primary">
                  {booking.facility?.location || '-'}
                </p>
              </div>

              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-text-muted">
                  <CalendarDays size={10} />
                  <span className="text-[10px] uppercase tracking-wider font-medium">Tanggal</span>
                </div>
                <p className="text-sm font-semibold text-text-primary">
                  {formatDateTime(booking.start_time).split(',')[0]}
                </p>
              </div>

              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-text-muted">
                  <Clock size={10} />
                  <span className="text-[10px] uppercase tracking-wider font-medium">Waktu</span>
                </div>
                <p className="text-sm font-semibold text-text-primary">
                  {formatTimeRange(booking.start_time, booking.end_time)}
                </p>
              </div>
            </div>

            {/* Purpose */}
            <div className="bg-white/3 rounded-xl px-3 py-2">
              <p className="text-[10px] text-text-muted uppercase tracking-wider font-medium mb-0.5">
                Keperluan
              </p>
              <p className="text-xs text-text-secondary">{booking.purpose}</p>
            </div>

            {/* QR Code */}
            <div className="flex flex-col items-center pt-2">
              <div className="p-4 bg-white rounded-2xl shadow-lg shadow-black/20">
                <QRCodeSVG
                  value={qrValue}
                  size={160}
                  level="M"
                  bgColor="#ffffff"
                  fgColor="#0a0a0f"
                />
              </div>
              <p className="text-[10px] text-text-muted mt-3 font-mono tracking-wider">
                ID: {booking.id.slice(0, 8).toUpperCase()}
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-3 bg-white/2 border-t border-white/5 text-center">
            <p className="text-[9px] text-text-muted">
              Tunjukkan kartu ini saat mengambil/menggunakan fasilitas
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
