'use client';

import { motion } from 'framer-motion';
import { Building2, Wrench, CheckCircle2, AlertCircle, XCircle } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import { cn } from '@/lib/utils/cn';
import type { Facility } from '@/lib/types/database';

interface FacilityStatusCardProps {
  facility: Facility;
}

const statusConfig = {
  available: {
    label: 'Tersedia',
    variant: 'approved' as const,
    icon: CheckCircle2,
    dotColor: 'bg-accent-green',
  },
  in_use: {
    label: 'Sedang Digunakan',
    variant: 'pending' as const,
    icon: AlertCircle,
    dotColor: 'bg-accent-amber',
  },
  maintenance: {
    label: 'Maintenance',
    variant: 'rejected' as const,
    icon: XCircle,
    dotColor: 'bg-accent-red',
  },
};

export default function FacilityStatusCard({ facility }: FacilityStatusCardProps) {
  const config = statusConfig[facility.status];
  const StatusIcon = config.icon;

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="glass-card rounded-2xl p-4 cursor-default group"
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            'p-2 rounded-xl shrink-0',
            facility.type === 'room' ? 'bg-accent-purple/10' : 'bg-accent-green/10'
          )}
        >
          {facility.type === 'room' ? (
            <Building2 size={18} className="text-accent-purple" />
          ) : (
            <Wrench size={18} className="text-accent-green" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-text-primary truncate">{facility.name}</p>
          {facility.location && (
            <p className="text-xs text-text-muted mt-0.5 truncate">{facility.location}</p>
          )}
          {facility.capacity && (
            <p className="text-xs text-text-muted">Kapasitas: {facility.capacity} orang</p>
          )}
        </div>

        <div className="shrink-0 flex items-center gap-1.5">
          <span className={cn('w-2 h-2 rounded-full', config.dotColor)} />
          <StatusIcon size={14} className="text-text-muted" />
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <Badge variant={facility.type === 'room' ? 'room' : 'tool'}>
          {facility.type === 'room' ? 'Ruangan' : 'Peralatan'}
        </Badge>
        <Badge variant={config.variant} dot>{config.label}</Badge>
      </div>
    </motion.div>
  );
}
