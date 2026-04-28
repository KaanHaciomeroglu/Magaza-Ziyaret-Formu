import { useAuth } from '../../context/AuthContext';
import { dataService } from '../../services/dataService';
import { ImageCropModal } from '../ui/ImageCropModal';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { PasswordInput } from '../ui/FormField';
import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useToast } from '../../context/ToastContext';

function ChangePasswordModal({ open, onClose }) {
  const toast = useToast();
  const [form, setForm] = useState({ current: '', next: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const reset = () => { setForm({ current: '', next: '', confirm: '' }); setError(''); };

  const handleClose = () => { reset(); onClose(); };

  const handleSubmit = async () => {
    setError('');
    if (!form.current || !form.next || !form.confirm) { setError('Tüm alanlar zorunludur.'); return; }
    if (form.next.length < 6) { setError('Yeni şifre en az 6 karakter olmalıdır.'); return; }
    if (form.next !== form.confirm) { setError('Yeni şifreler eşleşmiyor.'); return; }
    setLoading(true);
    try {
      await dataService.changePassword(form.current, form.next);
      toast('Şifreniz başarıyla değiştirildi.', 'success');
      reset();
      onClose();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Şifre Değiştir"
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={handleClose}>İptal</Button>
          <Button variant="primary" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Kaydediliyor...' : 'Kaydet'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
          {error && (
            <p className="text-sm px-3 py-2 rounded-xl" style={{ background: 'rgba(239,68,68,0.08)', color: '#ef4444' }}>{error}</p>
          )}
          {[
            { key: 'current', label: 'Mevcut Şifre' },
            { key: 'next', label: 'Yeni Şifre' },
            { key: 'confirm', label: 'Yeni Şifre (Tekrar)' },
          ].map(({ key, label }) => (
            <div key={key}>
              <p className="text-xs font-semibold mb-1" style={{ color: 'var(--color-muted)' }}>{label}</p>
              <PasswordInput
                value={form[key]}
                onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              />
            </div>
          ))}
        </div>
    </Modal>
  );
}

const navItems = [
  { id: 'form', label: 'Ziyaret Formu', roles: ['hrbp', 'admin', 'viewer'] },
  { id: 'dashboard', label: 'Dashboard', roles: ['hrbp', 'admin', 'viewer'] },
  { id: 'reports', label: 'Raporlar', roles: ['hrbp', 'admin', 'viewer'] },
  { id: 'admin', label: 'Admin Panel', roles: ['admin'] },
];

function UserMenu({ user, isDark, toggleTheme, logout, onClose, onAvatarChange, onChangePassword, onOpenCrop }) {
  const fileRef = useRef(null);
  const avatar = user?.avatar || null;

  const handleFile = (e) => {
    const file = e.target.files[0];
    e.target.value = '';
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { alert('Dosya 5 MB\'dan küçük olmalı.'); return; }
    const reader = new FileReader();
    reader.onload = (ev) => onOpenCrop(ev.target.result);
    reader.readAsDataURL(file);
  };

  return (
    <>
    <div
      className="absolute right-0 top-full mt-2 rounded-[1.5rem] p-1.5 z-50 fade-in"
      style={{ background: 'var(--color-surface-low)', minWidth: '240px', boxShadow: 'var(--shadow-card)' }}
    >
      {/* Menu items */}
      <div className="space-y-0.5 px-1 py-1">
        {/* Avatar upload — viewer göremez */}
        {user?.role !== 'viewer' && (
          <>
            <button
              onClick={() => fileRef.current?.click()}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left"
              style={{ color: 'var(--color-on-surface)' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--color-surface-high)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <span className="text-base">🖼️</span>
              {avatar ? 'Fotoğrafı Değiştir' : 'Fotoğraf Ekle'}
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />

            {avatar && (
              <button
                onClick={() => onAvatarChange(null)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left"
                style={{ color: 'var(--color-danger)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--color-surface-high)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <span className="text-base">🗑️</span>
                Fotoğrafı Kaldır
              </button>
            )}
          </>
        )}

        {/* Change password */}
        <button
          onClick={() => { onClose(); onChangePassword(); }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left"
          style={{ color: 'var(--color-on-surface)' }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--color-surface-high)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <span className="text-base">🔑</span>
          Şifremi Değiştir
        </button>

        {/* Dark mode toggle */}
        <button
          onClick={toggleTheme}
          className="w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
          style={{ color: 'var(--color-on-surface)' }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--color-surface-high)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <div className="flex items-center gap-3">
            <span className="text-base">🌙</span>
            Karanlık Mod
          </div>
          {/* Toggle pill */}
          <div className="w-10 h-5.5 rounded-full relative transition-colors shrink-0"
            style={{ background: isDark ? 'var(--color-primary)' : 'var(--color-surface-high)', height: '22px', width: '40px' }}>
            <div className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all"
              style={{ left: isDark ? '20px' : '2px', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }} />
          </div>
        </button>

        {/* Divider */}
        <div className="my-1" style={{ borderTop: '1px solid var(--color-surface-high)' }} />

        {/* Logout */}
        <button
          onClick={() => { onClose(); logout(); }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left"
          style={{ color: 'var(--color-danger)' }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--color-surface-high)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <span className="text-base">↩</span>
          Çıkış Yap
        </button>
      </div>
    </div>
    </>
  );
}

function AvatarButton({ user }) {
  const avatar = user?.avatar || null;

  return (
    <div
      className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center text-white text-sm font-bold shrink-0"
      style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-container))', boxShadow: 'var(--shadow-card)' }}
    >
      {avatar
        ? <img src={avatar} alt="avatar" className="w-full h-full object-cover" />
        : user?.name?.charAt(0)
      }
    </div>
  );
}

export function Header({ currentView, onNavigate, isDark, toggleTheme }) {
  const { user, logout, updateCurrentUser } = useAuth();
  const items = navItems.filter(n => n.roles.includes(user?.role));
  const [menuOpen, setMenuOpen] = useState(false);
  const [pwModalOpen, setPwModalOpen] = useState(false);
  const [cropSrc, setCropSrc] = useState(null);
  const menuRef = useRef(null);

  const handleAvatarChange = async (avatar) => {
    try {
      await dataService.updateAvatar(avatar);
      updateCurrentUser({ ...user, avatar: avatar || null });
    } catch {
      alert('Fotoğraf kaydedilemedi.');
    }
  };

  // Close on outside click — kırpma modalı açıkken menüyü kapatma
  useEffect(() => {
    const handler = (e) => {
      if (cropSrc) return;
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [cropSrc]);

  return (
    <>
    <header
      className="glass-editorial-light sticky top-0 z-20 transition-colors"
      style={{ borderBottom: '1px solid rgba(225,190,192,0.15)' }}
    >
      {/* Top row: Logo + User controls */}
      <div className="flex items-center justify-between px-4 sm:px-8 py-3 md:py-4">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 13, color: 'white', fontFamily: 'Manrope, sans-serif', flexShrink: 0 }}>HV</div>
          <span className="font-bold hidden sm:block" style={{ fontFamily: 'Manrope, sans-serif', fontSize: '1rem', color: 'var(--color-on-surface)', letterSpacing: '-0.02em' }}>HRBP Ziyaret</span>
        </div>

        {/* Avatar + dropdown menu (all screen sizes) */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(o => !o)}
            className="flex items-center gap-2 cursor-pointer"
            style={{ background: 'none', border: 'none', padding: 0 }}
          >
            <div className="text-right">
              <p className="text-sm font-bold leading-tight" style={{ color: 'var(--color-on-surface)', fontFamily: 'Manrope, sans-serif' }}>{user?.name}</p>
              <p className="text-xs font-medium" style={{ color: 'var(--color-muted)' }}>{user?.role === 'admin' ? '⚙ Admin' : user?.role === 'viewer' ? '👁 Görüntüleyici' : '👤 HRBP'}</p>
            </div>
            <AvatarButton user={user} /></button>
          {menuOpen && (
            <UserMenu
              user={user}
              isDark={isDark}
              toggleTheme={toggleTheme}
              logout={logout}
              onClose={() => setMenuOpen(false)}
              onAvatarChange={handleAvatarChange}
              onChangePassword={() => setPwModalOpen(true)}
              onOpenCrop={(src) => { setMenuOpen(false); setCropSrc(src); }}
            />
          )}
        </div>
      </div>

      {/* Nav row: full width, dynamic equal-size buttons */}
      <div className="px-3 sm:px-6 pb-3">
        <div
          className="flex items-center gap-1 p-1 rounded-full w-full"
          style={{ background: 'var(--color-surface-high)' }}
        >
          {items.map(item => {
            const active = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className="flex-1 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all duration-150 whitespace-nowrap text-center min-w-0"
                style={{
                  background: active ? 'var(--color-surface-card)' : 'transparent',
                  color: active ? 'var(--color-primary)' : 'var(--color-muted)',
                  boxShadow: active ? '0 4px 12px rgba(25,28,30,0.08)' : 'none',
                }}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>

      {createPortal(
        <ImageCropModal
          open={!!cropSrc}
          src={cropSrc}
          onConfirm={(b64) => { handleAvatarChange(b64); setCropSrc(null); }}
          onCancel={() => setCropSrc(null)}
        />,
        document.body
      )}
      {createPortal(<ChangePasswordModal open={pwModalOpen} onClose={() => setPwModalOpen(false)} />, document.body)}
    </>
  );
}

