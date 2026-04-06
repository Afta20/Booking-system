'use client';

import { useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';

type TableName = 'bookings' | 'facilities' | 'profiles';
type EventType = 'INSERT' | 'UPDATE' | 'DELETE' | '*';

interface UseRealtimeOptions {
  table: TableName;
  event?: EventType;
  filter?: string;
  onData: (payload: Record<string, unknown>) => void;
}

export function useRealtime({ table, event = '*', filter, onData }: UseRealtimeOptions) {
  const supabase = createClient();
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    const channelConfig: Record<string, string> = {
      event,
      schema: 'public',
      table,
    };

    if (filter) {
      channelConfig.filter = filter;
    }

    const channel = supabase
      .channel(`realtime-${table}-${Date.now()}`)
      .on(
        'postgres_changes' as never,
        channelConfig as never,
        (payload: Record<string, unknown>) => {
          onData(payload);
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [table, event, filter, onData, supabase]);
}
