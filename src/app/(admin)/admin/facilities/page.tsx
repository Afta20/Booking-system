'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, Plus, Building2, Wrench, Pencil, Trash2 } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { createClient } from '@/lib/supabase/client';
import type { Facility } from '@/lib/types/database';

export default function AdminFacilitiesPage() {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Facility | null>(null);
  const [form, setForm] = useState({
    name: '',
    type: 'room' as const,
    description: '',
    location: '',
    capacity: '',
    status: 'available' as const,
  });
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  const fetchFacilities = async () => {
    const { data } = await supabase.from('facilities').select('*').order('name');
    if (data) setFacilities(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchFacilities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openModal = (facility?: Facility) => {
    if (facility) {
      setEditing(facility);
      setForm({
        name: facility.name,
        type: facility.type as 'room',
        description: facility.description || '',
        location: facility.location || '',
        capacity: facility.capacity?.toString() || '',
        status: facility.status as 'available',
      });
    } else {
      setEditing(null);
      setForm({ name: '', type: 'room', description: '', location: '', capacity: '', status: 'available' });
    }
    setModalOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    const payload = {
      name: form.name,
      type: form.type,
      description: form.description || null,
      location: form.location || null,
      capacity: form.capacity ? parseInt(form.capacity) : null,
      status: form.status,
    };

    if (editing) {
      await supabase.from('facilities').update(payload).eq('id', editing.id);
    } else {
      await supabase.from('facilities').insert(payload);
    }

    setSaving(false);
    setModalOpen(false);
    fetchFacilities();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Yakin ingin menghapus fasilitas ini?')) {
      await supabase.from('facilities').delete().eq('id', id);
      fetchFacilities();
    }
  };

  const statusMap = {
    available: { label: 'Tersedia', variant: 'approved' as const },
    in_use: { label: 'Digunakan', variant: 'pending' as const },
    maintenance: { label: 'Maintenance', variant: 'rejected' as const },
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-3">
            <Settings size={24} className="text-accent-blue" />
            Kelola Fasilitas
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            Tambah, edit, atau hapus fasilitas
          </p>
        </div>
        <Button onClick={() => openModal()} icon={<Plus size={16} />}>
          Tambah Fasilitas
        </Button>
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
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}
        >
          {facilities.map((facility) => (
            <motion.div
              key={facility.id}
              variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
            >
              <Card variant="glass" padding="md">
                <div className="flex items-start gap-3 mb-3">
                  <div className={facility.type === 'room' ? 'p-2.5 rounded-xl bg-accent-purple/10' : 'p-2.5 rounded-xl bg-accent-green/10'}>
                    {facility.type === 'room' ? <Building2 size={20} className="text-accent-purple" /> : <Wrench size={20} className="text-accent-green" />}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-text-primary">{facility.name}</h3>
                    {facility.location && <p className="text-xs text-text-muted">{facility.location}</p>}
                  </div>
                  <div className="flex gap-1">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => openModal(facility)}
                      className="p-1.5 rounded-lg hover:bg-white/5 text-text-muted hover:text-accent-blue transition-colors"
                    >
                      <Pencil size={14} />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleDelete(facility.id)}
                      className="p-1.5 rounded-lg hover:bg-white/5 text-text-muted hover:text-accent-red transition-colors"
                    >
                      <Trash2 size={14} />
                    </motion.button>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Badge variant={facility.type === 'room' ? 'room' : 'tool'}>
                    {facility.type === 'room' ? 'Ruangan' : 'Peralatan'}
                  </Badge>
                  <Badge variant={statusMap[facility.status].variant} dot>
                    {statusMap[facility.status].label}
                  </Badge>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Fasilitas' : 'Tambah Fasilitas'}
        size="md"
      >
        <div className="space-y-4">
          <Input
            label="Nama Fasilitas"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Mis: Ruang Rapat A"
            required
          />
          <Select
            label="Tipe"
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value as 'room' })}
            options={[
              { value: 'room', label: 'Ruangan' },
              { value: 'tool', label: 'Peralatan' },
            ]}
          />
          <Input
            label="Deskripsi"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Deskripsi singkat..."
          />
          <Input
            label="Lokasi"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            placeholder="Mis: Gedung A Lt. 3"
          />
          <Input
            label="Kapasitas (opsional)"
            type="number"
            value={form.capacity}
            onChange={(e) => setForm({ ...form, capacity: e.target.value })}
            placeholder="Jumlah orang"
          />
          <Select
            label="Status"
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value as 'available' })}
            options={[
              { value: 'available', label: 'Tersedia' },
              { value: 'in_use', label: 'Sedang Digunakan' },
              { value: 'maintenance', label: 'Maintenance' },
            ]}
          />
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)} className="flex-1">
              Batal
            </Button>
            <Button onClick={handleSave} isLoading={saving} className="flex-1">
              {editing ? 'Simpan' : 'Tambah'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
