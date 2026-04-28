export function Button({ children, variant = 'primary', size = 'md', disabled, loading, onClick, type = 'button', className = '', style: styleProp, ...props }) {
  const base = 'inline-flex items-center justify-center gap-2 font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'gradient-primary text-white rounded-full focus:ring-primary/30 active:scale-[0.98]',
    secondary: 'bg-transparent border text-secondary rounded-full focus:ring-secondary/30',
    ghost: 'bg-transparent text-on-surface hover:bg-surface-low rounded-xl focus:ring-on-surface/10',
    danger: 'bg-danger text-white rounded-full focus:ring-danger/30 active:scale-[0.98]',
    outline: 'bg-transparent border border-primary/20 text-primary rounded-xl hover:bg-primary/5 focus:ring-primary/20',
  };

  const sizes = {
    sm: 'px-4 py-1.5 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-7 py-3 text-base',
  };

  const variantStyle = variants[variant] || variants.primary;
  const borderStyle = variant === 'secondary' ? { border: '1px solid rgba(0,106,103,0.4)' } : {};

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${base} ${variantStyle} ${sizes[size]} ${className}`}
      style={{ ...borderStyle, ...styleProp }}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
      )}
      {children}
    </button>
  );
}
