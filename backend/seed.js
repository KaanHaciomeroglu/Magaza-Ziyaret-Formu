const bcrypt = require('bcryptjs');
const { getDb, get, run, runInsert } = require('./db');

async function seed() {
  const db = await getDb();

  // ── Kullanıcılar ──────────────────────────────────────────────
  const users = [
    { name: 'Admin', email: 'admin@test.com', password: '85208520**//895623', role: 'admin' },
    { name: 'Gözlemci Kullanıcı', email: 'viewer@test.com', password: 'viewer123', role: 'viewer' },
    { name: 'Zeynep Arslan', email: 'zeynep@test.com', password: '1234', role: 'hrbp' },
    { name: 'Burak Kılıç', email: 'burak@test.com', password: '1234', role: 'hrbp' },
    { name: 'Selin Doğan', email: 'selin@test.com', password: '1234', role: 'hrbp' },
    { name: 'Tarık Uysal', email: 'tarik@test.com', password: '1234', role: 'hrbp' },
  ];

  for (const u of users) {
    const exists = get(db, 'SELECT id FROM users WHERE email = ?', [u.email]);
    if (exists) { console.log(`Zaten var, atlanıyor: ${u.email}`); continue; }
    const hash = bcrypt.hashSync(u.password, 10);
    run(db, 'INSERT INTO users (name, email, password, role, isActive) VALUES (?,?,?,?,1)', [u.name, u.email, hash, u.role]);
    console.log(`Kullanıcı oluşturuldu: ${u.email} (${u.role})`);
  }

  // ── Operasyonlar ──────────────────────────────────────────────
  const existingOps = get(db, 'SELECT id FROM operations LIMIT 1');
  if (existingOps) {
    console.log('Operasyon/bölge/mağaza verisi zaten var, atlanıyor.');
    console.log('Seed tamamlandı.');
    process.exit(0);
  }

  const operations = [
    { kod: 'OP1', adi: '1. Operasyon', mudur: 'Test Operasyon Müdürü 1' },
    { kod: 'OP2', adi: '2. Operasyon', mudur: 'Test Operasyon Müdürü 2' },
    { kod: 'OP3', adi: '3. Operasyon', mudur: 'Test Operasyon Müdürü 3' },
  ];

  const opIds = [];
  for (const op of operations) {
    const id = runInsert(db, 'INSERT INTO operations (operasyonKodu, operasyonAdi, operasyonMuduru) VALUES (?,?,?)', [op.kod, op.adi, op.mudur]);
    opIds.push(id);
    console.log(`Operasyon oluşturuldu: ${op.adi}`);
  }

  // ── Bölgeler ──────────────────────────────────────────────────
  const regions = [
    { no: 'B1', adi: '1. Bölge', mudur: 'Test Bölge Müdürü 1', opIdx: 0 },
    { no: 'B2', adi: '2. Bölge', mudur: 'Test Bölge Müdürü 2', opIdx: 0 },
    { no: 'B3', adi: '3. Bölge', mudur: 'Test Bölge Müdürü 3', opIdx: 1 },
    { no: 'B4', adi: '4. Bölge', mudur: 'Test Bölge Müdürü 4', opIdx: 1 },
    { no: 'B5', adi: '5. Bölge', mudur: 'Test Bölge Müdürü 5', opIdx: 2 },
    { no: 'B6', adi: '6. Bölge', mudur: 'Test Bölge Müdürü 6', opIdx: 2 },
  ];

  const regionIds = [];
  for (const r of regions) {
    const id = runInsert(db, 'INSERT INTO regions (bolgeNo, bolgeAdi, bolgeMuduru, operationId) VALUES (?,?,?,?)', [r.no, r.adi, r.mudur, opIds[r.opIdx]]);
    regionIds.push(id);
    console.log(`Bölge oluşturuldu: ${r.adi}`);
  }

  // ── Mağazalar ─────────────────────────────────────────────────
  const stores = [
    { kod: 'M1A', adi: 'Test Mağaza 1A', mudur: 'Test Mağaza Müdürü 1A', norm: 20, regIdx: 0 },
    { kod: 'M1B', adi: 'Test Mağaza 1B', mudur: 'Test Mağaza Müdürü 1B', norm: 15, regIdx: 0 },
    { kod: 'M2A', adi: 'Test Mağaza 2A', mudur: 'Test Mağaza Müdürü 2A', norm: 18, regIdx: 1 },
    { kod: 'M2B', adi: 'Test Mağaza 2B', mudur: 'Test Mağaza Müdürü 2B', norm: 22, regIdx: 1 },
    { kod: 'M3A', adi: 'Test Mağaza 3A', mudur: 'Test Mağaza Müdürü 3A', norm: 16, regIdx: 2 },
    { kod: 'M3B', adi: 'Test Mağaza 3B', mudur: 'Test Mağaza Müdürü 3B', norm: 12, regIdx: 2 },
    { kod: 'M4A', adi: 'Test Mağaza 4A', mudur: 'Test Mağaza Müdürü 4A', norm: 19, regIdx: 3 },
    { kod: 'M4B', adi: 'Test Mağaza 4B', mudur: 'Test Mağaza Müdürü 4B', norm: 14, regIdx: 3 },
    { kod: 'M5A', adi: 'Test Mağaza 5A', mudur: 'Test Mağaza Müdürü 5A', norm: 11, regIdx: 4 },
    { kod: 'M5B', adi: 'Test Mağaza 5B', mudur: 'Test Mağaza Müdürü 5B', norm: 25, regIdx: 4 },
    { kod: 'M6A', adi: 'Test Mağaza 6A', mudur: 'Test Mağaza Müdürü 6A', norm: 17, regIdx: 5 },
    { kod: 'M6B', adi: 'Test Mağaza 6B', mudur: 'Test Mağaza Müdürü 6B', norm: 21, regIdx: 5 },
  ];

  const storeIds = [];
  for (const s of stores) {
    const id = runInsert(db, 'INSERT INTO stores (magazaKodu, magazaAdi, magazaMuduru, norm, regionId) VALUES (?,?,?,?,?)', [s.kod, s.adi, s.mudur, s.norm, regionIds[s.regIdx]]);
    storeIds.push(id);
    console.log(`Mağaza oluşturuldu: ${s.adi}`);
  }

  // ── Kullanıcı ID'lerini al ────────────────────────────────────
  const zeynep = get(db, 'SELECT id FROM users WHERE email = ?', ['zeynep@test.com']);
  const burak  = get(db, 'SELECT id FROM users WHERE email = ?', ['burak@test.com']);
  const selin  = get(db, 'SELECT id FROM users WHERE email = ?', ['selin@test.com']);
  const tarik  = get(db, 'SELECT id FROM users WHERE email = ?', ['tarik@test.com']);

  // ── Test Ziyaretleri ──────────────────────────────────────────
  const visits = [
    { hrbpId: zeynep.id, hrbpName: 'Zeynep Arslan', visitDate: '2025-01-07', dirId: opIds[0], dirName: '1. Operasyon', dirMgr: 'Test Operasyon Müdürü 1', regionId: regionIds[0], regionName: '1. Bölge', regionMgr: 'Test Bölge Müdürü 1', storeId: storeIds[0],  storeName: 'Test Mağaza 1A', storeMgr: 'Test Mağaza Müdürü 1A', hadMgr: 1, meetCount: 14, normCount: 20, notes: 'Test ziyaret notu.' },
    { hrbpId: zeynep.id, hrbpName: 'Zeynep Arslan', visitDate: '2025-01-21', dirId: opIds[0], dirName: '1. Operasyon', dirMgr: 'Test Operasyon Müdürü 1', regionId: regionIds[1], regionName: '2. Bölge', regionMgr: 'Test Bölge Müdürü 2', storeId: storeIds[2],  storeName: 'Test Mağaza 2A', storeMgr: 'Test Mağaza Müdürü 2A', hadMgr: 0, meetCount: 9,  normCount: 18, notes: 'Test ziyaret notu.' },
    { hrbpId: burak.id,  hrbpName: 'Burak Kılıç',   visitDate: '2025-01-14', dirId: opIds[1], dirName: '2. Operasyon', dirMgr: 'Test Operasyon Müdürü 2', regionId: regionIds[2], regionName: '3. Bölge', regionMgr: 'Test Bölge Müdürü 3', storeId: storeIds[4],  storeName: 'Test Mağaza 3A', storeMgr: 'Test Mağaza Müdürü 3A', hadMgr: 1, meetCount: 13, normCount: 16, notes: 'Test ziyaret notu.' },
    { hrbpId: burak.id,  hrbpName: 'Burak Kılıç',   visitDate: '2025-02-04', dirId: opIds[1], dirName: '2. Operasyon', dirMgr: 'Test Operasyon Müdürü 2', regionId: regionIds[3], regionName: '4. Bölge', regionMgr: 'Test Bölge Müdürü 4', storeId: storeIds[6],  storeName: 'Test Mağaza 4A', storeMgr: 'Test Mağaza Müdürü 4A', hadMgr: 1, meetCount: 17, normCount: 19, notes: 'Test ziyaret notu.' },
    { hrbpId: selin.id,  hrbpName: 'Selin Doğan',   visitDate: '2025-01-28', dirId: opIds[2], dirName: '3. Operasyon', dirMgr: 'Test Operasyon Müdürü 3', regionId: regionIds[4], regionName: '5. Bölge', regionMgr: 'Test Bölge Müdürü 5', storeId: storeIds[8],  storeName: 'Test Mağaza 5A', storeMgr: 'Test Mağaza Müdürü 5A', hadMgr: 1, meetCount: 8,  normCount: 11, notes: 'Test ziyaret notu.' },
    { hrbpId: selin.id,  hrbpName: 'Selin Doğan',   visitDate: '2025-02-11', dirId: opIds[2], dirName: '3. Operasyon', dirMgr: 'Test Operasyon Müdürü 3', regionId: regionIds[5], regionName: '6. Bölge', regionMgr: 'Test Bölge Müdürü 6', storeId: storeIds[10], storeName: 'Test Mağaza 6A', storeMgr: 'Test Mağaza Müdürü 6A', hadMgr: 0, meetCount: 10, normCount: 17, notes: '' },
    { hrbpId: tarik.id,  hrbpName: 'Tarık Uysal',   visitDate: '2025-03-05', dirId: opIds[0], dirName: '1. Operasyon', dirMgr: 'Test Operasyon Müdürü 1', regionId: regionIds[0], regionName: '1. Bölge', regionMgr: 'Test Bölge Müdürü 1', storeId: storeIds[1],  storeName: 'Test Mağaza 1B', storeMgr: 'Test Mağaza Müdürü 1B', hadMgr: 1, meetCount: 19, normCount: 20, notes: 'Test ziyaret notu.' },
    { hrbpId: tarik.id,  hrbpName: 'Tarık Uysal',   visitDate: '2025-03-10', dirId: opIds[0], dirName: '1. Operasyon', dirMgr: 'Test Operasyon Müdürü 1', regionId: regionIds[1], regionName: '2. Bölge', regionMgr: 'Test Bölge Müdürü 2', storeId: storeIds[3],  storeName: 'Test Mağaza 2B', storeMgr: 'Test Mağaza Müdürü 2B', hadMgr: 1, meetCount: 11, normCount: 22, notes: 'Test ziyaret notu.' },
  ];

  for (const v of visits) {
    runInsert(db,
      `INSERT INTO visits (hrbpId, hrbpName, visitDate, dirId, dirName, dirMgr, regionId, regionName, regionMgr, storeId, storeName, storeMgr, hadMgr, meetCount, normCount, notes)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [v.hrbpId, v.hrbpName, v.visitDate, v.dirId, v.dirName, v.dirMgr, v.regionId, v.regionName, v.regionMgr, v.storeId, v.storeName, v.storeMgr, v.hadMgr, v.meetCount, v.normCount, v.notes]
    );
  }
  console.log(`${visits.length} test ziyareti oluşturuldu.`);

  console.log('Seed tamamlandı.');
  process.exit(0);
}

seed().catch(e => { console.error(e); process.exit(1); });
