import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/ui/Button';
import { Input, PasswordInput, FormField } from '../components/ui/FormField';

export function Login({ onSuccess }) {
  const { login } = useAuth();
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!email) e.email = 'E-posta zorunludur';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Geçerli bir e-posta girin';
    if (!password) e.password = 'Şifre zorunludur';
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setLoading(true);
    try {
      const user = await login(email, password);
      onSuccess(user);
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* ── Sol panel (masaüstü) ── */}
      <div className="hidden md:flex flex-col justify-between relative overflow-hidden"
        style={{
          flex: '1 1 0',
          background: 'linear-gradient(150deg, #7a0e2b 0%, #b31942 55%, #d53659 100%)',
          padding: '3rem',
        }}>

        {/* Dekoratif daireler */}
        <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: 320, height: 320, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
        <div style={{ position: 'absolute', bottom: '-60px', left: '-60px', width: 240, height: 240, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
        <div style={{ position: 'absolute', bottom: '30%', right: '8%', width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />

        {/* Logo */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 18, color: 'white', fontFamily: 'Manrope, sans-serif' }}>HV</div>
            <span style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800, fontSize: '1.3rem', color: 'white', letterSpacing: '-0.02em' }}>HRBP Ziyaret</span>
          </div>
        </div>

        {/* Alt yazı */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <p className="font-extrabold leading-tight mb-4" style={{ fontFamily: 'Manrope, sans-serif', fontSize: '2.5rem', color: 'white', letterSpacing: '-0.03em' }}>
            Mağaza Ziyaret<br />Yönetim Sistemi.
          </p>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.95rem', lineHeight: 1.6 }}>
            HRBP ziyaretlerini kayıt altına alın,<br />analiz edin ve raporlayın.
          </p>

          {/* Küçük özellik listesi */}
          <div className="mt-8 space-y-3">
            {[].map(f => (
              <div key={f} className="flex items-center gap-3">
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'rgba(255,255,255,0.5)', flexShrink: 0 }} />
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', fontWeight: 500 }}>{f}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Sağ panel — form ── */}
      <div className="flex flex-col items-center justify-center w-full p-4 md:p-12 md:w-[440px] md:flex-none"
        style={{ background: 'var(--color-surface)' }}>

        {/* Mobilde görünen başlık */}
        <div className="md:hidden w-full max-w-sm mb-6 text-center flex flex-col items-center">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.4rem' }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 13, color: 'white', fontFamily: 'Manrope, sans-serif' }}>HV</div>
            <p className="text-base font-bold" style={{ fontFamily: 'Manrope, sans-serif', color: 'var(--color-on-surface)', letterSpacing: '-0.02em' }}>
              Mağaza Ziyaret Sistemi
            </p>
          </div>
        </div>

        <div className="w-full max-w-sm fade-in">
          {/* Kart */}
          <div className="rounded-[2rem] p-2" style={{ background: 'var(--color-surface-low)' }}>
            <div className="rounded-[1.5rem] p-6" style={{ background: 'var(--color-surface-card)' }}>
              {/* Form başlığı — kart içinde ortalı */}
              <div className="mb-6 text-center">
                <p className="text-2xl font-extrabold mb-1" style={{ fontFamily: 'Manrope, sans-serif', color: 'var(--color-on-surface)', letterSpacing: '-0.02em' }}>
                  Hoş geldiniz
                </p>
                <p className="text-sm" style={{ color: 'var(--color-muted)' }}>Devam etmek için giriş yapın. viewer@test.com / viewer123</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <FormField label="E-posta" error={errors.email} required>
                  <Input
                    type="email"
                    placeholder="ornek@firma.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    error={errors.email}
                    autoComplete="email"
                  />
                </FormField>

                <FormField label="Şifre" error={errors.password} required>
                  <PasswordInput
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    error={errors.password}
                    autoComplete="current-password"
                  />
                </FormField>

                <Button type="submit" loading={loading} className="w-full mt-2" size="lg">
                  Giriş Yap
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>

  );
}
