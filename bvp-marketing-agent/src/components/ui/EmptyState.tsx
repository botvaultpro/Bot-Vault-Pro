import { type ReactNode } from 'react';
import { type LucideIcon } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  children?: ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action, children }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="p-4 rounded-2xl bg-[#1A1A1A] border border-[#2A2A2A] mb-4">
        <Icon size={28} className="text-[#6B6B6B]" />
      </div>
      <h3 className="text-sm font-medium text-[#F5F5F5] mb-1">{title}</h3>
      <p className="text-xs text-[#6B6B6B] max-w-xs leading-relaxed mb-4">{description}</p>
      {action && (
        <Button variant="secondary" size="sm" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
      {children}
    </div>
  );
}
