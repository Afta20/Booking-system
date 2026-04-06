'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarPlus, AlertTriangle, CheckCircle2, Building2, Wrench } from 'lucide-react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { createClient } from '@/lib/supabase/client';
import { checkBookingConflict, validateBookingTime } from '@/lib/utils/conflictCheck';
import type { Facility } from '@/lib/types/database';

export default function NewBookingPage() {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [facilityId, setFacilityId] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [purpose, setPurpose] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [conflictMessage, setConflictMessage] = useState('');
  const [checkingConflict, setCheckingConflict] = useState(false);

  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const fetchFacilities = async () => {
      const { data } = await supabase
        .from('facilities')
        .select('*')
        .eq('status', 'available')
        .order('name');
      if (data) setFacilities(data);
    };
    fetchFacilities();
  }, [supabase]);

  const filteredFacilities = category
    ? facilities.filter((f) => f.type === category)
    : facilities;

  // Check conflicts when date/time/facility changes
  useEffect(() => {
    const checkConflicts = async () => {
      if (!facilityId || !date || !startTime || !endTime) {
        setConflictMessage('');
        return;
      }

      const startDateTime = new Date(`${date}T${startTime}`);
      const endDateTime = new Date(`${date}T${endTime}`);

      // Validate time
      const validation = validateBookingTime(startDateTime, endDateTime);
      if (!validation.valid) {
        setConflictMessage(validation.error || '');
        return;
      }

      setCheckingConflict(true);
      const result = await checkBookingConflict(supabase, facilityId, startDateTime, endDateTime);

      if (result.hasConflict) {
        const conflictNames = result.conflictingBookings
          .map((b) => `${b.user?.full_name} (${new Date(b.start_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} - ${new Date(b.end_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })})`)
          .join(', ');
        setConflictMessage(`Jadwal bentrok dengan: ${conflictNames}`);
      } else {
        setConflictMessage('');
      }
      setCheckingConflict(false);
    };

    const timer = setTimeout(checkConflicts, 500);
    return () => clearTimeout(timer);
  }, [facilityId, date, startTime, endTime, supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const startDateTime = new Date(`${date}T${startTime}`);
      const endDateTime = new Date(`${date}T${endTime}`);

      // Final validation
      const validation = validateBookingTime(startDateTime, endDateTime);
      if (!validation.valid) {
        setError(validation.error || 'Waktu tidak valid');
        setLoading(false);
        return;
      }

      // Final conflict check
      const conflictResult = await checkBookingConflict(supabase, facilityId, startDateTime, endDateTime);
      if (conflictResult.hasConflict) {
        setError('Jadwal bentrok dengan booking yang sudah ada');
        setLoading(false);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('Silakan login terlebih dahulu');
        setLoading(false);
        return;
      }

      const { error: insertError } = await supabase.from('bookings').insert({
        user_id: user.id,
        facility_id: facilityId,
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
        purpose,
        notes: notes || null,
        status: 'pending',
      });

      if (insertError) {
        setError(insertError.message);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/my-bookings');
      }, 2000);
    } catch {
      setError('Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  const selectedFacility = facilities.find((f) => f.id === facilityId);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary flex items-center gap-3">
          <CalendarPlus size={24} className="text-accent-blue" />
          Booking Baru
        </h1>
        <p className="text-text-secondary text-sm mt-1">
          Isi formulir untuk mengajukan peminjaman fasilitas
        </p>
      </div>

      {/* Success */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="p-6 rounded-2xl bg-accent-green/10 border border-accent-green/20 text-center"
          >
            <CheckCircle2 size={48} className="text-accent-green mx-auto mb-3" />
            <h2 className="text-lg font-semibold text-text-primary">Booking Berhasil Diajukan!</h2>
            <p className="text-sm text-text-secondary mt-1">
              Menunggu persetujuan admin. Mengalihkan ke halaman booking...
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {!success && (
        <Card variant="glass" padding="lg">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Category */}
            <Select
              label="Kategori"
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setFacilityId('');
              }}
              placeholder="Pilih kategori"
              options={[
                { value: 'room', label: '🏢 Ruangan' },
                { value: 'tool', label: '🔧 Peralatan (Logistik)' },
              ]}
            />

            {/* Facility */}
            <Select
              label="Fasilitas"
              value={facilityId}
              onChange={(e) => setFacilityId(e.target.value)}
              placeholder="Pilih fasilitas"
              options={filteredFacilities.map((f) => ({
                value: f.id,
                label: `${f.name}${f.location ? ` — ${f.location}` : ''}${f.capacity ? ` (${f.capacity} orang)` : ''}`,
              }))}
            />

            {/* Selected facility info */}
            {selectedFacility && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="flex items-center gap-3 p-3 rounded-xl bg-white/3 border border-white/5"
              >
                <div className={selectedFacility.type === 'room' ? 'text-accent-purple' : 'text-accent-green'}>
                  {selectedFacility.type === 'room' ? <Building2 size={18} /> : <Wrench size={18} />}
                </div>
                <div>
                  <p className="text-sm font-medium text-text-primary">{selectedFacility.name}</p>
                  <p className="text-xs text-text-muted">{selectedFacility.description}</p>
                </div>
                <Badge variant={selectedFacility.type === 'room' ? 'room' : 'tool'} className="ml-auto">
                  {selectedFacility.type === 'room' ? 'Ruangan' : 'Peralatan'}
                </Badge>
              </motion.div>
            )}

            {/* Date */}
            <Input
              label="Tanggal"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              required
            />

            {/* Time Range */}
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Jam Mulai"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                min="07:00"
                max="21:00"
                required
              />
              <Input
                label="Jam Selesai"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                min="07:00"
                max="21:00"
                required
              />
            </div>

            {/* Conflict Alert */}
            <AnimatePresence>
              {conflictMessage && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-3 rounded-xl bg-accent-red/10 border border-accent-red/20 flex items-start gap-2"
                >
                  <AlertTriangle size={16} className="text-accent-red shrink-0 mt-0.5" />
                  <p className="text-sm text-accent-red">{conflictMessage}</p>
                </motion.div>
              )}
              {!conflictMessage && facilityId && date && startTime && endTime && !checkingConflict && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-3 rounded-xl bg-accent-green/10 border border-accent-green/20 flex items-center gap-2"
                >
                  <CheckCircle2 size={16} className="text-accent-green" />
                  <p className="text-sm text-accent-green">Jadwal tersedia!</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Purpose */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-text-secondary">
                Keperluan
              </label>
              <textarea
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="Jelaskan keperluan peminjaman..."
                rows={3}
                required
                className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-text-primary placeholder-text-muted text-sm focus:outline-none focus:border-accent-blue/50 focus:ring-1 focus:ring-accent-blue/20 transition-all duration-200 backdrop-blur-sm resize-none"
              />
            </div>

            {/* Notes */}
            <Input
              label="Catatan Tambahan (opsional)"
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Catatan untuk admin..."
            />

            {/* Error */}
            {error && (
              <div className="p-3 rounded-xl bg-accent-red/10 border border-accent-red/20 text-accent-red text-sm">
                {error}
              </div>
            )}

            {/* Submit */}
            <Button
              type="submit"
              isLoading={loading}
              disabled={!!conflictMessage || checkingConflict}
              className="w-full"
              size="lg"
              icon={<CalendarPlus size={18} />}
            >
              Ajukan Booking
            </Button>
          </form>
        </Card>
      )}
    </div>
  );
}
