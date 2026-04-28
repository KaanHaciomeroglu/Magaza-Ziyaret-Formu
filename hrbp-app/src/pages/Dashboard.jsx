import { useState, useEffect, useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { dataService } from '../services/dataService';
import { CardSkeleton } from '../components/ui/Skeleton';

const COLORS = ['#fb5373', '#006a67', '#8cf4ef', '#b7ad5b', '#10b981', '#f59e0b', '#6366f1', '#ec4899'];

function PieTooltip({ active, payload, total }) {
  if (!active || !payload?.length) return null;
  const { name, value } = payload[0].payload;
  const pct = total ? Math.round(value / total * 100) : 0;
  return (
    <div style={{ borderRadius: '0.75rem', padding: '8px 14px', background: 'var(--color-surface-card)', boxShadow: 'var(--shadow-card)', fontSize: 13, color: 'var(--color-on-surface)' }}>
      <p style={{ fontWeight: 700, marginBottom: 2 }}>{name}</p>
      <p>{value} form &nbsp;·&nbsp; %{pct}</p>
    </div>
  );
}

const bolgeNo = (name) => {
  const m = String(name).match(/(\d+)/);
  return m ? Number(m[1]) : 999;
};

function StatCard({ label, value, sub, icon, accent }) {
  const accentColor = accent || 'var(--color-primary-light)';
  return (
    <div className="rounded-[2rem] p-1.5 sm:p-2 transition-all hover:scale-[1.02]" style={{ background: 'var(--color-surface-low)' }}>
      <div className="bg-white rounded-[1.5rem] p-4 sm:p-5 h-full flex flex-col justify-between fade-in relative overflow-hidden">
        {/* Dekoratif arka plan lekeleri */}
        <div style={{ position: 'absolute', top: -28, right: -28, width: 90, height: 90, borderRadius: '50%', background: accentColor, opacity: 0.08, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: -10, right: -10, width: 50, height: 50, borderRadius: '50%', background: accentColor, opacity: 0.07, pointerEvents: 'none' }} />

        <div className="flex items-start justify-between mb-3">
          <p className="text-xs font-bold uppercase tracking-wider leading-tight" style={{ color: 'var(--color-muted)' }}>{label}</p>
          {icon && (
            <span className="text-lg leading-none flex-shrink-0 opacity-70">{icon}</span>
          )}
        </div>
        <div>
          <p className="text-3xl sm:text-4xl font-extrabold mb-1" style={{ fontFamily: 'Manrope, sans-serif', color: accentColor, letterSpacing: '-0.03em' }}>{value}</p>
          {sub && <p className="text-xs font-medium" style={{ color: 'var(--color-light-text)' }}>{sub}</p>}
        </div>
      </div>
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <div className="rounded-[2rem] p-2" style={{ background: 'var(--color-surface-low)' }}>
      <div className="bg-white rounded-[1.5rem] p-6 h-full fade-in">
        <h3 className="text-lg font-bold mb-6 tracking-tight" style={{ fontFamily: 'Manrope, sans-serif', color: 'var(--color-on-surface)' }}>{title}</h3>
        {children}
      </div>
    </div>
  );
}

const rateColor = (r) => r >= 75 ? '#10b981' : r >= 50 ? '#f59e0b' : '#ef4444';

const COLS = [
  { key: 'id', label: '#' },
  { key: 'visitDate', label: 'Tarih' },
  { key: 'hrbpName', label: 'HRBP' },
  { key: 'storeName', label: 'Mağaza' },
  { key: 'meetCount', label: 'Görüşülen' },
  { key: 'normCount', label: 'Norm Kadro' },
  { key: 'rate', label: 'Oran' },
];

const PAGE_SIZE = 10;

function SortIcon({ col, sortKey, sortDir }) {
  if (sortKey !== col) return <span style={{ color: 'var(--color-surface-high)' }}>↕</span>;
  return <span style={{ color: 'var(--color-primary)' }}>{sortDir === 'asc' ? '↑' : '↓'}</span>;
}

function VisitRatioTable({ visitRows }) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState('id');
  const [sortDir, setSortDir] = useState('desc');
  const [page, setPage] = useState(1);

  const handleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
    setPage(1);
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return visitRows.filter(v =>
      !q ||
      v.hrbpName?.toLowerCase().includes(q) ||
      v.storeName?.toLowerCase().includes(q) ||
      v.regionName?.toLowerCase().includes(q) ||
      v.visitDate?.includes(q)
    );
  }, [visitRows, search]);

  const sorted = useMemo(() => [...filtered].sort((a, b) => {
    const av = a[sortKey], bv = b[sortKey];
    if (av == null) return 1;
    if (bv == null) return -1;
    const cmp = typeof av === 'number' ? av - bv : String(av).localeCompare(String(bv));
    return sortDir === 'asc' ? cmp : -cmp;
  }), [filtered, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const paginated = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <ChartCard title="Görüşülen Kişi Oranı">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <input
          type="text"
          placeholder="HRBP, mağaza veya tarih ara..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          className="w-full sm:max-w-xs px-4 py-2 text-sm rounded-xl outline-none focus:ring-2"
          style={{
            background: 'var(--color-surface-high)',
            border: '1px solid rgba(225,190,192,0.2)',
            color: 'var(--color-on-surface)',
            focusRingColor: 'var(--color-primary)',
          }}
        />
        <p className="text-xs shrink-0" style={{ color: 'var(--color-muted)' }}>
          {filtered.length} kayıt
        </p>
      </div>

      {/* Mobil: Kart Görünümü */}
      <div className="md:hidden space-y-3">
        {paginated.length === 0 ? (
          <p className="py-8 text-center text-sm" style={{ color: 'var(--color-muted)' }}>Sonuç bulunamadı</p>
        ) : paginated.map(v => (
          <div key={v.id} className="rounded-2xl p-4" style={{ background: 'var(--color-surface-low)' }}>
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <p className="font-extrabold text-base" style={{ fontFamily: 'Manrope, sans-serif', color: 'var(--color-on-surface)' }}>{v.storeName}</p>
                <p className="text-xs mt-0.5 font-medium" style={{ color: 'var(--color-muted)' }}>{v.hrbpName} · {v.visitDate?.split('-').reverse().join('.')}</p>
              </div>
              <span className="text-xl font-extrabold shrink-0" style={{ color: rateColor(v.rate), fontFamily: 'Manrope, sans-serif' }}>%{v.rate}</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden mb-3" style={{ background: 'var(--color-surface-high)' }}>
              <div className="h-2 rounded-full transition-all" style={{ width: `${Math.min(v.rate, 100)}%`, background: rateColor(v.rate) }} />
            </div>
            <div className="flex gap-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider mb-0.5" style={{ color: 'var(--color-muted)' }}>Görüşülen</p>
                <p className="font-bold text-sm" style={{ color: 'var(--color-on-surface)' }}>{v.meetCount}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider mb-0.5" style={{ color: 'var(--color-muted)' }}>Norm Kadro</p>
                <p className="font-bold text-sm" style={{ color: 'var(--color-on-surface)' }}>{v.normCount}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Masaüstü: Tablo Görünümü */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm" style={{ minWidth: '580px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--color-surface-high)' }}>
              {COLS.map(c => (
                <th
                  key={c.key}
                  className="text-left pb-3 pr-2 font-bold uppercase tracking-wider text-xs cursor-pointer select-none"
                  style={{ color: sortKey === c.key ? 'var(--color-primary)' : 'var(--color-muted)' }}
                  onClick={() => handleSort(c.key)}
                >
                  <span className="flex items-center gap-1">
                    {c.label} <SortIcon col={c.key} sortKey={sortKey} sortDir={sortDir} />
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr><td colSpan={7} className="py-8 text-center text-sm" style={{ color: 'var(--color-muted)' }}>Sonuç bulunamadı</td></tr>
            ) : paginated.map(v => (
              <tr key={v.id} style={{ borderBottom: '1px solid var(--color-surface-high)' }}>
                <td className="py-3 pr-2 font-mono text-xs" style={{ color: 'var(--color-muted)' }}>{v.id}</td>
                <td className="py-3 pr-2 font-medium" style={{ color: 'var(--color-muted)' }}>{v.visitDate?.split('-').reverse().join('.')}</td>
                <td className="py-3 pr-2 font-medium" style={{ color: 'var(--color-on-surface)' }}>{v.hrbpName}</td>
                <td className="py-3 pr-2 font-bold" style={{ color: 'var(--color-on-surface)' }}>{v.storeName}</td>
                <td className="py-3 pr-2 font-medium" style={{ color: 'var(--color-muted)' }}>{v.meetCount}</td>
                <td className="py-3 pr-2 font-medium" style={{ color: 'var(--color-muted)' }}>{v.normCount}</td>
                <td className="py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'var(--color-surface-high)', minWidth: '50px' }}>
                      <div className="h-2 rounded-full transition-all" style={{ width: `${Math.min(v.rate, 100)}%`, background: rateColor(v.rate) }} />
                    </div>
                    <span className="font-extrabold w-9 text-right text-xs" style={{ color: rateColor(v.rate) }}>%{v.rate}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 pt-4" style={{ borderTop: '1px solid var(--color-surface-high)' }}>
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 text-xs font-medium rounded-lg disabled:opacity-40 transition-colors"
            style={{ background: 'var(--color-surface-high)', color: 'var(--color-on-surface)' }}
          >
            ← Önceki
          </button>
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(n => n === 1 || n === totalPages || Math.abs(n - page) <= 1)
              .reduce((acc, n, idx, arr) => {
                if (idx > 0 && n - arr[idx - 1] > 1) acc.push('…');
                acc.push(n);
                return acc;
              }, [])
              .map((n, i) =>
                n === '…' ? (
                  <span key={`ellipsis-${i}`} className="px-1 text-xs" style={{ color: 'var(--color-muted)' }}>…</span>
                ) : (
                  <button
                    key={n}
                    onClick={() => setPage(n)}
                    className="w-7 h-7 text-xs font-bold rounded-lg transition-all"
                    style={{
                      background: page === n ? 'var(--color-primary)' : 'var(--color-surface-high)',
                      color: page === n ? '#fff' : 'var(--color-muted)',
                    }}
                  >
                    {n}
                  </button>
                )
              )}
          </div>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1.5 text-xs font-medium rounded-lg disabled:opacity-40 transition-colors"
            style={{ background: 'var(--color-surface-high)', color: 'var(--color-on-surface)' }}
          >
            Sonraki →
          </button>
        </div>
      )}
    </ChartCard>
  );
}

export function Dashboard() {
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dataService.getVisits({}, null)
      .then(d => { setVisits(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 fade-in">
      {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
    </div>
  );

  const totalVisits = visits.length;
  const mgr = visits.filter(v => v.hadMgr).length;
  const mgrRate = totalVisits ? Math.round(mgr / totalVisits * 100) : 0;
  const totalMeet = visits.reduce((s, v) => s + v.meetCount, 0);
  const totalNorm = visits.reduce((s, v) => s + v.normCount, 0);

  // HRBP pie
  const byHrbp = Object.values(visits.reduce((acc, v) => {
    acc[v.hrbpName] = acc[v.hrbpName] || { name: v.hrbpName, value: 0 };
    acc[v.hrbpName].value++;
    return acc;
  }, {}));

  // Region pie
  const byRegion = Object.values(visits.reduce((acc, v) => {
    const key = v.dirName || 'Bilinmiyor';
    acc[key] = acc[key] || { name: key, value: 0 };
    acc[key].value++;
    return acc;
  }, {}));

  // Meeting pie
  const meetingPie = [
    { name: 'Görüşme Yapıldı', value: mgr },
    { name: 'Yapılmadı', value: totalVisits - mgr },
  ];

  const visitRows = visits
    .map(v => ({ ...v, rate: v.normCount ? Math.round(v.meetCount / v.normCount * 100) : 0 }))
    .sort((a, b) => b.visitDate.localeCompare(a.visitDate));

  // Bar chart — bölge bazlı, bölge numarasına göre sıralı
  const byBolge = Object.values(visits.reduce((acc, v) => {
    const key = v.regionName || 'Bilinmiyor';
    acc[key] = acc[key] || { name: key, value: 0 };
    acc[key].value++;
    return acc;
  }, {})).sort((a, b) => bolgeNo(a.name) - bolgeNo(b.name));
  const barData = byBolge.map(r => ({ name: r.name, Ziyaret: r.value }));

  const overallRate = totalNorm ? Math.round(totalMeet / totalNorm * 100) : 0;

  return (
    <div className="space-y-5 fade-in">
      {/* Page header */}
      <div className="rounded-[2rem] p-2" style={{ background: 'var(--color-surface-low)' }}>
        <div className="rounded-[1.5rem] px-6 py-5 flex items-center justify-between gap-4 flex-wrap"
          style={{ background: '#FB5373', overflow: 'hidden', position: 'relative' }}>
          <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.07)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: -20, right: 80, width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', pointerEvents: 'none' }} />
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.6)', letterSpacing: '0.1em' }}>Genel Bakış</p>
            <p className="font-extrabold text-2xl text-white" style={{ fontFamily: 'Manrope, sans-serif', letterSpacing: '-0.02em' }}>Dashboard</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-2xl" style={{ background: 'rgba(255,255,255,0.12)' }}>
            <span className="text-2xl font-extrabold text-white" style={{ fontFamily: 'Manrope, sans-serif' }}>%{overallRate}</span>
            <span className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.7)' }}>görüşülen kişi oranı</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
        <StatCard label="Toplam Ziyaret" value={totalVisits} icon="🏪" accent="var(--color-primary-light)" />
        <StatCard label="Müdür Görüşme Oranı" value={`%${mgrRate}`} sub={`${mgr} / ${totalVisits} ziyaret`} icon="🤝" accent="var(--color-secondary)" />
        <StatCard label="Toplam Görüşülen" value={totalMeet} sub={`Norm: ${totalNorm}`} icon="👥" accent="#6366f1" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ChartCard title="HRBP Bazlı Ziyaret Grafiği">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart style={{ outline: 'none' }}>
              <Pie data={byHrbp} cx="50%" cy="50%" innerRadius={55} outerRadius={75} paddingAngle={4} dataKey="value" stroke="none" style={{ outline: 'none' }}>
                {byHrbp.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip content={<PieTooltip total={totalVisits} />} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '12px', color: 'var(--color-on-surface)' }}
                formatter={(value, entry) => `${value} (${entry.payload.value})`} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Operasyon Bazlı Ziyaret Grafiği">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart style={{ outline: 'none' }}>
              <Pie data={byRegion} cx="50%" cy="50%" innerRadius={55} outerRadius={75} paddingAngle={4} dataKey="value" stroke="none" style={{ outline: 'none' }}>
                {byRegion.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip content={<PieTooltip total={totalVisits} />} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '12px', color: 'var(--color-on-surface)' }}
                formatter={(value, entry) => `${value} (${entry.payload.value})`} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Müdür / Müdür Yardımcısı İle Görüşme Yapıldı Mı?">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart style={{ outline: 'none' }}>
              <Pie data={meetingPie} cx="50%" cy="50%" innerRadius={55} outerRadius={75} paddingAngle={4} dataKey="value" stroke="none" style={{ outline: 'none' }}>
                <Cell fill="#10b981" />
                <Cell fill="#ef4444" />
              </Pie>
              <Tooltip content={<PieTooltip total={totalVisits} />} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '12px', color: 'var(--color-on-surface)' }}
                formatter={(value, entry) => `${value} (${entry.payload.value})`} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <ChartCard title="Bölge Bazlı Ziyaret Sıklığı Grafiği">
        <div style={{ overflowX: 'auto', overflowY: 'hidden' }}>
          <ResponsiveContainer width="100%" height={300} minWidth={barData.length * 48}>
            <BarChart data={barData} barSize={32} margin={{ top: 4, right: 8, left: 0, bottom: 64 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="transparent" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: 'var(--color-muted)', fontWeight: 600 }}
                axisLine={false}
                tickLine={false}
                angle={-45}
                textAnchor="end"
                interval={0}
                tickFormatter={v => {
                  const m = String(v).match(/(\d+)/);
                  return m ? `${m[1]}. Bölge` : v;
                }}
              />
              <YAxis tick={{ fontSize: 11, fill: 'var(--color-muted)' }} axisLine={false} tickLine={false} width={30} />
              <Tooltip cursor={{ fill: 'var(--color-surface-low)' }} contentStyle={{ borderRadius: '1rem', border: 'none', background: 'var(--color-surface-card)', color: 'var(--color-on-surface)', boxShadow: 'var(--shadow-card)' }} />
              <Bar dataKey="Ziyaret" radius={[8, 8, 8, 8]} fill="url(#barGrad)" />
              <defs>
                <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#fb5373" />
                  <stop offset="100%" stopColor="#d53659" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      <VisitRatioTable visitRows={visitRows} />
    </div>
  );
}
