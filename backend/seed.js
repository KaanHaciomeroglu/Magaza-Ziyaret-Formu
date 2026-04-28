const bcrypt = require('bcryptjs');
const { getDb, get, run } = require('./db');

async function seed() {
  const db = await getDb();

  const users = [
    { name: 'Admin', email: 'admin@test.com', password: '85208520**//895623', role: 'admin' },
    { name: 'Gözlemci Kullanıcı', email: 'viewer@test.com', password: 'viewer123', role: 'viewer' },
  ];

  for (const u of users) {
    const exists = get(db, 'SELECT id FROM users WHERE email = ?', [u.email]);
    if (exists) {
      console.log(`Zaten var, atlanıyor: ${u.email}`);
      continue;
    }
    const hash = bcrypt.hashSync(u.password, 10);
    run(db, 'INSERT INTO users (name, email, password, role, isActive) VALUES (?,?,?,?,1)', [
      u.name, u.email, hash, u.role,
    ]);
    console.log(`Oluşturuldu: ${u.email} (${u.role})`);
  }

  console.log('Seed tamamlandı.');
  process.exit(0);
}

seed().catch(e => { console.error(e); process.exit(1); });
