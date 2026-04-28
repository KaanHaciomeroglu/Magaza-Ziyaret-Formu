import {
  MOCK_OPERATIONS, MOCK_REGIONS, MOCK_DIRS, MOCK_STORES, MOCK_USERS, MOCK_VISITS,
  filterMockVisits, mockLogin
} from '../data/mockData';

const USE_API = import.meta.env.VITE_USE_API === 'true';
const API_BASE = import.meta.env.VITE_API_URL || '/api';

const headers = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('access_token')}`,
});

async function apiFetch(url, options = {}) {
  const res = await fetch(url, { ...options, headers: { ...headers(), ...options.headers } });
  if (res.status === 401) {
    localStorage.removeItem('access_token');
    localStorage.removeItem('hrbp_user');
    window.location.href = '/login';
    throw new Error('Oturum süresi doldu.');
  }
  if (res.status === 403) throw new Error('Bu işlem için yetkiniz bulunmamaktadır.');
  if (res.status >= 500) throw new Error('Sunucu hatası. Lütfen tekrar deneyin.');
  if (!res.ok) { const e = await res.json(); throw new Error(e.message || 'Bir hata oluştu.'); }
  return res.json();
}

// In-memory mock state for Faz 1
let _visits = [...MOCK_VISITS];
let _users = [...MOCK_USERS];
let _nextVisitId = _visits.length + 1;
let _nextUserId = _users.length + 1;

export const dataService = {
  // AUTH
  login: async (email, password) => {
    if (!USE_API) {
      await delay(400);
      return mockLogin(email, password);
    }
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.message || 'E-posta veya şifre hatalı.'); }
    return res.json();
  },

  // LOOKUPS — sıra: Operasyon → Bölge → Mağaza
  getOperations: async () => {
    if (!USE_API) { await delay(200); return MOCK_OPERATIONS; }
    return apiFetch(`${API_BASE}/operations`);
  },

  getRegions: async (operationId) => {
    if (!USE_API) {
      await delay(200);
      return operationId ? MOCK_REGIONS.filter(r => r.operationId === Number(operationId)) : MOCK_REGIONS;
    }
    return apiFetch(`${API_BASE}/regions${operationId ? `?operationId=${operationId}` : ''}`);
  },

  getStores: async (regionId) => {
    if (!USE_API) {
      await delay(200);
      return regionId ? MOCK_STORES.filter(s => s.regionId === Number(regionId)) : MOCK_STORES;
    }
    return apiFetch(`${API_BASE}/stores${regionId ? `?regionId=${regionId}` : ''}`);
  },

  getOperationManagers: async () => {
    if (!USE_API) { return MOCK_OPERATIONS.map(o => o.mgr).filter(Boolean); }
    return apiFetch(`${API_BASE}/operations/managers`);
  },

  getRegionManagers: async () => {
    if (!USE_API) { return MOCK_REGIONS.map(r => r.bolgeMuduru).filter(Boolean); }
    return apiFetch(`${API_BASE}/regions/managers`);
  },

  getStoreManagers: async () => {
    if (!USE_API) { return MOCK_STORES.map(s => s.mgr).filter(Boolean); }
    return apiFetch(`${API_BASE}/stores/managers`);
  },

  getUsers: async () => {
    if (!USE_API) { await delay(300); return _users.map(({ password: _, ...u }) => u); }
    return apiFetch(`${API_BASE}/users`);
  },

  // VISITS
  getVisits: async (filters = {}, currentUser = null) => {
    if (!USE_API) {
      await delay(400);
      return filterMockVisits(filters, currentUser);
    }
    const q = new URLSearchParams(filters).toString();
    return apiFetch(`${API_BASE}/visits?${q}`);
  },

  createVisit: async (data) => {
    if (!USE_API) {
      await delay(500);
      const visit = { ...data, id: _nextVisitId++ };
      _visits.push(visit);
      return visit;
    }
    return apiFetch(`${API_BASE}/visits`, { method: 'POST', body: JSON.stringify(data) });
  },

  updateVisit: async (id, data) => {
    if (!USE_API) {
      await delay(400);
      const idx = _visits.findIndex(v => v.id === id);
      if (idx === -1) throw new Error('Kayıt bulunamadı');
      _visits[idx] = { ...data, id };
      return _visits[idx];
    }
    return apiFetch(`${API_BASE}/visits/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  },

  deleteVisit: async (id) => {
    if (!USE_API) {
      await delay(300);
      _visits = _visits.filter(v => v.id !== id);
      return { success: true };
    }
    return apiFetch(`${API_BASE}/visits/${id}`, { method: 'DELETE' });
  },

  // USER MANAGEMENT
  createUser: async (data) => {
    if (!USE_API) {
      await delay(400);
      if (_users.find(u => u.email === data.email)) throw new Error('Bu e-posta adresi zaten kullanımda.');
      const user = { ...data, id: _nextUserId++ };
      _users.push(user);
      const { password: _, ...safe } = user;
      return safe;
    }
    return apiFetch(`${API_BASE}/users`, { method: 'POST', body: JSON.stringify(data) });
  },

  updateUser: async (id, data) => {
    if (!USE_API) {
      await delay(400);
      const idx = _users.findIndex(u => u.id === id);
      if (idx === -1) throw new Error('Kullanıcı bulunamadı');
      const existing = _users[idx];
      if (_users.find(u => u.email === data.email && u.id !== id)) throw new Error('Bu e-posta adresi zaten kullanımda.');
      _users[idx] = { ...existing, ...data, id, password: data.password || existing.password };
      const { password: _, ...safe } = _users[idx];
      return safe;
    }
    return apiFetch(`${API_BASE}/users/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  },

  deleteUser: async (id) => {
    if (!USE_API) {
      await delay(300);
      _users = _users.filter(u => u.id !== id);
      return { success: true };
    }
    return apiFetch(`${API_BASE}/users/${id}`, { method: 'DELETE' });
  },

  updateAvatar: async (avatar) => {
    if (!USE_API) { await delay(200); return { success: true }; }
    return apiFetch(`${API_BASE}/profile/avatar`, { method: 'PUT', body: JSON.stringify({ avatar }) });
  },

  changePassword: async (currentPassword, newPassword) => {
    if (!USE_API) {
      await delay(300);
      const user = _users.find(u => u.password === currentPassword);
      if (!user) throw new Error('Mevcut şifre hatalı.');
      user.password = newPassword;
      return { success: true };
    }
    return apiFetch(`${API_BASE}/profile/password`, { method: 'PUT', body: JSON.stringify({ currentPassword, newPassword }) });
  },

  getVisitsSnapshot: () => _visits,
};

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }
