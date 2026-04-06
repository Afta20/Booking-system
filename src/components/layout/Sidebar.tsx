'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  CalendarPlus,
  ClipboardList,
  Building2,
  Shield,
  CheckSquare,
  Settings,
  LogOut,
  Hexagon,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard size={20} /> },
  { label: 'Booking Baru', href: '/booking/new', icon: <CalendarPlus size={20} /> },
  { label: 'Booking Saya', href: '/my-bookings', icon: <ClipboardList size={20} /> },
  { label: 'Fasilitas', href: '/facilities', icon: <Building2 size={20} /> },
];

const adminItems: NavItem[] = [
  { label: 'Admin Panel', href: '/admin', icon: <Shield size={20} />, adminOnly: true },
  { label: 'Persetujuan', href: '/admin/approvals', icon: <CheckSquare size={20} />, adminOnly: true },
  { label: 'Kelola Fasilitas', href: '/admin/facilities', icon: <Settings size={20} />, adminOnly: true },
];

interface SidebarProps {
  userRole?: string;
}

export default function Sidebar({ userRole = 'mahasiswa' }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 glass-sidebar z-40">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-white/5">
        <motion.div
          whileHover={{ rotate: 180 }}
          transition={{ duration: 0.5 }}
          className="p-2 rounded-xl bg-accent-blue/10 text-accent-blue"
        >
          <Hexagon size={24} />
        </motion.div>
        <div>
          <h1 className="text-lg font-bold gradient-text">HIMSI Book</h1>
          <p className="text-[10px] text-text-muted uppercase tracking-widest">Booking System</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="px-3 py-2 text-[10px] font-semibold text-text-muted uppercase tracking-widest">
          Menu Utama
        </p>
        {navItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <motion.div
              whileHover={{ x: 4 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                isActive(item.href)
                  ? 'bg-accent-blue/10 text-accent-blue border border-accent-blue/20'
                  : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
              )}
            >
              <span className={cn(isActive(item.href) && 'drop-shadow-[0_0_8px_rgba(0,212,255,0.5)]')}>
                {item.icon}
              </span>
              {item.label}
              {isActive(item.href) && (
                <motion.div
                  layoutId="activeIndicator"
                  className="ml-auto w-1.5 h-1.5 rounded-full bg-accent-blue"
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                />
              )}
            </motion.div>
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
              <Link key={item.href} href={item.href}>
                <motion.div
                  whileHover={{ x: 4 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                    isActive(item.href)
                      ? 'bg-accent-blue/10 text-accent-blue border border-accent-blue/20'
                      : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
                  )}
                >
                  <span className={cn(isActive(item.href) && 'drop-shadow-[0_0_8px_rgba(0,212,255,0.5)]')}>
                    {item.icon}
                  </span>
                  {item.label}
                </motion.div>
              </Link>
            ))}
          </>
        )}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-white/5">
        <motion.button
          whileHover={{ x: 4 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-text-secondary hover:text-accent-red hover:bg-accent-red/5 transition-all duration-200 w-full"
        >
          <LogOut size={20} />
          Keluar
        </motion.button>
      </div>
    </aside>
  );
}
