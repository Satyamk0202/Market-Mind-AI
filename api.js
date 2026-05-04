

const API_BASE = 'http://localhost:5000/api';

const _cache = {};
const TTL    = 58000; // 58 seconds

function cacheGet(key) {
  const e = _cache[key];
  return (e && Date.now() - e.ts < TTL) ? e.v : null;
}
function cacheSet(key, val) {
  _cache[key] = { ts: Date.now(), v: val };
}
function cacheClear() {
  Object.keys(_cache).forEach(k => delete _cache[k]);
}

async function apiFetch(path, ttl = TTL) {
  const cached = cacheGet(path);
  if (cached) return cached;

  const res  = await fetch(API_BASE + path, { signal: AbortSignal.timeout(12000) });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  cacheSet(path, data);
  return data;
}

async function apiHealth() {
  try {
    const d = await apiFetch('/health', 5000);
    return { ok: true, msg: d.server_time_ist };
  } catch (e) {
    return { ok: false, msg: 'Backend offline' };
  }
}


async function apiQuote(symbol) {
  return apiFetch(`/quote/${encodeURIComponent(symbol)}`);
}


async function apiHistory(symbol, range = '1mo', interval = '1d') {
  return apiFetch(`/history/${encodeURIComponent(symbol)}?range=${range}&interval=${interval}`, TTL);
}

async function apiBatch(symbols) {
  const key = '/batch?symbols=' + symbols.join(',');
  return apiFetch(key);
}

async function apiIndices() {
  return apiFetch('/indices');
}


async function apiSearch(q) {
  if (!q || q.length < 1) return [];
  return apiFetch(`/search?q=${encodeURIComponent(q)}`, 300000); // 5 min cache
}

async function apiMarketStatus() {
  return apiFetch('/market_status', 30000);
}

function inr(n, compact = false) {
  if (n == null || isNaN(n)) return '—';
  if (compact) {
    if (n >= 1e7) return `₹${(n / 1e7).toFixed(2)} Cr`;
    if (n >= 1e5) return `₹${(n / 1e5).toFixed(1)} L`;
    return `₹${n.toFixed(0)}`;
  }
  return '₹' + Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const isUp  = v => v >= 0;
const fPct  = v => (v >= 0 ? '+' : '') + Number(v).toFixed(2) + '%';
const udc   = v => isUp(v) ? 'up' : 'dn';
const fNum  = n => n ? Number(n).toLocaleString('en-IN') : '—';
