import { useEffect } from 'react';
import { Button } from './Button';

export function Modal({ open, onClose, title, children, footer, size = 'md' }) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  const sizeClass = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl' }[size] || 'max-w-lg';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 fade-in"
      style={{ background: 'rgba(25,28,30,0.5)', backdropFilter: 'blur(8px)', overflowY: 'auto' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div
        className={`w-full ${sizeClass} rounded-[2rem] p-2 my-auto`}
        style={{ background: 'var(--color-surface-low)', flexShrink: 0 }}
      >
        <div className="bg-white flex flex-col rounded-[1.5rem] overflow-hidden ambient-shadow">
          <div className="flex items-center justify-between px-6 pt-6 pb-4 shrink-0">
            <h3 className="text-2xl font-extrabold tracking-tight" style={{ fontFamily: 'Manrope, sans-serif', color: 'var(--color-on-surface)' }}>{title}</h3>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full flex items-center justify-center text-xl transition-all shrink-0"
              style={{ background: 'var(--color-surface-low)', color: 'var(--color-muted)' }}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--color-on-surface)'; e.currentTarget.style.background = 'var(--color-surface-high)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--color-muted)'; e.currentTarget.style.background = 'var(--color-surface-low)'; }}
            >
              ✕
            </button>
          </div>
          <div className="px-6 py-4">{children}</div>
          {footer && (
            <div className="px-6 pb-6 pt-4 mt-2 flex justify-end gap-3" style={{ borderTop: '2px solid rgba(225,190,192,0.08)' }}>{footer}</div>
          )}
        </div>
      </div>
    </div>
  );
}

export function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmLabel = 'Onayla', danger = false }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>İptal</Button>
          <Button variant={danger ? 'danger' : 'primary'} onClick={onConfirm}>{confirmLabel}</Button>
        </>
      }
    >
      <p className="text-sm" style={{ color: 'var(--color-muted)' }}>{message}</p>
    </Modal>
  );
}
