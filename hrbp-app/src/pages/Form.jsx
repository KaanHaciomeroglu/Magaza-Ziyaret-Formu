import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { dataService } from '../services/dataService';
import { Button } from '../components/ui/Button';
import { ConfirmDialog } from '../components/ui/Modal';
import { FormField, Input, Textarea, ReadonlyField, Toggle, SearchableSelect } from '../components/ui/FormField';
import { Skeleton } from '../components/ui/Skeleton';

const today = () => new Date().toISOString().split('T')[0];

function SectionDivider({ label }) {
  return (
    <div className="flex items-center gap-3 my-2">
      <span className="text-xs font-bold tracking-widest uppercase px-2.5 py-1 rounded-full"
        style={{ background: '#FB5373', color: 'white', letterSpacing: '0.08em' }}>
        {label}
      </span>
      <div className="flex-1" style={{ height: 1, background: 'var(--color-surface-high)' }} />
    </div>
  );
}

const empty = (user) => ({
  hrbpName: user?.name || '',
  visitDate: today(),
  // dirId/dirName/dirMgr = Operasyon
  dirId: '', dirName: '', dirMgr: '',
  // regionId/regionName/regionMgr = Bölge
  regionId: '', regionName: '', regionMgr: '',
  // store
  storeId: '', storeName: '', storeMgr: '',
  hadMgr: '',
  meetCount: '',
  normCount: '',
  notes: '',
});

function ManagerField({ label, value, managers, onChange, locked }) {
  if (locked && value) return <ReadonlyField label={label} value={value} />;
  return (
    <FormField label={label}>
      <SearchableSelect
        value={value}
        onChange={onChange}
        placeholder="— Seçin veya boş bırakın —"
        options={managers.map(m => ({ value: m, label: m }))}
      />
    </FormField>
  );
}

export function VisitForm({ editVisit, onEditDone, onVisitSaved }) {
  const { user } = useAuth();
  const toast = useToast();
  const isEdit = !!editVisit;

  const [form, setForm] = useState(isEdit ? {
    ...editVisit,
    dirMgr: editVisit.dirMgr || '',
    regionMgr: editVisit.regionMgr || '',
    meetCount: String(editVisit.meetCount),
    normCount: String(editVisit.normCount),
    hadMgr: String(editVisit.hadMgr),
  } : empty(user));

  const [operations, setOperations] = useState([]);
  const [regions, setRegions] = useState([]);
  const [stores, setStores] = useState([]);
  const [opManagers, setOpManagers] = useState([]);
  const [regionManagers, setRegionManagers] = useState([]);
  const [storeManagers, setStoreManagers] = useState([]);
  const [loading, setLoading] = useState({ ops: true, regions: false, stores: false, submit: false });
  const [errors, setErrors] = useState({});
  const [autoFilled, setAutoFilled] = useState({ dirMgr: isEdit && !!editVisit?.dirMgr, regionMgr: isEdit && !!editVisit?.regionMgr, storeMgr: isEdit && !!editVisit?.storeMgr });

  useEffect(() => {
    Promise.all([
      dataService.getOperations(),
      dataService.getOperationManagers(),
      dataService.getRegionManagers(),
      dataService.getStoreManagers(),
    ]).then(([ops, opMgrs, rgMgrs, stMgrs]) => {
      setOperations(Array.isArray(ops) ? ops : []);
      setOpManagers(Array.isArray(opMgrs) ? opMgrs : []);
      setRegionManagers(Array.isArray(rgMgrs) ? rgMgrs : []);
      setStoreManagers(Array.isArray(stMgrs) ? stMgrs : []);
      setLoading(p => ({ ...p, ops: false }));
    });
  }, []);

  // Edit modunda zinciri yeniden yükle
  useEffect(() => {
    if (!isEdit) return;
    if (editVisit.dirId) {
      dataService.getRegions(editVisit.dirId).then(d => setRegions(Array.isArray(d) ? d : []));
    }
    if (editVisit.regionId) {
      dataService.getStores(editVisit.regionId).then(d => setStores(Array.isArray(d) ? d : []));
    }
  }, [isEdit, editVisit]);

  const set = (key, val) => setForm(p => ({ ...p, [key]: val }));

  // 1. Operasyon seçildi → müdür dol, bölgeleri yükle
  const handleOperation = async (opId) => {
    const op = operations.find(o => o.id === Number(opId));
    setForm(p => ({
      ...p,
      dirId: opId ? Number(opId) : '',
      dirName: op?.name || '',
      dirMgr: op?.mgr || '',
      regionId: '', regionName: '', regionMgr: '',
      storeId: '', storeName: '', storeMgr: '',
    }));
    setAutoFilled(p => ({ ...p, dirMgr: !!op?.mgr, regionMgr: false, storeMgr: false }));
    setRegions([]); setStores([]);
    if (!opId) return;
    setLoading(p => ({ ...p, regions: true }));
    const d = await dataService.getRegions(opId);
    setRegions(Array.isArray(d) ? d : []);
    setLoading(p => ({ ...p, regions: false }));
  };

  // 2. Bölge seçildi → müdür dol, mağazaları yükle
  const handleRegion = async (regionId) => {
    const region = regions.find(r => r.id === Number(regionId));
    setForm(p => ({
      ...p,
      regionId: regionId ? Number(regionId) : '',
      regionName: region?.name || '',
      regionMgr: region?.bolgeMuduru || '',
      storeId: '', storeName: '', storeMgr: '',
    }));
    setAutoFilled(p => ({ ...p, regionMgr: !!region?.bolgeMuduru, storeMgr: false }));
    setStores([]);
    if (!regionId) return;
    setLoading(p => ({ ...p, stores: true }));
    const s = await dataService.getStores(regionId);
    setStores(Array.isArray(s) ? s : []);
    setLoading(p => ({ ...p, stores: false }));
  };

  // 3. Mağaza seçildi → müdür dol
  const handleStore = (storeId) => {
    const store = stores.find(s => s.id === Number(storeId));
    setForm(p => ({
      ...p,
      storeId: storeId ? Number(storeId) : '',
      storeName: store?.name || '',
      storeMgr: store?.mgr || '',
      normCount: store?.norm ? String(store.norm) : p.normCount,
    }));
    setAutoFilled(p => ({ ...p, storeMgr: !!store?.mgr }));
  };

  const validate = () => {
    const e = {};
    if (!form.visitDate) e.visitDate = 'Tarih zorunludur';
    if (!form.dirId) e.dirId = 'Operasyon seçiniz';
    if (!form.regionId) e.regionId = 'Bölge seçiniz';
    if (!form.storeId) e.storeId = 'Mağaza seçiniz';
    if (!form.hadMgr) e.hadMgr = 'Görüşme durumu seçiniz';
    if (!form.meetCount && form.meetCount !== 0) e.meetCount = 'Görüşülen kişi sayısı zorunludur';
    else if (Number(form.meetCount) < 0) e.meetCount = 'Geçerli bir sayı girin';
    if (form.normCount === '' || form.normCount === null || form.normCount === undefined) e.normCount = 'Norm kadro sayısı zorunludur';
    else if (Number(form.normCount) < 0) e.normCount = 'Geçerli bir sayı girin';
    if (!form.notes?.trim()) e.notes = 'Genel not zorunludur';
    return e;
  };

  const [showNormConfirm, setShowNormConfirm] = useState(false);

  const doSave = async () => {
    setLoading(p => ({ ...p, submit: true }));
    try {
      const data = {
        ...form,
        hrbpId: user.id,
        hrbpName: user.name,
        meetCount: Number(form.meetCount),
        normCount: Number(form.normCount),
        hadMgr: form.hadMgr === 'true',
      };
      if (isEdit) {
        await dataService.updateVisit(editVisit.id, data);
        toast('Ziyaret güncellendi', 'success');
        onEditDone?.();
      } else {
        await dataService.createVisit(data);
        toast('Ziyaret kaydedildi', 'success');
        onVisitSaved?.();
        setForm(empty(user));
        setRegions([]); setStores([]);
      }
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setLoading(p => ({ ...p, submit: false }));
    }
  };

  const handleSubmit = (ev) => {
    ev.preventDefault();
    if (isViewer) return;
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    const overNorm = form.meetCount && form.normCount && Number(form.meetCount) > Number(form.normCount);
    if (overNorm) { setShowNormConfirm(true); return; }
    doSave();
  };

  const overNorm = form.meetCount && form.normCount && Number(form.meetCount) > Number(form.normCount);

  const isViewer = user?.role === 'viewer';

  return (
    <div className="max-w-2xl mx-auto fade-in mb-12">
      <div className="rounded-[2rem] p-2 sm:p-3" style={{ background: 'var(--color-surface-low)' }}>
        <div className="rounded-[1.5rem] bg-white overflow-hidden pb-4 sm:pb-8">
          <div className="px-6 sm:px-8 py-8 text-center">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight" style={{ fontFamily: 'Manrope, sans-serif', color: '#FB5373' }}>
              {isEdit ? 'Ziyareti Düzenle' : 'Mağaza Ziyaret Formu'}
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="px-6 sm:px-8 space-y-6">

            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <ReadonlyField label="HRBP" value={user?.name} />
                <FormField label="Ziyaret Tarihi" error={errors.visitDate} required>
                  <Input type="date" value={form.visitDate} max={today()}
                    onChange={e => set('visitDate', e.target.value)} error={errors.visitDate} />
                </FormField>
              </div>

              <SectionDivider label="Lokasyon" />

              {/* OPERASYON */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <FormField label="Operasyon" error={errors.dirId} required>
                  {loading.ops ? <Skeleton className="h-[52px]" /> : (
                    <SearchableSelect
                      value={form.dirId || ''}
                      onChange={handleOperation}
                      placeholder="Operasyon seçin"
                      options={operations.map(o => ({ value: o.id, label: o.name }))}
                    />
                  )}
                  {errors.dirId && <p className="text-xs font-medium" style={{ color: 'var(--color-danger)' }}>{errors.dirId}</p>}
                </FormField>
                <ManagerField label="Operasyon Müdürü" value={form.dirMgr}
                  managers={opManagers} onChange={v => { set('dirMgr', v); setAutoFilled(p => ({ ...p, dirMgr: false })); }} locked={autoFilled.dirMgr} />
              </div>

              {/* BÖLGE */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <FormField label="Bölge" error={errors.regionId} required>
                  {loading.regions ? <Skeleton className="h-[52px]" /> : (
                    <SearchableSelect
                      value={form.regionId || ''}
                      onChange={handleRegion}
                      placeholder="Bölge seçin"
                      disabled={!form.dirId}
                      options={regions.map(r => ({ value: r.id, label: r.name }))}
                    />
                  )}
                  {errors.regionId && <p className="text-xs font-medium" style={{ color: 'var(--color-danger)' }}>{errors.regionId}</p>}
                </FormField>
                <ManagerField label="Bölge Müdürü" value={form.regionMgr}
                  managers={regionManagers} onChange={v => { set('regionMgr', v); setAutoFilled(p => ({ ...p, regionMgr: false })); }} locked={autoFilled.regionMgr} />
              </div>

              {/* MAĞAZA */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <FormField label="Mağaza" error={errors.storeId} required>
                  {loading.stores ? <Skeleton className="h-[52px]" /> : (
                    <SearchableSelect
                      value={form.storeId || ''}
                      onChange={handleStore}
                      placeholder="Mağaza seçin"
                      disabled={!form.regionId}
                      options={stores.map(s => ({ value: s.id, label: s.name }))}
                    />
                  )}
                  {errors.storeId && <p className="text-xs font-medium" style={{ color: 'var(--color-danger)' }}>{errors.storeId}</p>}
                </FormField>
                <ManagerField label="Mağaza Müdürü" value={form.storeMgr}
                  managers={storeManagers} onChange={v => { set('storeMgr', v); setAutoFilled(p => ({ ...p, storeMgr: false })); }} locked={autoFilled.storeMgr} />
              </div>

              <SectionDivider label="Görüşme Detayları" />

              <FormField label="Mağaza Müdürü ile Görüşme" error={errors.hadMgr} required>
                <Toggle value={form.hadMgr} onChange={v => set('hadMgr', v)} />
              </FormField>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <FormField label="Görüşme Yapılan Kişi Sayısı" error={errors.meetCount} required>
                  <Input type="number" min="0" value={form.meetCount}
                    onChange={e => set('meetCount', e.target.value)} error={errors.meetCount} placeholder="0" />
                </FormField>
                <FormField label="Norm Kadro Sayısı" error={errors.normCount} required>
                  <Input type="number" min="0" value={form.normCount}
                    onChange={e => set('normCount', e.target.value)} error={errors.normCount} placeholder="0" />
                </FormField>
              </div>

              <SectionDivider label="Notlar" />

              <FormField label="Genel Not" helper={`${form.notes.length} / 1000`} error={errors.notes} required>
                <Textarea value={form.notes} onChange={e => set('notes', e.target.value.slice(0, 1000))}
                  placeholder="Ziyaret hakkında notlarınızı buraya yazın..." maxLength={1000} />
              </FormField>
            </div>

            <div className="flex gap-4 pt-6 mt-2">
              {isEdit && (
                <Button variant="ghost" onClick={onEditDone} className="flex-1">İptal</Button>
              )}
              <Button
                type="submit"
                loading={loading.submit}
                disabled={isViewer}
                title={isViewer ? 'Görüntüleyici rolüyle kayıt yapılamaz' : undefined}
                className={isEdit ? 'flex-1' : 'w-full'}
                size="lg"
                style={{ background: isViewer ? 'var(--color-muted)' : '#FB5373' }}
              >
                {isEdit ? 'Güncelle' : 'Kaydet'}
              </Button>
            </div>
          </form>
        </div>
      </div>

      <ConfirmDialog
        open={showNormConfirm}
        onClose={() => setShowNormConfirm(false)}
        onConfirm={() => { setShowNormConfirm(false); doSave(); }}
        title="Norm kadro aşımı"
        message="Görüşülen kişi sayısı norm kadroyu aşıyor. Yine de kaydetmek istiyor musunuz?"
        confirmLabel="Evet, Kaydet"
      />
    </div>
  );
}
