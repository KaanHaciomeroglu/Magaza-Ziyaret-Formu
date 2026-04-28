const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'hrbp.sqlite');

let _db = null;

async function getDb() {
  if (_db) return _db;
  const SQL = await initSqlJs();
  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    _db = new SQL.Database(fileBuffer);
    migrate(_db);  // _db atandıktan sonra çağrılıyor
  } else {
    _db = new SQL.Database();
    initSchema(_db);
  }
  return _db;
}

function save() {
  if (!_db) return;
  const data = _db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
}

function migrate(db) {
  try { db.run('ALTER TABLE users ADD COLUMN avatar TEXT'); save(); } catch {}
  try { db.run('ALTER TABLE visits ADD COLUMN deletedAt TEXT'); save(); } catch {}
  try { db.run('ALTER TABLE visits ADD COLUMN deletedBy TEXT'); save(); } catch {}
}

function initSchema(db) {
  db.run(`
    CREATE TABLE IF NOT EXISTS operations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      operasyonKodu TEXT,
      operasyonAdi TEXT NOT NULL,
      operasyonMuduru TEXT
    );

    CREATE TABLE IF NOT EXISTS regions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      bolgeNo TEXT,
      bolgeAdi TEXT NOT NULL,
      bolgeMuduru TEXT,
      operationId INTEGER REFERENCES operations(id)
    );

    CREATE TABLE IF NOT EXISTS stores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      magazaKodu TEXT,
      magazaAdi TEXT NOT NULL,
      magazaMuduru TEXT,
      norm INTEGER DEFAULT 0,
      regionId INTEGER REFERENCES regions(id)
    );

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'hrbp',
      isActive INTEGER NOT NULL DEFAULT 1,
      avatar TEXT
    );

    CREATE TABLE IF NOT EXISTS visits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      hrbpId INTEGER NOT NULL,
      hrbpName TEXT NOT NULL,
      visitDate TEXT NOT NULL,
      dirId INTEGER,
      dirName TEXT,
      dirMgr TEXT,
      regionId INTEGER,
      regionName TEXT,
      regionMgr TEXT,
      storeId INTEGER,
      storeName TEXT,
      storeMgr TEXT,
      hadMgr INTEGER NOT NULL DEFAULT 0,
      meetCount INTEGER,
      normCount INTEGER,
      notes TEXT,
      createdAt TEXT DEFAULT (datetime('now'))
    );
  `);
  save();
}

function run(db, sql, params = []) {
  db.run(sql, params);
  save();
}

function all(db, sql, params = []) {
  const stmt = db.prepare(sql);
  const rows = [];
  stmt.bind(params);
  while (stmt.step()) rows.push(stmt.getAsObject());
  stmt.free();
  return rows;
}

function get(db, sql, params = []) {
  return all(db, sql, params)[0] || null;
}

function runInsert(db, sql, params = []) {
  db.run(sql, params);
  const row = get(db, 'SELECT last_insert_rowid() as id');
  save();
  return row.id;
}

module.exports = { getDb, save, run, all, get, runInsert };
