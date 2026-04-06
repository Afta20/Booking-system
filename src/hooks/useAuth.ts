'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Profile } from '@/lib/types/database';
import type { User } from '@supabase/supabase-js';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      setUser(authUser);

      if (authUser) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .single();
        setProfile(profileData);
      }

      setLoading(false);
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          setProfile(profileData);
        } else {
          setProfile(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase]);

  const isAdmin = profile?.role === 'admin';

  return { user, profile, loading, isAdmin };
}
