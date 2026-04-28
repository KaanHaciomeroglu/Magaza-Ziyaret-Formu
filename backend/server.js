const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const { getDb, run, all, get, runInsert } = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) { console.error('JWT_SECRET env var is required'); process.exit(1); }

const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';
app.use(cors({ origin: CORS_ORIGIN, credentials: true }));
app.use(express.json({ limit: '5mb' }));

// ── Auth middleware ──────────────────────────────────────────────
function auth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Yetkisiz erişim.' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: 'Oturum süresi doldu.' });
  }
}

function adminOnly(req, res, next) {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Bu işlem için yetkiniz yok.' });
  next();
}

// ── Auth ─────────────────────────────────────────────────────────
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const db = await getDb();
    const user = get(db, 'SELECT * FROM users WHERE email = ? AND isActive = 1', [email]);
    if (!user) return res.status(401).json({ message: 'E-posta veya şifre hatalı.' });
    const valid = bcrypt.compareSync(password, user.password);
    if (!valid) return res.status(401).json({ message: 'E-posta veya şifre hatalı.' });
    const { password: _, ...safeUser } = user;
    safeUser.isActive = !!safeUser.isActive;
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '8h' });
    res.json({ token, user: safeUser });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// ── Operations ───────────────────────────────────────────────────
app.get('/api/operations', auth, async (req, res) => {
  const db = await getDb();
  const rows = all(db, 'SELECT id, operasyonKodu, operasyonAdi as name, operasyonMuduru as mgr FROM operations ORDER BY operasyonAdi');
  res.json(rows);
});

// ── Regions (operasyona göre) ────────────────────────────────────
app.get('/api/regions', auth, async (req, res) => {
  const db = await getDb();
  const { operationId } = req.query;
  let rows;
  if (operationId) {
    rows = all(db,
      'SELECT id, bolgeNo, bolgeAdi as name, bolgeMuduru, operationId FROM regions WHERE operationId = ? ORDER BY bolgeAdi',
      [operationId]
    );
  } else {
    rows = all(db, 'SELECT id, bolgeNo, bolgeAdi as name, bolgeMuduru, operationId FROM regions ORDER BY bolgeAdi');
  }
  res.json(rows);
});

// ── Stores (bölgeye göre) ─────────────────────────────────────────
app.get('/api/stores', auth, async (req, res) => {
  const db = await getDb();
  const { regionId } = req.query;
  let rows;
  if (regionId) {
    rows = all(db,
      'SELECT id, magazaKodu, magazaAdi as name, magazaMuduru as mgr, norm, regionId FROM stores WHERE regionId = ? ORDER BY magazaAdi',
      [regionId]
    );
  } else {
    rows = all(db,
      'SELECT id, magazaKodu, magazaAdi as name, magazaMuduru as mgr, norm, regionId FROM stores ORDER BY magazaAdi'
    );
  }
  res.json(rows);
});

// ── Manager lists (boş müdür fallback) ───────────────────────────
app.get('/api/operations/managers', auth, async (req, res) => {
  const db = await getDb();
  const rows = all(db, "SELECT DISTINCT operasyonMuduru as name FROM operations WHERE operasyonMuduru != '' ORDER BY operasyonMuduru");
  res.json(rows.map(r => r.name));
});

app.get('/api/regions/managers', auth, async (req, res) => {
  const db = await getDb();
  const rows = all(db, "SELECT DISTINCT bolgeMuduru as name FROM regions WHERE bolgeMuduru != '' ORDER BY bolgeMuduru");
  res.json(rows.map(r => r.name));
});

app.get('/api/stores/managers', auth, async (req, res) => {
  const db = await getDb();
  const rows = all(db, "SELECT DISTINCT magazaMuduru as name FROM stores WHERE magazaMuduru != '' ORDER BY magazaMuduru");
  res.json(rows.map(r => r.name));
});

// ── Users ────────────────────────────────────────────────────────
app.get('/api/users', auth, async (req, res) => {
  const db = await getDb();
  const rows = all(db, 'SELECT id, name, email, role, isActive, avatar FROM users ORDER BY name');
  res.json(rows.map(u => ({ ...u, isActive: !!u.isActive })));
});

app.post('/api/users', auth, adminOnly, async (req, res) => {
  try {
    const { name, email, password, role, isActive, avatar } = req.body;
    const db = await getDb();
    const existing = get(db, 'SELECT id FROM users WHERE email = ?', [email]);
    if (existing) return res.status(400).json({ message: 'Bu e-posta adresi zaten kullanımda.' });
    const hash = bcrypt.hashSync(password, 10);
    const id = runInsert(db,
      'INSERT INTO users (name, email, password, role, isActive, avatar) VALUES (?,?,?,?,?,?)',
      [name, email, hash, role || 'hrbp', isActive ? 1 : 0, avatar || null]
    );
    res.json({ id, name, email, role: role || 'hrbp', isActive: !!isActive, avatar: avatar || null });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

app.put('/api/users/:id', auth, adminOnly, async (req, res) => {
  try {
    const { name, email, password, role, isActive, avatar } = req.body;
    const db = await getDb();
    const user = get(db, 'SELECT * FROM users WHERE id = ?', [req.params.id]);
    if (!user) return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
    const dup = get(db, 'SELECT id FROM users WHERE email = ? AND id != ?', [email, req.params.id]);
    if (dup) return res.status(400).json({ message: 'Bu e-posta adresi zaten kullanımda.' });
    const hash = password ? bcrypt.hashSync(password, 10) : user.password;
    const newAvatar = avatar !== undefined ? (avatar || null) : user.avatar;
    run(db,
      'UPDATE users SET name=?, email=?, password=?, role=?, isActive=?, avatar=? WHERE id=?',
      [name, email, hash, role, isActive ? 1 : 0, newAvatar, req.params.id]
    );
    res.json({ id: Number(req.params.id), name, email, role, isActive: !!isActive, avatar: newAvatar });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

app.delete('/api/users/:id', auth, adminOnly, async (req, res) => {
  try {
    const db = await getDb();
    run(db, 'DELETE FROM users WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// ── Visits ───────────────────────────────────────────────────────
app.get('/api/visits', auth, async (req, res) => {
  try {
    const db = await getDb();
    const { hrbpId, regionId, dirId, storeId, startDate, endDate, hadMgr } = req.query;
    let sql = 'SELECT * FROM visits WHERE deletedAt IS NULL';
    const params = [];

    if (hrbpId) {
      sql += ' AND hrbpId = ?'; params.push(hrbpId);
    }
    if (regionId) { sql += ' AND regionId = ?'; params.push(regionId); }
    if (dirId) { sql += ' AND dirId = ?'; params.push(dirId); }
    if (storeId) { sql += ' AND storeId = ?'; params.push(storeId); }
    if (startDate) { sql += ' AND visitDate >= ?'; params.push(startDate); }
    if (endDate) { sql += ' AND visitDate <= ?'; params.push(endDate); }
    if (hadMgr === 'true') { sql += ' AND hadMgr = 1'; }
    if (hadMgr === 'false') { sql += ' AND hadMgr = 0'; }

    sql += ' ORDER BY visitDate DESC';
    const rows = all(db, sql, params);
    res.json(rows.map(v => ({ ...v, hadMgr: !!v.hadMgr })));
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

app.post('/api/visits', auth, async (req, res) => {
  try {
    const db = await getDb();
    const d = req.body;
    const id = runInsert(db,
      `INSERT INTO visits (hrbpId,hrbpName,visitDate,regionId,regionName,dirId,dirName,dirMgr,regionMgr,storeId,storeName,storeMgr,hadMgr,meetCount,normCount,notes)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [d.hrbpId, d.hrbpName, d.visitDate, d.regionId, d.regionName, d.dirId, d.dirName, d.dirMgr,
       d.regionMgr || '', d.storeId, d.storeName, d.storeMgr, d.hadMgr ? 1 : 0, d.meetCount, d.normCount, d.notes || '']
    );
    res.json({ ...d, id, hadMgr: !!d.hadMgr });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

app.put('/api/visits/:id', auth, async (req, res) => {
  try {
    const db = await getDb();
    const d = req.body;
    run(db,
      `UPDATE visits SET hrbpId=?,hrbpName=?,visitDate=?,regionId=?,regionName=?,dirId=?,dirName=?,dirMgr=?,regionMgr=?,
       storeId=?,storeName=?,storeMgr=?,hadMgr=?,meetCount=?,normCount=?,notes=? WHERE id=?`,
      [d.hrbpId, d.hrbpName, d.visitDate, d.regionId, d.regionName, d.dirId, d.dirName, d.dirMgr,
       d.regionMgr || '', d.storeId, d.storeName, d.storeMgr, d.hadMgr ? 1 : 0, d.meetCount, d.normCount, d.notes || '', req.params.id]
    );
    res.json({ ...d, id: Number(req.params.id), hadMgr: !!d.hadMgr });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

app.delete('/api/visits/:id', auth, async (req, res) => {
  try {
    const db = await getDb();
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
    run(db,
      'UPDATE visits SET deletedAt = ?, deletedBy = ? WHERE id = ?',
      [now, req.user.email, req.params.id]
    );
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// ── Profile ───────────────────────────────────────────────────────
app.put('/api/profile/password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return res.status(400).json({ message: 'Mevcut ve yeni şifre zorunludur.' });
    if (newPassword.length < 6) return res.status(400).json({ message: 'Yeni şifre en az 6 karakter olmalıdır.' });
    const db = await getDb();
    const user = get(db, 'SELECT * FROM users WHERE id = ?', [req.user.id]);
    if (!user) return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) return res.status(400).json({ message: 'Mevcut şifre hatalı.' });
    const hashed = await bcrypt.hash(newPassword, 10);
    run(db, 'UPDATE users SET password = ? WHERE id = ?', [hashed, req.user.id]);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

app.put('/api/profile/avatar', auth, async (req, res) => {
  try {
    const { avatar } = req.body;
    const db = await getDb();
    run(db, 'UPDATE users SET avatar=? WHERE id=?', [avatar || null, req.user.id]);
    res.json({ success: true, avatar: avatar || null });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// ── Frontend (production build) ───────────────────────────────────
const distPath = path.join(__dirname, '../hrbp-app/dist');
app.use(express.static(distPath));
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(distPath, 'index.html'));
  }
});

// ── Start ─────────────────────────────────────────────────────────
getDb().then(() => {
  app.listen(PORT, () => console.log(`HRBP API çalışıyor: http://localhost:${PORT}`));
});
