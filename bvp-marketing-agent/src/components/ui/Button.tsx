import { type ReactNode, type ButtonHTMLAttributes } from 'react';
import { clsx } from 'clsx';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
  loading?: boolean;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    'bg-orange-500 hover:bg-orange-600 text-white border border-orange-500 hover:border-orange-600 focus:ring-orange-500/40',
  secondary:
    'bg-[#1A1A1A] hover:bg-[#222] text-[#F5F5F5] border border-orange-500/40 hover:border-orange-500 focus:ring-orange-500/30',
  ghost:
    'bg-transparent hover:bg-[#1A1A1A] text-[#A3A3A3] hover:text-[#F5F5F5] border border-transparent focus:ring-[#F97316]/30',
  danger:
    'bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 hover:border-red-500/40 focus:ring-red-500/30',
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'h-7 px-3 text-xs gap-1.5',
  md: 'h-9 px-4 text-sm gap-2',
  lg: 'h-11 px-6 text-base gap-2',
};

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  loading = false,
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={clsx(
        'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150',
        'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0A0A0A]',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        className
      )}
    >
      {loading ? (
        <span className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
      ) : null}
      {children}
    </button>
  );
}
