import { type ReactNode } from 'react';
import { clsx } from 'clsx';

type BadgeVariant = 'default' | 'orange' | 'blue' | 'green' | 'purple' | 'gray' | 'red' | 'teal' | 'yellow';

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  default: 'bg-[#2A2A2A] text-[#A3A3A3] border-[#333]',
  orange: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  green: 'bg-green-500/10 text-green-400 border-green-500/20',
  purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  gray: 'bg-[#2A2A2A] text-[#A3A3A3] border-[#333]',
  red: 'bg-red-500/10 text-red-400 border-red-500/20',
  teal: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
  yellow: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
};

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-md border',
        VARIANT_CLASSES[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

export function statusBadgeVariant(status: string): BadgeVariant {
  switch (status) {
    case 'published': return 'green';
    case 'scheduled': return 'blue';
    case 'draft': return 'gray';
    case 'archived': return 'red';
    default: return 'default';
  }
}

export function goalBadgeVariant(goal: string): BadgeVariant {
  switch (goal) {
    case 'awareness': return 'blue';
    case 'engagement': return 'orange';
    case 'conversion': return 'green';
    case 'retention': return 'purple';
    default: return 'default';
  }
}
