import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { clsx } from 'clsx';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  footer?: ReactNode;
}

const SIZE_CLASSES = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

export function Modal({ isOpen, onClose, title, children, size = 'md', footer }: ModalProps) {
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKey);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        className={clsx(
          'relative w-full rounded-xl border border-[#2A2A2A] bg-[#111111] shadow-2xl flex flex-col max-h-[90vh]',
          SIZE_CLASSES[size]
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#2A2A2A]">
          <h2 id="modal-title" className="text-base font-heading font-semibold text-[#F5F5F5] tracking-wide">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#6B6B6B] hover:text-[#F5F5F5] hover:bg-[#1A1A1A] transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500/40"
            aria-label="Close modal"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="px-5 py-4 border-t border-[#2A2A2A] flex items-center justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  danger?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  danger = false,
}: ConfirmDialogProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-[#A3A3A3] hover:text-[#F5F5F5] rounded-lg hover:bg-[#1A1A1A] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => { onConfirm(); onClose(); }}
            className={clsx(
              'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
              danger
                ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30'
                : 'bg-orange-500 text-white hover:bg-orange-600'
            )}
          >
            {confirmLabel}
          </button>
        </>
      }
    >
      <p className="text-sm text-[#A3A3A3]">{description}</p>
    </Modal>
  );
}
