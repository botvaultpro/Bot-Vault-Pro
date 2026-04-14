import { type ReactNode } from 'react';
import { clsx } from 'clsx';

interface CardProps {
  children: ReactNode;
  className?: string;
  hoverable?: boolean;
  onClick?: () => void;
}

export function Card({ children, className, hoverable = false, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={clsx(
        'rounded-xl border border-[#2A2A2A] bg-[#111111] p-4',
        hoverable && 'cursor-pointer hover:border-[#F97316]/30 hover:bg-[#1A1A1A] transition-all duration-150',
        onClick && 'cursor-pointer',
        className
      )}
    >
      {children}
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon?: ReactNode;
  accent?: boolean;
}

export function StatCard({ label, value, subtext, icon, accent = false }: StatCardProps) {
  return (
    <Card>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-[#6B6B6B] uppercase tracking-wide mb-1">{label}</p>
          <p
            className={clsx(
              'text-2xl font-heading font-bold tracking-tight',
              accent ? 'text-orange-500' : 'text-[#F5F5F5]'
            )}
          >
            {value}
          </p>
          {subtext && <p className="text-xs text-[#6B6B6B] mt-1">{subtext}</p>}
        </div>
        {icon && (
          <div className="flex-shrink-0 p-2 rounded-lg bg-[#1A1A1A] text-[#6B6B6B] ml-3">
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}
