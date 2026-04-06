'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Hash, Hexagon, ArrowRight } from 'lucide-react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { createClient } from '@/lib/supabase/client';

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [npm, setNpm] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Password tidak cocok');
      return;
    }

    if (password.length < 6) {
      setError('Password minimal 6 karakter');
      return;
    }

    setLoading(true);

    try {
      const { error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            npm: npm,
            role: 'mahasiswa',
          },
        },
      });

      if (authError) {
        setError(authError.message);
        return;
      }

      router.push('/dashboard');
      router.refresh();
    } catch {
      setError('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-accent-green/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-accent-blue/5 rounded-full blur-[120px]" />
      </div>

      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative w-full max-w-md"
      >
        <div className="glass-modal rounded-3xl p-8 shadow-2xl shadow-black/20">
          {/* Logo & Header */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="text-center mb-8"
          >
            <div className="inline-flex p-3 rounded-2xl bg-accent-green/10 mb-4">
              <Hexagon size={32} className="text-accent-green" />
            </div>
            <h1 className="text-2xl font-bold gradient-text mb-2">Daftar Akun</h1>
            <p className="text-text-secondary text-sm">
              Buat akun untuk mulai booking fasilitas
            </p>
          </motion.div>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-4 p-3 rounded-xl bg-accent-red/10 border border-accent-red/20 text-accent-red text-sm"
            >
              {error}
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleRegister} className="space-y-4">
            <Input
              label="Nama Lengkap"
              type="text"
              placeholder="John Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              icon={<User size={16} />}
              required
            />

            <Input
              label="NPM"
              type="text"
              placeholder="1234567890"
              value={npm}
              onChange={(e) => setNpm(e.target.value)}
              icon={<Hash size={16} />}
              required
            />

            <Input
              label="Email"
              type="email"
              placeholder="nama@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail size={16} />}
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="Minimal 6 karakter"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Lock size={16} />}
              required
            />

            <Input
              label="Konfirmasi Password"
              type="password"
              placeholder="Ulangi password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              icon={<Lock size={16} />}
              required
            />

            <Button
              type="submit"
              isLoading={loading}
              className="w-full mt-6"
              size="lg"
              variant="primary"
              icon={<ArrowRight size={18} />}
            >
              Daftar
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-text-secondary">
            Sudah punya akun?{' '}
            <Link
              href="/login"
              className="text-accent-blue hover:text-accent-blue/80 font-medium transition-colors"
            >
              Masuk di sini
            </Link>
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-text-muted">
          © {new Date().getFullYear()} HIMSI — Himpunan Mahasiswa Sistem Informasi
        </p>
      </motion.div>
    </div>
  );
}
