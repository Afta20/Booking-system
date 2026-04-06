'use client';

import { Bell, Search, Menu } from 'lucide-react';
import { motion } from 'framer-motion';

interface TopbarProps {
  userName?: string;
  userRole?: string;
  onMenuClick?: () => void;
}

export default function Topbar({ userName = 'User', userRole = 'mahasiswa', onMenuClick }: TopbarProps) {
  return (
    <header className="sticky top-0 z-30 glass-strong">
      <div className="flex items-center justify-between px-4 lg:px-8 py-4">
        {/* Left: Mobile menu + Search */}
        <div className="flex items-center gap-4">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-xl bg-white/5 hover:bg-white/10 text-text-secondary hover:text-text-primary transition-colors"
          >
            <Menu size={20} />
          </motion.button>

          <div className="hidden sm:flex items-center gap-2 bg-white/5 rounded-xl px-4 py-2 border border-white/5 focus-within:border-accent-blue/30 transition-colors">
            <Search size={16} className="text-text-muted" />
            <input
              type="text"
              placeholder="Cari fasilitas..."
              className="bg-transparent border-none outline-none text-sm text-text-primary placeholder-text-muted w-48 lg:w-64"
            />
          </div>
        </div>

        {/* Right: Notifications + Profile */}
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative p-2 rounded-xl bg-white/5 hover:bg-white/10 text-text-secondary hover:text-text-primary transition-colors"
          >
            <Bell size={20} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent-blue rounded-full animate-pulse" />
          </motion.button>

          <div className="flex items-center gap-3 pl-3 border-l border-white/5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-blue to-accent-green flex items-center justify-center text-xs font-bold text-dark-900">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-medium text-text-primary leading-tight">{userName}</p>
              <p className="text-[10px] text-text-muted capitalize">{userRole}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
