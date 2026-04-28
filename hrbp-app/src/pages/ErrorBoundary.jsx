import { Component } from 'react';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-8" style={{ background: 'var(--color-surface)' }}>
          <div className="text-5xl">⚠️</div>
          <h2 className="text-xl font-bold text-center" style={{ fontFamily: 'Manrope, sans-serif', color: 'var(--color-on-surface)' }}>
            Beklenmeyen bir hata oluştu
          </h2>
          <p className="text-sm text-center max-w-sm" style={{ color: 'var(--color-muted)' }}>
            {this.state.error?.message || 'Lütfen sayfayı yenileyip tekrar deneyin.'}
          </p>
          <button
            className="gradient-primary text-white px-6 py-2.5 rounded-full text-sm font-medium"
            onClick={() => window.location.reload()}
          >
            Sayfayı Yenile
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
