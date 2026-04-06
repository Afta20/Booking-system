'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';
import MobileNav from '@/components/layout/MobileNav';
import { createClient } from '@/lib/supabase/client';
import type { Profile } from '@/lib/types/database';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        if (data) setProfile(data);
      }
    };
    fetchProfile();
  }, [supabase]);

  return (
    <div className="min-h-screen bg-dark-900">
      <Sidebar userRole="admin" />
      <MobileNav
        isOpen={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
        userRole="admin"
      />
      <div className="lg:pl-64">
        <Topbar
          userName={profile?.full_name || 'Admin'}
          userRole="admin"
          onMenuClick={() => setMobileNavOpen(true)}
        />
        <main className="px-4 lg:px-8 py-6">{children}</main>
      </div>
    </div>
  );
}
