import * as XLSX from 'xlsx';

export function exportVisitsToExcel(visits) {
  const rows = visits.map(v => ({
    'Form No': v.id,
    'HRBP': v.hrbpName,
    'Ziyaret Tarihi': formatDate(v.visitDate),
    'Operasyon Bölgesi': v.dirName,
    'Bölge Müdürlüğü': v.regionName,
    'Bölge Müdürü': v.dirMgr,
    'Mağaza': v.storeName,
    'Mağaza Müdürü': v.storeMgr,
    'Müdür Görüşmesi': v.hadMgr ? 'Evet' : 'Hayır',
    'Görüşülen Kişi': v.meetCount,
    'Norm Kadro': v.normCount,
    'Oran (%)': v.normCount ? (v.meetCount / v.normCount * 100).toFixed(1) : '0',
    'Notlar': v.notes || '',
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Ziyaretler');

  const colWidths = [
    { wch: 8 }, { wch: 18 }, { wch: 14 }, { wch: 15 }, { wch: 18 },
    { wch: 18 }, { wch: 16 }, { wch: 18 }, { wch: 14 },
    { wch: 13 }, { wch: 12 }, { wch: 10 }, { wch: 40 },
  ];
  ws['!cols'] = colWidths;

  const today = new Date().toISOString().split('T')[0];
  XLSX.writeFile(wb, `HRBP_Ziyaret_${today}.xlsx`);
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  return `${d}.${m}.${y}`;
}
