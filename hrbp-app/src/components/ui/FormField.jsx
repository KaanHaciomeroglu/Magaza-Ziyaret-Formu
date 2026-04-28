import React from 'react';

export function FormField({ label, error, helper, required, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium" style={{ color: 'var(--color-text-main, var(--color-on-surface))', fontFamily: 'Manrope, sans-serif' }}>
          {label}{required && <span className="text-primary ml-0.5" style={{ color: 'var(--color-primary)' }}>*</span>}
        </label>
      )}
      {children}
      {helper && !error && <p className="text-xs" style={{ color: 'var(--color-muted)' }}>{helper}</p>}
      {error && <p className="text-xs font-medium" style={{ color: 'var(--color-danger)' }}>{error}</p>}
    </div>
  );
}

export function Input({ error, className = '', ...props }) {
  return (
    <input
      className={`input-editorial ${error ? 'error' : ''} ${className}`}
      {...props}
    />
  );
}

export function PasswordInput({ error, className = '', ...props }) {
  const [show, setShow] = React.useState(false);
  return (
    <div style={{ position: 'relative' }}>
      <input
        type={show ? 'text' : 'password'}
        className={`input-editorial ${error ? 'error' : ''} ${className}`}
        style={{ paddingRight: '2.5rem' }}
        {...props}
      />
      <button
        type="button"
        tabIndex={-1}
        onClick={() => setShow(s => !s)}
        style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'var(--color-muted)', lineHeight: 1 }}
      >
        {show ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
            <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
            <line x1="1" y1="1" x2="23" y2="23"/>
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
        )}
      </button>
    </div>
  );
}

export function Select({ error, children, className = '', ...props }) {
  return (
    <select
      className={`select-editorial ${error ? 'error' : ''} ${className}`}
      {...props}
    >
      {children}
    </select>
  );
}

export function Textarea({ error, className = '', ...props }) {
  return (
    <textarea
      className={`textarea-editorial ${error ? 'error' : ''} ${className}`}
      rows={3}
      {...props}
    />
  );
}

export function ReadonlyField({ label, value, placeholder = '—' }) {
  return (
    <FormField label={label}>
      <div
        className="w-full px-3 py-3 text-sm rounded-t-md"
        style={{
          background: 'var(--color-surface-low)', 
          color: value ? 'var(--color-on-surface)' : 'var(--color-light-text)',
          borderBottom: '2px solid rgba(225, 190, 192, 0.08)',
          fontFamily: 'Inter, sans-serif'
        }}
      >
        {value || placeholder}
      </div>
    </FormField>
  );
}

export function SearchableSelect({ value, onChange, options, placeholder = 'Tümü', disabled = false }) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const ref = React.useRef(null);

  const selected = options.find(o => String(o.value) === String(value));
  const filtered = options.filter(o =>
    !query || o.label.toLowerCase().includes(query.toLowerCase())
  );

  React.useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const select = (val) => { onChange(val); setOpen(false); setQuery(''); };

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen(p => !p)}
        className="select-editorial w-full text-left flex items-center justify-between"
        style={{ color: selected ? 'var(--color-on-surface)' : 'var(--color-muted)', cursor: disabled ? 'not-allowed' : 'pointer' }}
      >
        <span className="truncate">{selected ? selected.label : placeholder}</span>
        <span style={{ fontSize: 10, opacity: 0.5, marginLeft: 6 }}>▼</span>
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 50,
          background: 'var(--color-surface-card, white)',
          border: '1px solid rgba(225,190,192,0.3)',
          borderRadius: '0.75rem',
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          overflow: 'hidden',
        }}>
          <div style={{ padding: '8px 8px 4px' }}>
            <input
              autoFocus
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Ara..."
              style={{
                width: '100%', padding: '6px 10px', fontSize: 13,
                borderRadius: '0.5rem', outline: 'none',
                background: 'var(--color-surface-high)',
                border: '1px solid rgba(225,190,192,0.2)',
                color: 'var(--color-on-surface)',
              }}
            />
          </div>
          <div style={{ maxHeight: 220, overflowY: 'auto' }}>
            <div
              onClick={() => select('')}
              style={{
                padding: '8px 14px', fontSize: 13, cursor: 'pointer',
                color: 'var(--color-muted)',
                background: !value ? 'var(--color-surface-high)' : 'transparent',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--color-surface-low)'}
              onMouseLeave={e => e.currentTarget.style.background = !value ? 'var(--color-surface-high)' : 'transparent'}
            >
              {placeholder}
            </div>
            {filtered.map(o => (
              <div
                key={o.value}
                onClick={() => select(o.value)}
                style={{
                  padding: '8px 14px', fontSize: 13, cursor: 'pointer',
                  background: String(o.value) === String(value) ? 'var(--color-surface-high)' : 'transparent',
                  color: 'var(--color-on-surface)',
                  fontWeight: String(o.value) === String(value) ? 600 : 400,
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--color-surface-low)'}
                onMouseLeave={e => e.currentTarget.style.background = String(o.value) === String(value) ? 'var(--color-surface-high)' : 'transparent'}
              >
                {o.label}
              </div>
            ))}
            {filtered.length === 0 && (
              <div style={{ padding: '10px 14px', fontSize: 13, color: 'var(--color-muted)' }}>Sonuç bulunamadı</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function Toggle({ value, onChange, label }) {
  return (
    <div className="flex gap-2">
      {['true', 'false'].map(v => (
        <button
          key={v}
          type="button"
          onClick={() => onChange(v)}
          className="flex-1 py-3 px-4 text-sm font-medium rounded-full transition-all duration-150 cursor-pointer text-center"
          style={{
            background: value === v ? (v === 'true' ? 'var(--color-secondary-container)' : 'rgba(239,68,68,0.1)') : 'transparent',
            color: value === v ? (v === 'true' ? 'var(--color-secondary)' : '#ef4444') : 'var(--color-light-text)',
            border: value === v ? (v === 'true' ? '1px solid transparent' : '1px solid rgba(239,68,68,0.4)') : '1px solid rgba(225,190,192,0.4)',
          }}
        >
          {v === 'true' ? 'Evet' : 'Hayır'}
        </button>
      ))}
    </div>
  );
}
