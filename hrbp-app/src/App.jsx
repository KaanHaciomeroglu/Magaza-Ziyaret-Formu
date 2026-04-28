import { useState, useRef, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ErrorBoundary } from './pages/ErrorBoundary';
import { Login } from './pages/Login';
import { Header } from './components/layout/Header';
import { Dashboard } from './pages/Dashboard';
import { VisitForm } from './pages/Form';
import { Reports } from './pages/Reports';
import { Admin } from './pages/Admin';

function AppContent() {
  const { user } = useAuth();
  const [view, setView] = useState(null);
  const [editVisit, setEditVisit] = useState(null);
  const [isDark, setIsDark] = useState(() => {
    if (typeof localStorage !== 'undefined') return localStorage.getItem('theme') === 'dark';
    return false;
  });
  const mainRef = useRef(null);

  const currentView = editVisit ? 'form' : (view || 'dashboard');

  useEffect(() => {
    if (isDark) document.documentElement.setAttribute('data-theme', 'dark');
    else document.documentElement.removeAttribute('data-theme');
  }, [isDark]);

  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0 });
  }, [currentView]);

  const toggleTheme = () => {
    setIsDark(p => {
      const next = !p;
      localStorage.setItem('theme', next ? 'dark' : 'light');
      return next;
    });
  };

  const handleLoginSuccess = () => {
    setView('dashboard');
  };

  if (!user) return <Login onSuccess={handleLoginSuccess} />;

  const navigate = (v) => { setView(v); setEditVisit(null); };

  return (
    <div className="flex flex-col" style={{ background: 'var(--color-surface)', height: '100dvh', overflow: 'hidden' }}>
      <Header currentView={currentView} onNavigate={navigate} isDark={isDark} toggleTheme={toggleTheme} />

      <main ref={mainRef} className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <ErrorBoundary>
          {currentView === 'form' && (
            <VisitForm
              editVisit={editVisit}
              onEditDone={() => { setEditVisit(null); setView('reports'); }}
              onVisitSaved={() => {}}
            />
          )}
          {currentView === 'dashboard' && <Dashboard />}
          {currentView === 'reports' && <Reports onEdit={(v) => setEditVisit(v)} />}
          {currentView === 'admin' && user.role === 'admin' && <Admin />}
        </ErrorBoundary>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ToastProvider>
          <AppContent />
        </ToastProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
