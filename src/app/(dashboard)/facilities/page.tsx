'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Building2, Wrench, Filter } from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Select from '@/components/ui/Select';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { createClient } from '@/lib/supabase/client';
import type { Facility } from '@/lib/types/database';

export default function FacilitiesPage() {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('all');
  const supabase = createClient();

  useEffect(() => {
    const fetchFacilities = async () => {
      let query = supabase.from('facilities').select('*').order('name');

      if (typeFilter !== 'all') {
        query = query.eq('type', typeFilter);
      }

      const { data } = await query;
      if (data) setFacilities(data);
      setLoading(false);
    };
    fetchFacilities();
  }, [typeFilter, supabase]);

  const statusMap = {
    available: { label: 'Tersedia', variant: 'approved' as const },
    in_use: { label: 'Sedang Digunakan', variant: 'pending' as const },
    maintenance: { label: 'Maintenance', variant: 'rejected' as const },
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-3">
            <Building2 size={24} className="text-accent-blue" />
            Katalog Fasilitas
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            Daftar ruangan dan peralatan yang tersedia
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Filter size={16} className="text-text-muted" />
          <Select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            options={[
              { value: 'all', label: 'Semua' },
              { value: 'room', label: 'Ruangan' },
              { value: 'tool', label: 'Peralatan' },
            ]}
            className="w-36"
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.06 } },
          }}
        >
          {facilities.map((facility) => (
            <motion.div
              key={facility.id}
              variants={{
                hidden: { opacity: 0, y: 20 },
                show: { opacity: 1, y: 0 },
              }}
            >
              <Card variant="glass" padding="md" hoverable>
                <div className="flex items-start gap-3 mb-3">
                  <div
                    className={
                      facility.type === 'room'
                        ? 'p-3 rounded-xl bg-accent-purple/10'
                        : 'p-3 rounded-xl bg-accent-green/10'
                    }
                  >
                    {facility.type === 'room' ? (
                      <Building2 size={24} className="text-accent-purple" />
                    ) : (
                      <Wrench size={24} className="text-accent-green" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-semibold text-text-primary">
                      {facility.name}
                    </h3>
                    {facility.location && (
                      <p className="text-xs text-text-muted mt-0.5">{facility.location}</p>
                    )}
                  </div>
                </div>

                {facility.description && (
                  <p className="text-sm text-text-secondary mb-3 line-clamp-2">
                    {facility.description}
                  </p>
                )}

                <div className="flex items-center flex-wrap gap-2">
                  <Badge variant={facility.type === 'room' ? 'room' : 'tool'}>
                    {facility.type === 'room' ? 'Ruangan' : 'Peralatan'}
                  </Badge>
                  <Badge variant={statusMap[facility.status].variant} dot>
                    {statusMap[facility.status].label}
                  </Badge>
                  {facility.capacity && (
                    <Badge variant="info">{facility.capacity} orang</Badge>
                  )}
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
