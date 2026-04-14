import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  startOfWeek,
  endOfWeek,
  isSameDay,
  isSameMonth,
  addMonths,
  subMonths,
  parseISO,
  isValid,
  subDays,
  isWithinInterval,
} from 'date-fns';

export {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  startOfWeek,
  endOfWeek,
  isSameDay,
  isSameMonth,
  addMonths,
  subMonths,
  parseISO,
  isValid,
  subDays,
  isWithinInterval,
};

export function getCalendarDays(month: Date): Date[] {
  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  return eachDayOfInterval({ start: calStart, end: calEnd });
}

export function formatDisplayDate(dateStr: string): string {
  try {
    const d = parseISO(dateStr);
    if (!isValid(d)) return dateStr;
    return format(d, 'MMM d, yyyy');
  } catch {
    return dateStr;
  }
}

export function formatShortDate(dateStr: string): string {
  try {
    const d = parseISO(dateStr);
    if (!isValid(d)) return dateStr;
    return format(d, 'MMM d');
  } catch {
    return dateStr;
  }
}

export function toISODate(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

export function nowISO(): string {
  return new Date().toISOString();
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
