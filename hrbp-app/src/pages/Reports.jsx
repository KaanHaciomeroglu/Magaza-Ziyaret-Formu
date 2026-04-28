import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { dataService } from '../services/dataService';
import { exportVisitsToExcel } from '../services/excelExport';
import { Button } from '../components/ui/Button';
import { Select, Input, FormField, SearchableSelect } from '../components/ui/FormField';
import { Modal } from '../components/ui/Modal';
import { TableSkeleton } from '../components/ui/Skeleton';

const rateColor = (r) => r >= 75 ? '#10b981' : r >= 50 ? '#f59e0b' : '#ef4444';
const fmtDate = (s) => { if (!s) return ''; const [y, m, d] = s.split('-'); return `${d}.${m}.${y}`; };

function DetailModal({ visit, open, onClose, isAdmin, onEdit, onDelete }) {
  if (!visit) return null;
  const rate = visit.normCount ? Math.round(visit.meetCount / visit.normCount * 100) : 0;

  return (
    <Modal open={open} onClose={onClose} title="Ziyaret Detayı" size="md"
      footer={
        isAdmin ? (
          <div className="flex gap-2 w-full justify-end">
            <Button variant="outline" onClick={() => { onClose(); onDelete(visit); }}
              style={{ color: '#ef4444', borderColor: 'rgba(239,68,68,0.4)' }}>
              🗑 Sil
            </Button>
            <Button variant="outline" onClick={() => { onClose(); onEdit(visit); }}>✏️ Düzenle</Button>
          </div>
        ) : null
      }
    >
      <div className="space-y-4">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-2xl font-extrabold tracking-tight" style={{ fontFamily: 'Manrope, sans-serif', color: 'var(--color-on-surface)' }}>
            {visit.storeName}
          </span>
          <span className="text-xs px-3 py-1 rounded-full font-bold"
            style={{ background: visit.hadMgr ? 'var(--color-secondary-container)' : 'rgba(239,68,68,0.1)', color: visit.hadMgr ? 'var(--color-secondary)' : 'var(--color-danger)' }}>
            {visit.hadMgr ? '✓ Müdür Görüşmesi' : '✕ Müdür Görüşmesi Yok'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[
            ['Ziyaret Tarihi', fmtDate(visit.visitDate)],
            ['HRBP', visit.hrbpName],
            ['Operasyon Bölgesi', visit.dirName],
            ['Bölge Müdürlüğü', visit.regionName],
            ['Bölge Müdürü', visit.dirMgr],
            ['Mağaza Müdürü', visit.storeMgr],
            ['Görüşülen Kişi Sayısı', visit.meetCount],
            ['Norm Kadro', visit.normCount],
          ].map(([label, val]) => (
            <div key={label} className="rounded-xl p-3" style={{ background: 'var(--color-surface-low)' }}>
              <p className="text-xs font-semibold mb-0.5" style={{ color: 'var(--color-muted)' }}>{label}</p>
              <p className="text-sm font-bold" style={{ color: 'var(--color-on-surface)' }}>{val ?? '—'}</p>
            </div>
          ))}
        </div>

        <div className="rounded-xl p-3" style={{ background: 'var(--color-surface-low)' }}>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold" style={{ color: 'var(--color-muted)' }}>Görüşme Oranı</p>
            <span className="text-sm font-extrabold" style={{ color: rateColor(rate) }}>%{rate}</span>
          </div>
          <div className="h-2.5 rounded-full overflow-hidden" style={{ background: 'var(--color-surface-high)' }}>
            <div className="h-2.5 rounded-full transition-all" style={{ width: `${Math.min(rate, 100)}%`, background: rateColor(rate) }} />
          </div>
        </div>

        {visit.notes && (
          <div className="rounded-xl p-4" style={{ background: 'rgba(182,28,68,0.04)', border: '1px solid rgba(179,25,66,0.08)' }}>
            <p className="text-xs font-semibold mb-1" style={{ color: 'var(--color-muted)' }}>Genel Not</p>
            <p className="text-sm italic" style={{ color: 'var(--color-on-surface)' }}>"{visit.notes}"</p>
          </div>
        )}
      </div>
    </Modal>
  );
}

function MobileCard({ visit, onClick }) {
  const rate = visit.normCount ? Math.round(visit.meetCount / visit.normCount * 100) : 0;
  return (
    <div
      className="rounded-[2rem] p-2 fade-in cursor-pointer active:scale-[0.99] transition-transform"
      style={{ background: 'var(--color-surface-low)' }}
      onClick={onClick}
    >
      <div className="bg-white rounded-[1.5rem] p-4">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div>
            <p className="font-extrabold text-base tracking-tight" style={{ fontFamily: 'Manrope, sans-serif', color: 'var(--color-on-surface)' }}>{visit.storeName}</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>{visit.hrbpName} · {visit.regionName}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-xs font-bold" style={{ color: 'var(--color-on-surface)' }}>{fmtDate(visit.visitDate)}</p>
            <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full font-bold"
              style={{ background: visit.hadMgr ? 'var(--color-secondary-container)' : 'rgba(239,68,68,0.1)', color: visit.hadMgr ? 'var(--color-secondary)' : 'var(--color-danger)' }}>
              {visit.hadMgr ? '✓ Görüşme' : '✕ Görüşme'}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--color-surface-high)' }}>
            <div className="h-1.5 rounded-full" style={{ width: `${Math.min(rate, 100)}%`, background: rateColor(rate) }} />
          </div>
          <span className="text-xs font-extrabold" style={{ color: rateColor(rate) }}>%{rate}</span>
          <span className="text-xs" style={{ color: 'var(--color-muted)' }}>{visit.meetCount}/{visit.normCount}</span>
        </div>
      </div>
    </div>
  );
}

const TABLE_COLS = [
  { key: 'id', label: '#' },
  { key: 'visitDate', label: 'Tarih' },
  { key: 'hrbpName', label: 'HRBP' },
  { key: 'dirName', label: 'Operasyon' },
  { key: 'regionName', label: 'Bölge' },
  { key: 'storeName', label: 'Mağaza' },
  { key: 'storeMgr', label: 'Müdür' },
  { key: null, label: 'Görüşülen/Norm' },
  { key: 'rate', label: 'Oran' },
];

function DeleteConfirmModal({ visit, open, onClose, onConfirm, loading }) {
  if (!open) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}>
      <div style={{ background: 'white', borderRadius: '1.5rem', padding: '2rem', maxWidth: 420, width: '90%', boxShadow: '0 24px 48px rgba(0,0,0,0.18)' }}
        onClick={e => e.stopPropagation()}>
        <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
          <span style={{ fontSize: 22 }}>🗑</span>
        </div>
        <h3 style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800, fontSize: 20, marginBottom: 8, color: 'var(--color-on-surface)' }}>Kaydı sil</h3>
        <p style={{ fontSize: 14, color: 'var(--color-muted)', marginBottom: 6 }}>
          <strong style={{ color: 'var(--color-on-surface)' }}>{visit?.storeName}</strong> mağazasına ait
          <strong style={{ color: 'var(--color-on-surface)' }}> {fmtDate(visit?.visitDate)}</strong> tarihli ziyaret kaydı silinecek.
        </p>
        <p style={{ fontSize: 13, color: 'var(--color-muted)', marginBottom: '1.5rem' }}>Bu işlem geri alınamaz, emin misiniz?</p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '10px', borderRadius: '0.75rem', border: '1px solid rgba(225,190,192,0.3)', background: 'var(--color-surface-low)', cursor: 'pointer', fontWeight: 600, fontSize: 14, color: 'var(--color-on-surface)' }}>
            Vazgeç
          </button>
          <button onClick={onConfirm} disabled={loading} style={{ flex: 1, padding: '10px', borderRadius: '0.75rem', border: 'none', background: '#ef4444', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: 14, color: 'white', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Siliniyor...' : 'Evet, Sil'}
          </button>
        </div>
      </div>
    </div>
  );
}

function DesktopTable({ visits, onRowClick, sortKey, sortDir, onSort }) {
  return (
    <div className="rounded-[2rem] p-2" style={{ background: 'var(--color-surface-low)' }}>
      <div className="bg-white rounded-[1.5rem] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm" style={{ minWidth: '960px' }}>
            <thead style={{ background: 'var(--color-surface-high)' }}>
              <tr>
                {TABLE_COLS.map(col => (
                  <th
                    key={col.label}
                    className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider"
                    style={{ color: col.key && sortKey === col.key ? 'var(--color-primary)' : 'var(--color-muted)', cursor: col.key ? 'pointer' : 'default', userSelect: 'none', whiteSpace: 'nowrap' }}
                    onClick={() => col.key && onSort(col.key)}
                  >
                    {col.label}
                    {col.key && (
                      <span style={{ marginLeft: 4, opacity: sortKey === col.key ? 1 : 0.3 }}>
                        {sortKey === col.key ? (sortDir === 'asc' ? '↑' : '↓') : '↕'}
                      </span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visits.map((v, i) => {
                const rate = v.normCount ? Math.round(v.meetCount / v.normCount * 100) : 0;
                const isDeleted = !!v.deletedAt;
                return (
                  <tr
                    key={v.id}
                    onClick={() => !isDeleted && onRowClick(v)}
                    className="transition-colors"
                    style={{
                      borderTop: i === 0 ? 'none' : '1px solid rgba(225,190,192,0.12)',
                      opacity: isDeleted ? 0.5 : 1,
                      cursor: isDeleted ? 'default' : 'pointer',
                      background: isDeleted ? 'rgba(239,68,68,0.03)' : '',
                    }}
                    onMouseEnter={e => { if (!isDeleted) e.currentTarget.style.background = 'var(--color-surface-low)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = isDeleted ? 'rgba(239,68,68,0.03)' : ''; }}
                  >
                    <td className="px-4 py-3 font-mono text-xs" style={{ color: 'var(--color-muted)' }}>{v.id}</td>
                    <td className="px-4 py-3 font-medium" style={{ color: 'var(--color-muted)', textDecoration: isDeleted ? 'line-through' : 'none' }}>{fmtDate(v.visitDate)}</td>
                    <td className="px-4 py-3 font-medium" style={{ color: 'var(--color-on-surface)' }}>{v.hrbpName}</td>
                    <td className="px-4 py-3 text-xs" style={{ color: 'var(--color-muted)' }}>{v.dirName}</td>
                    <td className="px-4 py-3 text-xs" style={{ color: 'var(--color-muted)' }}>{v.regionName}</td>
                    <td className="px-4 py-3 font-bold" style={{ color: 'var(--color-on-surface)' }}>{v.storeName}</td>
                    <td className="px-4 py-3 text-xs" style={{ color: 'var(--color-muted)' }}>{v.storeMgr || '—'}</td>
                    <td className="px-4 py-3 font-medium" style={{ color: 'var(--color-muted)' }}>{v.meetCount} / {v.normCount}</td>
                    <td className="px-4 py-3">
                      {isDeleted ? (
                        <div>
                          <span style={{ fontSize: 11, color: '#ef4444', fontWeight: 700 }}>Silindi</span>
                          <p style={{ fontSize: 10, color: 'var(--color-muted)', marginTop: 2 }}>{v.deletedBy}</p>
                          <p style={{ fontSize: 10, color: 'var(--color-muted)' }}>{v.deletedAt?.slice(0, 10)}</p>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--color-surface-high)' }}>
                            <div className="h-1.5 rounded-full" style={{ width: `${Math.min(rate, 100)}%`, background: rateColor(rate) }} />
                          </div>
                          <span className="text-xs font-extrabold" style={{ color: rateColor(rate) }}>%{rate}</span>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const PAGE_SIZE_OPTIONS = [10, 25, 50];

function Pagination({ page, totalPages, pageSize, onPage, onPageSize, totalItems }) {
  if (totalPages <= 1 && pageSize === PAGE_SIZE_OPTIONS[0] && totalItems <= PAGE_SIZE_OPTIONS[0]) return null;

  const pages = [];
  const delta = 1;
  const left = Math.max(2, page - delta);
  const right = Math.min(totalPages - 1, page + delta);

  pages.push(1);
  if (left > 2) pages.push('...');
  for (let i = left; i <= right; i++) pages.push(i);
  if (right < totalPages - 1) pages.push('...');
  if (totalPages > 1) pages.push(totalPages);

  const btnBase = {
    minWidth: 36, height: 36, borderRadius: '0.65rem', border: '1px solid rgba(225,190,192,0.25)',
    background: 'transparent', cursor: 'pointer', fontSize: 13, fontWeight: 600,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: 'var(--color-on-surface)', transition: 'all 0.15s',
  };
  const btnActive = { ...btnBase, background: 'var(--color-primary)', color: '#fff', border: 'none' };
  const btnDisabled = { ...btnBase, opacity: 0.3, cursor: 'not-allowed' };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginTop: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 12, color: 'var(--color-muted)', fontWeight: 600 }}>Sayfa başına</span>
        {PAGE_SIZE_OPTIONS.map(s => (
          <button key={s} onClick={() => onPageSize(s)}
            style={pageSize === s
              ? { ...btnBase, background: 'var(--color-surface-high)', borderColor: 'var(--color-primary)', color: 'var(--color-primary)' }
              : btnBase}
            onMouseEnter={e => { if (pageSize !== s) e.currentTarget.style.background = 'var(--color-surface-low)'; }}
            onMouseLeave={e => { if (pageSize !== s) e.currentTarget.style.background = 'transparent'; }}
          >{s}</button>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <button onClick={() => onPage(page - 1)} disabled={page === 1}
          style={page === 1 ? btnDisabled : btnBase}
          onMouseEnter={e => { if (page !== 1) e.currentTarget.style.background = 'var(--color-surface-low)'; }}
          onMouseLeave={e => { if (page !== 1) e.currentTarget.style.background = 'transparent'; }}
        >‹</button>

        {pages.map((p, i) =>
          p === '...' ? (
            <span key={`dots-${i}`} style={{ fontSize: 13, color: 'var(--color-muted)', padding: '0 4px' }}>…</span>
          ) : (
            <button key={p} onClick={() => onPage(p)}
              style={p === page ? btnActive : btnBase}
              onMouseEnter={e => { if (p !== page) e.currentTarget.style.background = 'var(--color-surface-low)'; }}
              onMouseLeave={e => { if (p !== page) e.currentTarget.style.background = 'transparent'; }}
            >{p}</button>
          )
        )}

        <button onClick={() => onPage(page + 1)} disabled={page === totalPages}
          style={page === totalPages ? btnDisabled : btnBase}
          onMouseEnter={e => { if (page !== totalPages) e.currentTarget.style.background = 'var(--color-surface-low)'; }}
          onMouseLeave={e => { if (page !== totalPages) e.currentTarget.style.background = 'transparent'; }}
        >›</button>
      </div>
    </div>
  );
}

export function Reports({ onEdit }) {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const canEdit = user?.role === 'admin' || user?.role === 'hrbp';

  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [operations, setOperations] = useState([]);
  const [regions, setRegions] = useState([]);
  const [stores, setStores] = useState([]);
  const [selected, setSelected] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [sortKey, setSortKey] = useState('id');
  const [sortDir, setSortDir] = useState('desc');

  const [filtersOpen, setFiltersOpen] = useState(false);

  const [filters, setFilters] = useState({
    hrbpId: '', dirId: '', regionId: '', storeId: '',
    startDate: '', endDate: '', hadMgr: '', idFilter: '',
  });

  useEffect(() => {
    Promise.all([
      dataService.getVisits({}, null),
      dataService.getOperations(),
      dataService.getRegions(),
      dataService.getStores(),
      dataService.getUsers(),
    ]).then(([v, ops, regs, sts, u]) => {
      setVisits(Array.isArray(v) ? v : []);
      setOperations(Array.isArray(ops) ? ops : []);
      setRegions(Array.isArray(regs) ? regs.sort((a, b) => {
        const n = s => Number((s.name || '').match(/(\d+)/)?.[1] ?? 999);
        return n(a) - n(b);
      }) : []);
      setStores(Array.isArray(sts) ? sts : []);
      setUsers(Array.isArray(u) ? u : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const setF = (k, v) => { setFilters(p => ({ ...p, [k]: v })); setPage(1); };

  const handleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({ hrbpId: '', dirId: '', regionId: '', storeId: '', startDate: '', endDate: '', hadMgr: '', idFilter: '' });
    setPage(1);
  };

  const filtered = visits.filter(v => {
    if (filters.idFilter && String(v.id) !== String(filters.idFilter.trim())) return false;
    if (filters.hrbpId && v.hrbpId !== Number(filters.hrbpId)) return false;
    if (filters.regionId && v.regionId !== Number(filters.regionId)) return false;
    if (filters.dirId && v.dirId !== Number(filters.dirId)) return false;
    if (filters.storeId && v.storeId !== Number(filters.storeId)) return false;
    if (filters.startDate && v.visitDate < filters.startDate) return false;
    if (filters.endDate && v.visitDate > filters.endDate) return false;
    if (filters.hadMgr === 'true' && !v.hadMgr) return false;
    if (filters.hadMgr === 'false' && v.hadMgr) return false;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    const av = sortKey === 'rate' ? (a.normCount ? Math.round(a.meetCount / a.normCount * 100) : 0) : a[sortKey];
    const bv = sortKey === 'rate' ? (b.normCount ? Math.round(b.meetCount / b.normCount * 100) : 0) : b[sortKey];
    if (av == null) return 1;
    if (bv == null) return -1;
    const cmp = typeof av === 'number' ? av - bv : String(av).localeCompare(String(bv));
    return sortDir === 'asc' ? cmp : -cmp;
  });

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginated = sorted.slice((safePage - 1) * pageSize, safePage * pageSize);

  const hasFilters = Object.values(filters).some(Boolean);


  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await dataService.deleteVisit(deleteTarget.id);
      setVisits(prev => prev.map(v =>
        v.id === deleteTarget.id
          ? { ...v, deletedAt: new Date().toISOString().slice(0, 19).replace('T', ' '), deletedBy: user.email }
          : v
      ));
      setDeleteTarget(null);
    } catch (e) {
      alert(e.message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6 fade-in mb-12">
      <div className="rounded-[2rem] p-2" style={{ background: 'var(--color-surface-low)' }}>
        <div className="bg-white rounded-[1.5rem] p-5 sm:p-6">
          <button
            onClick={() => setFiltersOpen(o => !o)}
            className="w-full flex items-center justify-between mb-1"
          >
            <span className="text-sm font-bold" style={{ color: 'var(--color-on-surface)' }}>
              Filtreler {hasFilters && <span className="ml-1 px-2 py-0.5 rounded-full text-xs" style={{ background: 'var(--color-primary)', color: '#fff' }}>Aktif</span>}
            </span>
            <span style={{ color: 'var(--color-muted)', fontSize: 12 }}>{filtersOpen ? '▲' : '▼'}</span>
          </button>

          {filtersOpen && (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
                <FormField label="Form ID">
                  <Input
                    type="number"
                    placeholder="Form numarası"
                    value={filters.idFilter}
                    onChange={e => setF('idFilter', e.target.value)}
                  />
                </FormField>
                <FormField label="HRBP">
                  <SearchableSelect
                    value={filters.hrbpId}
                    onChange={v => setF('hrbpId', v)}
                    placeholder="Tüm HRBP'ler"
                    options={users.filter(u => u.role !== 'admin').map(u => ({ value: u.id, label: u.name }))}
                  />
                </FormField>
                <FormField label="Operasyon">
                  <SearchableSelect
                    value={filters.dirId}
                    onChange={v => setF('dirId', v)}
                    placeholder="Tüm Operasyonlar"
                    options={operations.map(o => ({ value: o.id, label: o.name }))}
                  />
                </FormField>
                <FormField label="Bölge">
                  <SearchableSelect
                    value={filters.regionId}
                    onChange={v => setF('regionId', v)}
                    placeholder="Tüm Bölgeler"
                    options={regions.map(r => ({ value: r.id, label: r.name }))}
                  />
                </FormField>
                <FormField label="Mağaza">
                  <SearchableSelect
                    value={filters.storeId}
                    onChange={v => setF('storeId', v)}
                    placeholder="Tüm Mağazalar"
                    options={stores.map(s => ({ value: s.id, label: s.name }))}
                  />
                </FormField>
                <FormField label="Başlangıç Tarihi">
                  <Input type="date" value={filters.startDate} onChange={e => setF('startDate', e.target.value)} />
                </FormField>
                <FormField label="Bitiş Tarihi">
                  <Input type="date" value={filters.endDate} onChange={e => setF('endDate', e.target.value)} />
                </FormField>
                <FormField label="Müdür Görüşmesi">
                  <Select value={filters.hadMgr} onChange={e => setF('hadMgr', e.target.value)}>
                    <option value="">Tümü</option>
                    <option value="true">Evet</option>
                    <option value="false">Hayır</option>
                  </Select>
                </FormField>
              </div>
              {hasFilters && (
                <div className="mt-3">
                  <button onClick={clearFilters} className="text-sm font-semibold" style={{ color: 'var(--color-primary)' }}>✕ Filtreleri Temizle</button>
                </div>
              )}
            </>
          )}

        </div>
      </div>

      <div className="flex justify-end">
        <Button size="md" variant="secondary" onClick={() => exportVisitsToExcel(sorted)}>
          📥 Excel İndir ({sorted.length})
        </Button>
      </div>

      {loading ? <TableSkeleton rows={5} /> : (
        <>
          <p className="text-xs px-2 font-medium" style={{ color: 'var(--color-muted)' }}>
            {sorted.length} kayıt bulundu
            {sorted.length > 0 && (
              <span style={{ marginLeft: 8, color: 'var(--color-muted)', opacity: 0.7 }}>
                · {(safePage - 1) * pageSize + 1}–{Math.min(safePage * pageSize, sorted.length)} arası gösteriliyor
              </span>
            )}
          </p>

          {sorted.length === 0 ? (
            <div className="rounded-[2rem] p-12 text-center" style={{ background: 'rgba(182,28,68,0.03)' }}>
              <p className="text-4xl mb-4">📭</p>
              <p className="font-extrabold text-xl" style={{ fontFamily: 'Manrope, sans-serif', color: 'var(--color-on-surface)' }}>Kayıt bulunamadı</p>
              <p className="text-base mt-2" style={{ color: 'var(--color-light-text)' }}>Filtrelerinizi değiştirip tekrar deneyin</p>
            </div>
          ) : (
            <>
              {/* PC: tablo */}
              <div className="hidden md:block">
                <DesktopTable visits={paginated} onRowClick={setSelected} sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
              </div>

              {/* Mobil: kartlar */}
              <div className="md:hidden space-y-3">
                {paginated.map(v => (
                  <MobileCard key={v.id} visit={v} onClick={() => setSelected(v)} />
                ))}
              </div>

              <Pagination
                page={safePage}
                totalPages={totalPages}
                pageSize={pageSize}
                totalItems={filtered.length}
                onPage={setPage}
                onPageSize={s => { setPageSize(s); setPage(1); }}
              />
            </>
          )}
        </>
      )}

      <DetailModal
        visit={selected}
        open={!!selected}
        onClose={() => setSelected(null)}
        isAdmin={canEdit}
        onEdit={onEdit}
        onDelete={v => { setSelected(null); setDeleteTarget(v); }}
      />

      <DeleteConfirmModal
        visit={deleteTarget}
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  );
}
