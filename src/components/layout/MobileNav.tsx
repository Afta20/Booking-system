'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  CalendarPlus,
  ClipboardList,
  Building2,
  Shield,
  CheckSquare,
  Settings,
  LogOut,
  X,
  Hexagon,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { createClient } from '@/lib/supabase/client';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  userRole?: string;
}

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard size={20} /> },
  { label: 'Booking Baru', href: '/booking/new', icon: <CalendarPlus size={20} /> },
  { label: 'Booking Saya', href: '/my-bookings', icon: <ClipboardList size={20} /> },
  { label: 'Fasilitas', href: '/facilities', icon: <Building2 size={20} /> },
];

const adminItems = [
  { label: 'Admin Panel', href: '/admin', icon: <Shield size={20} /> },
  { label: 'Persetujuan', href: '/admin/approvals', icon: <CheckSquare size={20} /> },
  { label: 'Kelola Fasilitas', href: '/admin/facilities', icon: <Settings size={20} /> },
];

export default function MobileNav({ isOpen, onClose, userRole = 'mahasiswa' }: MobileNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    onClose();
  };

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed inset-y-0 left-0 z-50 w-72 glass-sidebar lg:hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-6 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-accent-blue/10 text-accent-blue">
                  <Hexagon size={24} />
                </div>
                <div>
                  <h1 className="text-lg font-bold gradient-text">HIMSI Book</h1>
                  <p className="text-[10px] text-text-muted uppercase tracking-widest">Booking System</p>
                </div>
              </div>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-text-muted"
              >
                <X size={18} />
              </motion.button>
            </div>

            {/* Nav */}
            <nav className="px-3 py-4 space-y-1">
              <p className="px-3 py-2 text-[10px] font-semibold text-text-muted uppercase tracking-widest">
                Menu Utama
              </p>
              {navItems.map((item) => (
                <Link key={item.href} href={item.href} onClick={onClose}>
                  <div
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                      isActive(item.href)
                        ? 'bg-accent-blue/10 text-accent-blue border border-accent-blue/20'
                        : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
                    )}
                  >
                    {item.icon}
                    {item.label}
                  </div>
                </Link>
              ))}

              {userRole === 'admin' && (
                <>
                  <div className="pt-4">
                    <p className="px-3 py-2 text-[10px] font-semibold text-text-muted uppercase tracking-widest">
                      Admin
                    </p>
                  </div>
                  {adminItems.map((item) => (
                    <Link key={item.href} href={item.href} onClick={onClose}>
                      <div
                        className={cn(
                          'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                          isActive(item.href)
                            ? 'bg-accent-blue/10 text-accent-blue border border-accent-blue/20'
                            : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
                        )}
                      >
                        {item.icon}
                        {item.label}
                      </div>
                    </Link>
                  ))}
                </>
              )}
            </nav>

            {/* Logout */}
            <div className="absolute bottom-0 left-0 right-0 px-3 py-4 border-t border-white/5">
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-text-secondary hover:text-accent-red hover:bg-accent-red/5 transition-all w-full"
              >
                <LogOut size={20} />
                Keluar
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
