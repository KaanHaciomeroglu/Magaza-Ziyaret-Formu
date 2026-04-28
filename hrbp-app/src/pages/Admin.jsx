import { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { dataService } from '../services/dataService';
import { Button } from '../components/ui/Button';
import { FormField, Input, PasswordInput, Select } from '../components/ui/FormField';
import { Modal, ConfirmDialog } from '../components/ui/Modal';
import { TableSkeleton } from '../components/ui/Skeleton';
import { ImageCropModal } from '../components/ui/ImageCropModal';

const emptyForm = { name: '', email: '', password: '', role: 'hrbp', isActive: true, avatar: '' };

function UserAvatar({ user, size = 40 }) {
  if (user.avatar) {
    return (
      <img
        src={user.avatar}
        alt={user.name}
        style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
      />
    );
  }
  return (
    <div
      style={{
        width: size, height: size, borderRadius: '50%', flexShrink: 0,
        background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-container))',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'white', fontSize: size * 0.35, fontWeight: 800,
      }}
    >
      {user.name?.charAt(0)}
    </div>
  );
}

function AvatarUpload({ value, onChange }) {
  const [cropSrc, setCropSrc] = useState(null);

  const handleFile = (e) => {
    const file = e.target.files[0];
    e.target.value = '';
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { alert('Dosya 5 MB\'dan küçük olmalı.'); return; }
    const reader = new FileReader();
    reader.onload = (ev) => setCropSrc(ev.target.result);
    reader.readAsDataURL(file);
  };

  return (
    <>
      <ImageCropModal
        open={!!cropSrc}
        src={cropSrc}
        onConfirm={(b64) => { onChange(b64); setCropSrc(null); }}
        onCancel={() => setCropSrc(null)}
      />
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
        {value ? (
          <img src={value} alt="Avatar" style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--color-surface-high)' }} />
        ) : (
          <div style={{
            width: 72, height: 72, borderRadius: '50%', flexShrink: 0,
            background: 'var(--color-surface-high)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--color-muted)', fontSize: 28,
          }}>👤</div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{
            display: 'inline-block', cursor: 'pointer', padding: '6px 14px',
            borderRadius: '0.75rem', fontSize: 13, fontWeight: 600,
            background: 'var(--color-surface-high)', color: 'var(--color-on-surface)',
            border: '1px solid rgba(225,190,192,0.3)',
          }}>
            {value ? 'Değiştir' : 'Fotoğraf Seç'}
            <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
          </label>
          {value && (
            <button type="button" onClick={() => onChange('')}
              style={{ fontSize: 12, color: 'var(--color-danger)', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0 }}>
              Kaldır
            </button>
          )}
          <span style={{ fontSize: 11, color: 'var(--color-muted)' }}>Max 5 MB, JPG/PNG</span>
        </div>
      </div>
    </>
  );
}

function validate(form, isEdit) {
  const e = {};
  if (!form.name.trim()) e.name = 'Ad Soyad zorunludur';
  if (!form.email.trim()) e.email = 'E-posta zorunludur';
  else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Geçerli e-posta girin';
  if (!isEdit && !form.password) e.password = 'Şifre zorunludur';
  if (form.password && form.password.length < 6) e.password = 'Şifre en az 6 karakter olmalı';
  if (!form.role) e.role = 'Rol seçiniz';
  return e;
}

export function Admin() {
  const toast = useToast();
  const { user: currentUser, updateCurrentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, edit: null });
  const [confirm, setConfirm] = useState({ open: false, user: null, action: null, label: '' });
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const load = async () => { const u = await dataService.getUsers(); setUsers(u); setLoading(false); };
  useEffect(() => { load(); }, []);

  const openAdd = () => { setForm(emptyForm); setErrors({}); setModal({ open: true, edit: null }); };
  const openEdit = (u) => { setForm({ ...u, password: '', avatar: u.avatar || '' }); setErrors({}); setModal({ open: true, edit: u }); };
  const closeModal = () => setModal({ open: false, edit: null });
  const setF = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSave = async (ev) => {
    ev.preventDefault();
    const e = validate(form, !!modal.edit);
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({}); setSaving(true);
    try {
      if (modal.edit) {
        const data = { ...form };
        if (!data.password) delete data.password;
        const updated = await dataService.updateUser(modal.edit.id, data);
        if (modal.edit.id === currentUser?.id) updateCurrentUser({ ...currentUser, ...updated });
        toast('Kullanıcı güncellendi', 'success');
      } else {
        await dataService.createUser(form);
        toast('Kullanıcı oluşturuldu', 'success');
      }
      closeModal(); load();
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const confirmAction = (u, action, label) => setConfirm({ open: true, user: u, action, label });
  const closeConfirm = () => setConfirm({ open: false, user: null, action: null, label: '' });

  const executeAction = async () => {
    const { user: u, action } = confirm;
    closeConfirm();
    try {
      if (action === 'delete') {
        await dataService.deleteUser(u.id);
        toast('Kullanıcı silindi', 'success');
      } else if (action === 'toggle') {
        await dataService.updateUser(u.id, { ...u, isActive: !u.isActive });
        toast(u.isActive ? 'Kullanıcı pasife alındı' : 'Kullanıcı aktifleştirildi', 'success');
      }
      load();
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  return (
    <div className="space-y-6 fade-in mb-12">
      <div className="flex justify-between items-end px-2">
        <div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight" style={{ fontFamily: 'Manrope, sans-serif', color: 'var(--color-on-surface)' }}>
            Kullanıcı Yönetimi.
          </h2>
          <p className="text-sm font-medium mt-1" style={{ color: 'var(--color-muted)' }}>{users.length} kayıtlı kullanıcı</p>
        </div>
        <Button onClick={openAdd} size="lg">+ Yeni Kullanıcı</Button>
      </div>

      {loading ? <TableSkeleton rows={4} /> : (
        <>
          {/* Mobil: Kart Görünümü */}
          <div className="md:hidden space-y-3">
            {users.map(u => (
              <div key={u.id} className="rounded-[2rem] p-2" style={{ background: 'var(--color-surface-low)' }}>
                <div className="bg-white rounded-[1.5rem] p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <UserAvatar user={u} size={48} />
                    <div className="flex-1 min-w-0">
                      <p className="font-extrabold text-base truncate" style={{ fontFamily: 'Manrope, sans-serif', color: 'var(--color-on-surface)' }}>{u.name}</p>
                      <p className="text-xs truncate font-medium" style={{ color: 'var(--color-muted)' }}>{u.email}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <span className="text-xs px-2.5 py-1 rounded-full font-bold" style={{
                        background: u.role === 'admin' ? 'var(--color-tertiary-container)' : u.role === 'viewer' ? 'rgba(99,102,241,0.1)' : 'var(--color-secondary-container)',
                        color: u.role === 'admin' ? 'var(--color-on-tertiary)' : u.role === 'viewer' ? '#6366f1' : 'var(--color-secondary)',
                      }}>
                        {u.role === 'admin' ? '⚙ Admin' : u.role === 'viewer' ? '👁 Görüntüleyici' : '👤 HRBP'}
                      </span>
                      <span className="text-xs px-2.5 py-1 rounded-full font-bold" style={{
                        background: u.isActive ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                        color: u.isActive ? 'var(--color-success)' : 'var(--color-danger)',
                      }}>
                        {u.isActive ? 'Aktif' : 'Pasif'}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-3" style={{ borderTop: '1px solid var(--color-surface-high)' }}>
                    <Button variant="ghost" size="sm" onClick={() => openEdit(u)} className="flex-1">Düzenle</Button>
                    <Button
                      variant="ghost" size="sm"
                      onClick={() => confirmAction(u, 'toggle', u.isActive ? 'Pasife Al' : 'Aktifleştir')}
                      style={{ color: u.isActive ? 'var(--color-warning)' : 'var(--color-success)' }}
                      className="flex-1"
                    >
                      {u.isActive ? 'Pasife Al' : 'Aktifleştir'}
                    </Button>
                    {u.role !== 'admin' && (
                      <Button variant="ghost" size="sm" style={{ color: 'var(--color-danger)' }}
                        onClick={() => confirmAction(u, 'delete', 'Sil')}
                        className="flex-1"
                      >Sil</Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Masaüstü: Tablo Görünümü */}
          <div className="hidden md:block rounded-[2rem] p-2" style={{ background: 'var(--color-surface-low)' }}>
            <div className="bg-white rounded-[1.5rem] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm" style={{ minWidth: '600px' }}>
                  <thead style={{ background: 'var(--color-surface-high)' }}>
                    <tr>
                      {['Ad Soyad', 'E-posta', 'Rol', 'Durum', 'İşlemler'].map(h => (
                        <th key={h} className="text-left px-5 py-4 text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-muted)' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u, i) => (
                      <tr key={u.id} style={{ borderTop: i === 0 ? 'none' : '1px solid rgba(225,190,192,0.1)' }}>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <UserAvatar user={u} size={40} />
                            <span className="font-bold text-base" style={{ color: 'var(--color-on-surface)' }}>{u.name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-sm font-medium" style={{ color: 'var(--color-muted)' }}>{u.email}</td>
                        <td className="px-5 py-4">
                          <span className="text-xs px-3 py-1 rounded-full font-bold" style={{
                            background: u.role === 'admin' ? 'var(--color-tertiary-container)' : 'var(--color-secondary-container)',
                            color: u.role === 'admin' ? 'var(--color-on-tertiary)' : 'var(--color-secondary)',
                          }}>
                            {u.role === 'admin' ? '⚙ Admin' : u.role === 'viewer' ? '👁 Görüntüleyici' : '👤 HRBP'}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-xs px-3 py-1 rounded-full font-bold" style={{
                            background: u.isActive ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                            color: u.isActive ? 'var(--color-success)' : 'var(--color-danger)',
                          }}>
                            {u.isActive ? 'Aktif' : 'Pasif'}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" onClick={() => openEdit(u)}>Düzenle</Button>
                            <Button variant="ghost" size="sm"
                              onClick={() => confirmAction(u, 'toggle', u.isActive ? 'Pasife Al' : 'Aktifleştir')}
                              style={{ color: u.isActive ? 'var(--color-warning)' : 'var(--color-success)' }}
                            >
                              {u.isActive ? 'Pasife Al' : 'Aktifleştir'}
                            </Button>
                            {u.role !== 'admin' && (
                              <Button variant="ghost" size="sm" style={{ color: 'var(--color-danger)' }}
                                onClick={() => confirmAction(u, 'delete', 'Sil')}
                              >Sil</Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}

      <Modal
        open={modal.open}
        onClose={closeModal}
        title={modal.edit ? 'Kullanıcı Düzenle' : 'Yeni Kullanıcı'}
        footer={
          <>
            <Button variant="ghost" onClick={closeModal}>İptal</Button>
            <Button loading={saving} onClick={handleSave}>{modal.edit ? 'Güncelle' : 'Kaydet'}</Button>
          </>
        }
      >
        <form onSubmit={handleSave} className="space-y-4">
          <FormField label="Profil Fotoğrafı">
            <AvatarUpload value={form.avatar} onChange={v => setF('avatar', v)} />
          </FormField>
          <FormField label="Ad Soyad" error={errors.name} required>
            <Input value={form.name} onChange={e => setF('name', e.target.value)} error={errors.name} placeholder="Ayşe Kaya" />
          </FormField>
          <FormField label="E-posta" error={errors.email} required>
            <Input type="email" value={form.email} onChange={e => setF('email', e.target.value)} error={errors.email} placeholder="ayse@firma.com" />
          </FormField>
          <FormField label={modal.edit ? 'Şifre (boş bırakılırsa değişmez)' : 'Şifre'} error={errors.password} required={!modal.edit}>
            <PasswordInput value={form.password} onChange={e => setF('password', e.target.value)} error={errors.password} placeholder="••••••" />
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Rol" error={errors.role} required>
              <Select value={form.role} onChange={e => setF('role', e.target.value)}>
                <option value="hrbp">HRBP</option>
                <option value="admin">Admin</option>
                <option value="viewer">Görüntüleyici</option>
              </Select>
            </FormField>
            <FormField label="Durum">
              <Select value={String(form.isActive)} onChange={e => setF('isActive', e.target.value === 'true')}>
                <option value="true">Aktif</option>
                <option value="false">Pasif</option>
              </Select>
            </FormField>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={confirm.open}
        onClose={closeConfirm}
        onConfirm={executeAction}
        title={confirm.label}
        message={
          confirm.action === 'delete'
            ? `"${confirm.user?.name}" kullanıcısını silmek istediğinize emin misiniz?`
            : confirm.user?.isActive
            ? `"${confirm.user?.name}" kullanıcısını pasife almak istediğinize emin misiniz? Bu kullanıcı giriş yapamayacak.`
            : `"${confirm.user?.name}" kullanıcısını aktifleştirmek istiyor musunuz?`
        }
        confirmLabel={confirm.label}
        danger={confirm.action === 'delete'}
      />
    </div>
  );
}
