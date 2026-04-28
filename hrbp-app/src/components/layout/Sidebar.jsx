import { useAuth } from '../../context/AuthContext';

const navItems = [
  { id: 'form', label: 'Ziyaret Formu', icon: '📋', roles: ['hrbp', 'admin', 'viewer'] },
  { id: 'dashboard', label: 'Dashboard', icon: '📊', roles: ['hrbp', 'admin', 'viewer'] },
  { id: 'reports', label: 'Raporlar', icon: '📁', roles: ['hrbp', 'admin', 'viewer'] },
  { id: 'admin', label: 'Admin Panel', icon: '⚙️', roles: ['admin'] },
];

export function Sidebar({ currentView, onNavigate, open, onClose }) {
  const { user, logout } = useAuth();
  const items = navItems.filter(n => n.roles.includes(user?.role));

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-30 bg-on-surface/20 sm:hidden"
          style={{ background: 'rgba(25,28,30,0.3)', backdropFilter: 'blur(2px)' }}
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full z-40 flex flex-col sidebar-transition
          sm:relative sm:translate-x-0 sm:flex
          ${open ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ width: '240px', background: '#0f172a', minHeight: '100vh' }}
      >
        <div className="px-5 pt-7 pb-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center text-white text-xs font-bold">HV</div>
            <span className="font-bold text-sm text-white" style={{ fontFamily: 'Manrope, sans-serif' }}>HRBP Ziyaret</span>
          </div>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)', marginLeft: '40px' }}>Takip Sistemi</p>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {items.map(item => {
            const active = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { onNavigate(item.id); onClose(); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150"
                style={{
                  background: active ? 'rgba(179,25,66,0.15)' : 'transparent',
                  color: active ? '#fb5373' : 'rgba(255,255,255,0.6)',
                  borderLeft: active ? '2px solid #b31942' : '2px solid transparent',
                }}
              >
                <span className="text-base">{item.icon}</span>
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="px-4 pb-6" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '16px' }}>
          <div className="flex items-center gap-3 mb-3 px-1">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
            ) : (
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                style={{ background: 'linear-gradient(135deg,#b31942,#d53659)' }}
              >
                {user?.name?.charAt(0)}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.name}</p>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                {user?.role === 'admin' ? '⚙ Admin' : user?.role === 'viewer' ? '👁 Görüntüleyici' : '👤 HRBP'}
              </p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-colors"
            style={{ color: 'rgba(255,255,255,0.4)' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'rgba(255,255,255,0.8)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; }}
          >
            <span>↩</span> Çıkış Yap
          </button>
        </div>
      </aside>
    </>
  );
}
