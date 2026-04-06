import { format, formatDistanceToNow, isToday, isTomorrow, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';

export function formatDateTime(dateStr: string): string {
  const date = parseISO(dateStr);
  return format(date, "dd MMM yyyy, HH:mm", { locale: id });
}

export function formatDate(dateStr: string): string {
  const date = parseISO(dateStr);
  return format(date, "dd MMMM yyyy", { locale: id });
}

export function formatTime(dateStr: string): string {
  const date = parseISO(dateStr);
  return format(date, "HH:mm", { locale: id });
}

export function formatTimeRange(startStr: string, endStr: string): string {
  return `${formatTime(startStr)} - ${formatTime(endStr)}`;
}

export function formatRelative(dateStr: string): string {
  const date = parseISO(dateStr);
  if (isToday(date)) return `Hari ini, ${formatTime(dateStr)}`;
  if (isTomorrow(date)) return `Besok, ${formatTime(dateStr)}`;
  return formatDateTime(dateStr);
}

export function formatDistanceFromNow(dateStr: string): string {
  const date = parseISO(dateStr);
  return formatDistanceToNow(date, { addSuffix: true, locale: id });
}

export function getWeekDays(date: Date): Date[] {
  const start = new Date(date);
  const day = start.getDay();
  const diff = start.getDate() - day + (day === 0 ? -6 : 1); // Monday start
  start.setDate(diff);
  start.setHours(0, 0, 0, 0);

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    return d;
  });
}

export function formatDayShort(date: Date): string {
  return format(date, 'EEE', { locale: id });
}

export function formatDayNumber(date: Date): string {
  return format(date, 'd');
}

export function formatMonthYear(date: Date): string {
  return format(date, 'MMMM yyyy', { locale: id });
}

export const OPERATING_HOURS = Array.from({ length: 14 }, (_, i) => i + 7); // 07:00 - 20:00
