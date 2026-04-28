export const MOCK_USERS = [
  { id: 1, name: 'Zeynep Arslan', email: 'zeynep@test.com', password: '1234', role: 'hrbp', isActive: true },
  { id: 2, name: 'Burak Kılıç', email: 'burak@test.com', password: '1234', role: 'hrbp', isActive: true },
  { id: 3, name: 'Selin Doğan', email: 'selin@test.com', password: '1234', role: 'hrbp', isActive: true },
  { id: 4, name: 'Tarık Uysal', email: 'tarik@test.com', password: '1234', role: 'hrbp', isActive: true },
  { id: 5, name: 'Admin', email: 'admin@test.com', password: 'DMq62TvdUxk4kL$$', role: 'admin', isActive: true },
  { id: 6, name: 'Gözlemci Kullanıcı', email: 'viewer@test.com', password: 'viewer123', role: 'viewer', isActive: true },
];

// TEST DATA — operasyon → bölge → mağaza zinciri (mock mod için)
export const MOCK_OPERATIONS = [
  { id: 1, name: '1. Operasyon', mgr: 'Test Operasyon Müdürü 1' },
  { id: 2, name: '2. Operasyon', mgr: 'Test Operasyon Müdürü 2' },
  { id: 3, name: '3. Operasyon', mgr: 'Test Operasyon Müdürü 3' },
];

export const MOCK_REGIONS = [
  { id: 1, operationId: 1, name: '1. Bölge', bolgeMuduru: 'Test Bölge Müdürü 1' },
  { id: 2, operationId: 1, name: '2. Bölge', bolgeMuduru: 'Test Bölge Müdürü 2' },
  { id: 3, operationId: 2, name: '3. Bölge', bolgeMuduru: 'Test Bölge Müdürü 3' },
  { id: 4, operationId: 2, name: '4. Bölge', bolgeMuduru: 'Test Bölge Müdürü 4' },
  { id: 5, operationId: 3, name: '5. Bölge', bolgeMuduru: 'Test Bölge Müdürü 5' },
  { id: 6, operationId: 3, name: '6. Bölge', bolgeMuduru: 'Test Bölge Müdürü 6' },
];

export const MOCK_DIRS = MOCK_OPERATIONS;

export const MOCK_STORES = [
  { id: 1,  regionId: 1, name: 'Test Mağaza 1A',  mgr: 'Test Mağaza Müdürü 1A', norm: 20 },
  { id: 2,  regionId: 1, name: 'Test Mağaza 1B',  mgr: 'Test Mağaza Müdürü 1B', norm: 15 },
  { id: 3,  regionId: 2, name: 'Test Mağaza 2A',  mgr: 'Test Mağaza Müdürü 2A', norm: 18 },
  { id: 4,  regionId: 2, name: 'Test Mağaza 2B',  mgr: 'Test Mağaza Müdürü 2B', norm: 22 },
  { id: 5,  regionId: 3, name: 'Test Mağaza 3A',  mgr: 'Test Mağaza Müdürü 3A', norm: 16 },
  { id: 6,  regionId: 3, name: 'Test Mağaza 3B',  mgr: 'Test Mağaza Müdürü 3B', norm: 12 },
  { id: 7,  regionId: 4, name: 'Test Mağaza 4A',  mgr: 'Test Mağaza Müdürü 4A', norm: 19 },
  { id: 8,  regionId: 4, name: 'Test Mağaza 4B',  mgr: 'Test Mağaza Müdürü 4B', norm: 14 },
  { id: 9,  regionId: 5, name: 'Test Mağaza 5A',  mgr: 'Test Mağaza Müdürü 5A', norm: 11 },
  { id: 10, regionId: 5, name: 'Test Mağaza 5B',  mgr: 'Test Mağaza Müdürü 5B', norm: 25 },
  { id: 11, regionId: 6, name: 'Test Mağaza 6A',  mgr: 'Test Mağaza Müdürü 6A', norm: 17 },
  { id: 12, regionId: 6, name: 'Test Mağaza 6B',  mgr: 'Test Mağaza Müdürü 6B', norm: 21 },
];

const seed = [
  { hrbpId:1, hrbpName:'Test HRBP 1', visitDate:'2025-01-07', regionId:1, regionName:'1. Bölge', dirId:1, dirName:'1. Operasyon', dirMgr:'Test Operasyon Müdürü 1', storeId:1,  storeName:'Test Mağaza 1A', storeMgr:'Test Mağaza Müdürü 1A', hadMgr:true,  meetCount:14, normCount:20, notes:'Test ziyaret notu.' },
  { hrbpId:1, hrbpName:'Test HRBP 1', visitDate:'2025-01-21', regionId:2, regionName:'2. Bölge', dirId:1, dirName:'1. Operasyon', dirMgr:'Test Operasyon Müdürü 1', storeId:3,  storeName:'Test Mağaza 2A', storeMgr:'Test Mağaza Müdürü 2A', hadMgr:false, meetCount:9,  normCount:18, notes:'Test ziyaret notu.' },
  { hrbpId:2, hrbpName:'Test HRBP 2', visitDate:'2025-01-14', regionId:3, regionName:'3. Bölge', dirId:2, dirName:'2. Operasyon', dirMgr:'Test Operasyon Müdürü 2', storeId:5,  storeName:'Test Mağaza 3A', storeMgr:'Test Mağaza Müdürü 3A', hadMgr:true,  meetCount:13, normCount:15, notes:'Test ziyaret notu.' },
  { hrbpId:2, hrbpName:'Test HRBP 2', visitDate:'2025-02-04', regionId:4, regionName:'4. Bölge', dirId:2, dirName:'2. Operasyon', dirMgr:'Test Operasyon Müdürü 2', storeId:7,  storeName:'Test Mağaza 4A', storeMgr:'Test Mağaza Müdürü 4A', hadMgr:true,  meetCount:17, normCount:19, notes:'Test ziyaret notu.' },
  { hrbpId:3, hrbpName:'Test HRBP 3', visitDate:'2025-01-28', regionId:5, regionName:'5. Bölge', dirId:3, dirName:'3. Operasyon', dirMgr:'Test Operasyon Müdürü 3', storeId:9,  storeName:'Test Mağaza 5A', storeMgr:'Test Mağaza Müdürü 5A', hadMgr:true,  meetCount:8,  normCount:11, notes:'Test ziyaret notu.' },
  { hrbpId:3, hrbpName:'Test HRBP 3', visitDate:'2025-02-11', regionId:6, regionName:'6. Bölge', dirId:3, dirName:'3. Operasyon', dirMgr:'Test Operasyon Müdürü 3', storeId:11, storeName:'Test Mağaza 6A', storeMgr:'Test Mağaza Müdürü 6A', hadMgr:false, meetCount:10, normCount:12, notes:'' },
  { hrbpId:4, hrbpName:'Test HRBP 4', visitDate:'2025-03-05', regionId:1, regionName:'1. Bölge', dirId:1, dirName:'1. Operasyon', dirMgr:'Test Operasyon Müdürü 1', storeId:2,  storeName:'Test Mağaza 1B', storeMgr:'Test Mağaza Müdürü 1B', hadMgr:true,  meetCount:19, normCount:23, notes:'Test ziyaret notu.' },
  { hrbpId:4, hrbpName:'Test HRBP 4', visitDate:'2025-03-10', regionId:2, regionName:'2. Bölge', dirId:1, dirName:'1. Operasyon', dirMgr:'Test Operasyon Müdürü 1', storeId:4,  storeName:'Test Mağaza 2B', storeMgr:'Test Mağaza Müdürü 2B', hadMgr:true,  meetCount:11, normCount:14, notes:'Test ziyaret notu.' },
];

export const MOCK_VISITS = seed.map((v, i) => ({ ...v, id: i + 1 }));

export function filterMockVisits(filters = {}, currentUser = null) {
  let visits = [...MOCK_VISITS];
  if (currentUser && currentUser.role !== 'admin') {
    visits = visits.filter(v => v.hrbpId === currentUser.id);
  }
  if (filters.hrbpId) visits = visits.filter(v => v.hrbpId === Number(filters.hrbpId));
  if (filters.regionId) visits = visits.filter(v => v.regionId === Number(filters.regionId));
  if (filters.dirId) visits = visits.filter(v => v.dirId === Number(filters.dirId));
  if (filters.storeId) visits = visits.filter(v => v.storeId === Number(filters.storeId));
  if (filters.startDate) visits = visits.filter(v => v.visitDate >= filters.startDate);
  if (filters.endDate) visits = visits.filter(v => v.visitDate <= filters.endDate);
  if (filters.hadMgr === 'true') visits = visits.filter(v => v.hadMgr === true);
  if (filters.hadMgr === 'false') visits = visits.filter(v => v.hadMgr === false);
  return visits.sort((a, b) => b.visitDate.localeCompare(a.visitDate));
}

export function mockLogin(email, password) {
  const user = MOCK_USERS.find(u => u.email === email && u.password === password);
  if (!user) throw new Error('E-posta veya şifre hatalı');
  if (!user.isActive) throw new Error('Hesabınız pasif durumda. Lütfen yöneticinizle iletişime geçin.');
  const { password: _, ...safeUser } = user;
  return { token: 'mock-token-' + user.id, user: safeUser };
}
