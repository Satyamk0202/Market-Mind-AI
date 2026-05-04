
const WL_LIST = [
  { sym: 'RELIANCE.NS', name: 'Reliance'   },
  { sym: 'TCS.NS',      name: 'TCS'        },
  { sym: 'INFY.NS',     name: 'Infosys'    },
  { sym: 'HDFCBANK.NS', name: 'HDFC Bank'  },
  { sym: 'ICICIBANK.NS',name: 'ICICI Bk'   },
  { sym: 'WIPRO.NS',    name: 'Wipro'      },
  { sym: 'SBIN.NS',     name: 'SBI'        },
  { sym: 'MARUTI.NS',   name: 'Maruti'     },
];

const TICKER_SYMS = [
  'RELIANCE.NS','TCS.NS','INFY.NS','HDFCBANK.NS','ICICIBANK.NS',
  'KOTAKBANK.NS','AXISBANK.NS','ITC.NS','LT.NS','ONGC.NS',
  'BHARTIARTL.NS','MARUTI.NS','SUNPHARMA.NS','NTPC.NS','WIPRO.NS'
];

const SCREENER_LIST = [
  { sym:'RELIANCE.NS', name:'Reliance Industries',    sec:'Energy'   },
  { sym:'TCS.NS',      name:'Tata Consultancy Svcs',  sec:'IT'       },
  { sym:'HDFCBANK.NS', name:'HDFC Bank',               sec:'Banking'  },
  { sym:'INFY.NS',     name:'Infosys',                 sec:'IT'       },
  { sym:'ICICIBANK.NS',name:'ICICI Bank',              sec:'Banking'  },
  { sym:'LT.NS',       name:'Larsen & Toubro',         sec:'Infra'    },
  { sym:'MARUTI.NS',   name:'Maruti Suzuki',           sec:'Auto'     },
  { sym:'SUNPHARMA.NS',name:'Sun Pharmaceutical',      sec:'Pharma'   },
  { sym:'NTPC.NS',     name:'NTPC',                    sec:'Energy'   },
  { sym:'WIPRO.NS',    name:'Wipro',                   sec:'IT'       },
  { sym:'TITAN.NS',    name:'Titan Company',           sec:'Consumer' },
  { sym:'HINDUNILVR.NS',name:'Hindustan Unilever',     sec:'FMCG'     },
  { sym:'BAJFINANCE.NS',name:'Bajaj Finance',          sec:'Finance'  },
  { sym:'TATAMOTORS.NS',name:'Tata Motors',            sec:'Auto'     },
  { sym:'HCLTECH.NS',  name:'HCL Technologies',        sec:'IT'       },
];

const NEWS_DATA = [
  { src:'Economic Times',   title:'Sensex surges 650 pts; Nifty reclaims 24,500 on broad FII buying spree',                   time:'20m ago', tag:'Markets'     },
  { src:'Moneycontrol',     title:'RBI holds repo rate at 6.5% — signals data-driven approach going forward',                  time:'1h ago',  tag:'Policy'      },
  { src:'Business Standard',title:'IT sector: TCS and Infosys signal deal pipeline recovery in BFSI vertical for FY26',       time:'2h ago',  tag:'IT'          },
  { src:'Mint',             title:'Auto sales record: Maruti, M&M, Hyundai post highest-ever April volumes',                   time:'3h ago',  tag:'Auto'        },
  { src:'CNBC TV18',        title:'FII inflows surge to ₹9,400 Cr — highest single-day buy in over 4 months',                 time:'4h ago',  tag:'FII Flow'    },
  { src:'Zee Business',     title:'Gold at ₹72,600/10g on MCX — safe-haven demand extends weekly rally',                      time:'5h ago',  tag:'Commodities' },
  { src:'Financial Express',title:'HDFC Bank Q4: Net profit rises 18% YoY; NIM expands 12 bps — street cheers',               time:'6h ago',  tag:'Banking'     },
  { src:'Bloomberg Quint',  title:'Nifty options PCR at 1.24 — derivatives data signals bullish bias above 24,000',           time:'7h ago',  tag:'Derivatives' },
  { src:'PTI Markets',      title:'SEBI revises F&O lot size norms — aims to curb retail speculation in index contracts',      time:'9h ago',  tag:'Regulation'  },
  { src:'Reuters India',    title:'Adani Green Energy closes ₹12,000 Cr sovereign green bond — record renewable deal',        time:'11h ago', tag:'Energy'      },
];

function tickClock() {
  const now = new Date();
  const ist = new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
  }).format(now);

  const clkEl = document.getElementById('clkEl');
  if (clkEl) clkEl.textContent = 'IST ' + ist;

  const [h, m] = ist.split(':').map(Number);
  const mins   = h * 60 + m;
  const day    = now.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', weekday: 'short' });
  const open   = !['Sat','Sun'].includes(day) && mins >= 555 && mins <= 930;

  const dot = document.getElementById('mktDot');
  const lbl = document.getElementById('mktLbl');
  if (dot) { dot.className = 'mkt-dot ' + (open ? 'live' : 'closed'); }
  if (lbl) { lbl.textContent = open ? 'NSE LIVE' : 'CLOSED'; lbl.style.color = open ? 'var(--green)' : 'var(--muted)'; }
}
setInterval(tickClock, 1000);
tickClock();

async function checkApiStatus() {
  const dot = document.getElementById('apiDot');
  const txt = document.getElementById('apiTxt');
  const h   = await apiHealth();
  if (dot) dot.className = 'api-dot ' + (h.ok ? 'ok' : 'err');
  if (txt) txt.textContent = h.ok ? 'API Connected' : '⚠ Start backend/start.sh';
}

async function buildTicker() {
  const el = document.getElementById('tickerEl');
  if (!el) return;
  try {
    const data = await apiBatch(TICKER_SYMS.slice(0, 12));
    let html = '';
    for (const sym of TICKER_SYMS.slice(0, 12)) {
      const d = data[sym];
      if (!d || d.error) continue;
      const lbl = sym.replace('.NS', '');
      html += `<div class="t-item">
        <span class="t-sym">${lbl}</span>
        <span class="t-price">${inr(d.price)}</span>
        <span class="t-chg ${udc(d.pct)}">${fPct(d.pct)}</span>
      </div>`;
    }
    if (html) el.innerHTML = html + html;
  } catch (_) {}
}

async function buildSbWl() {
  const el = document.getElementById('sbWl');
  if (!el) return;
  try {
    const syms = WL_LIST.map(s => s.sym);
    const data = await apiBatch(syms);
    let html = '';
    for (const s of WL_LIST) {
      const d = data[s.sym];
      html += `<button class="wl-row" onclick="quickSearch('${s.sym}')">
        <div>
          <div class="wl-sym">${s.sym.replace('.NS','')}</div>
          <div class="wl-nm">${s.name}</div>
        </div>
        <div>
          <div class="wl-p">${d && !d.error ? inr(d.price) : '—'}</div>
          ${d && !d.error ? `<div class="wl-c ${udc(d.pct)}">${fPct(d.pct)}</div>` : ''}
        </div>
      </button>`;
    }
    el.innerHTML = html;
  } catch (_) {
    el.innerHTML = '<div style="font-size:0.65rem;color:var(--muted);padding:0.5rem">Start the backend to see live data</div>';
  }
}

function goTo(page, el) {
  document.querySelectorAll('.npill, .sb-btn').forEach(e => e.classList.remove('active'));
  if (el) el.classList.add('active');
  document.querySelectorAll(`.sb-btn`).forEach(e => {
    if (e.getAttribute('onclick')?.includes(`'${page}'`)) e.classList.add('active');
  });
  if (page === 'dashboard') renderDashboard();
  if (page === 'research')  renderResearch();
  if (page === 'screener')  renderScreener();
  if (page === 'news')      renderNewsPage();
  if (page === 'portfolio') renderPortfolio();
}

async function renderDashboard() {
  const el  = document.getElementById('mainArea');
  const ds  = new Date().toLocaleDateString('en-IN', { weekday:'long', year:'numeric', month:'long', day:'numeric' });
  el.innerHTML = `
    <div class="fi flex-between">
      <div>
        <div class="page-title">Market Overview</div>
        <div class="page-sub">${ds}</div>
      </div>
      <div style="display:flex;gap:0.5rem">
        <button class="btn-outline" onclick="fullRefresh()">↻ Refresh</button>
        <button class="btn-sm" onclick="goTo('research',null)">+ Research</button>
      </div>
    </div>
    <div class="idx-strip fi" id="idxStrip">
      <div class="idx-card"><div class="ld"><div class="spin"></div> Loading…</div></div>
      <div class="idx-card"><div class="ld"><div class="spin"></div> Loading…</div></div>
      <div class="idx-card"><div class="ld"><div class="spin"></div> Loading…</div></div>
    </div>
    <div class="search-card fi">
      <div class="s-title">Quick Research</div>
      ${searchBarHTML()}
    </div>
    <div id="stockResult" style="display:none;flex-direction:column;gap:1.1rem"></div>
  `;
  loadIndices();
}

async function loadIndices() {
  const el = document.getElementById('idxStrip');
  if (!el) return;
  try {
    const data = await apiIndices();
    let html = '';
    for (let i = 0; i < data.length; i++) {
      const d = data[i];
      html += `<div class="idx-card fi" style="animation-delay:${i*0.07}s">
        <div class="idx-tag">${d.label}</div>
        <div class="idx-val">${Number(d.price).toLocaleString('en-IN', {minimumFractionDigits:2})}</div>
        <div class="idx-meta">
          <div class="idx-chg ${udc(d.pct)}">${fPct(d.pct)}</div>
          <div class="idx-abs">${(d.change >= 0 ? '+' : '') + d.change.toFixed(2)}</div>
        </div>
        <canvas class="spark-canvas" id="spk${i}"></canvas>
      </div>`;
    }
    el.innerHTML = html;
    // Load sparklines
    for (let i = 0; i < data.length; i++) {
      const d = data[i];
      try {
        const hist = await apiHistory(d.symbol, '5d', '30m');
        requestAnimationFrame(() => drawSparkline('spk' + i, hist.points, d.pct >= 0));
      } catch (_) {}
    }
  } catch (_) {
    el.innerHTML = `<div class="err" style="grid-column:1/-1">⚠ Could not load indices. Make sure the backend is running: <code>cd backend && ./start.sh</code></div>`;
  }
}

function renderResearch() {
  document.getElementById('mainArea').innerHTML = `
    <div class="fi">
      <div class="page-title">Stock Research</div>
      <div class="page-sub">Real-time NSE/BSE data · AI analysis · Technical indicators</div>
    </div>
    <div class="search-card fi">
      ${searchBarHTML()}
    </div>
    <div id="stockResult" style="display:none;flex-direction:column;gap:1.1rem"></div>
  `;
}
function searchBarHTML() {
  const chips = ['RELIANCE','TCS','INFY','HDFCBANK','ICICIBANK','WIPRO','SBIN','LT','MARUTI','SUNPHARMA','TITAN','ITC'];
  return `
    <div class="s-row">
      <div class="s-wrap" style="position:relative">
        <svg class="s-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input class="s-input" id="sInput"
          placeholder="NSE symbol — TCS, RELIANCE, INFY, HDFCBANK…"
          oninput="onSearchInput(this.value)"
          onkeydown="if(event.key==='Enter'){closeSuggestions();doSearch()}"
        />
        <div id="suggestions" class="suggestions" style="display:none"></div>
      </div>
      <button class="s-btn" onclick="doSearch()">Analyse ↗</button>
    </div>
    <div class="chips">
      ${chips.map(s => `<button class="chip" onclick="quickSearch('${s}.NS')">${s}</button>`).join('')}
    </div>
  `;
}

let _sugTimeout = null;
async function onSearchInput(val) {
  clearTimeout(_sugTimeout);
  const box = document.getElementById('suggestions');
  if (!box) return;
  if (!val || val.length < 1) { box.style.display = 'none'; return; }
  _sugTimeout = setTimeout(async () => {
    try {
      const results = await apiSearch(val);
      if (!results.length) { box.style.display = 'none'; return; }
      box.innerHTML = results.map(r =>
        `<div class="sug-item" onclick="pickSuggestion('${r.symbol}')">
          <span class="sug-sym">${r.symbol.replace('.NS','')}</span>
          <span class="sug-name">${r.name}</span>
        </div>`
      ).join('');
      box.style.display = 'block';
    } catch (_) { box.style.display = 'none'; }
  }, 250);
}
function pickSuggestion(sym) {
  const inp = document.getElementById('sInput');
  if (inp) inp.value = sym.replace('.NS','');
  closeSuggestions();
  quickSearch(sym);
}
function closeSuggestions() {
  const box = document.getElementById('suggestions');
  if (box) box.style.display = 'none';
}
document.addEventListener('click', e => {
  if (!e.target.closest('.s-wrap')) closeSuggestions();
});

async function doSearch() {
  let raw = (document.getElementById('sInput')?.value || '').trim().toUpperCase();
  if (!raw) return;
  if (!raw.endsWith('.NS') && !raw.endsWith('.BO') && !raw.startsWith('^')) raw += '.NS';
  await loadStock(raw);
}

async function quickSearch(sym) {
  goTo('research', document.querySelector('.npill'));
  await new Promise(r => setTimeout(r, 60));
  const inp = document.getElementById('sInput');
  if (inp) inp.value = sym.replace('.NS','').replace('.BO','');
  await loadStock(sym);
}

async function loadStock(sym) {
  const res = document.getElementById('stockResult');
  if (!res) return;
  res.style.display = 'flex';
  res.innerHTML = `<div class="ld"><div class="spin"></div> Loading <b style="color:var(--lime)">${sym}</b> from backend…</div>`;

  let d;
  try {
    d = await apiQuote(sym);
  } catch (e) {
    res.innerHTML = `<div class="err">⚠ Could not load <b>${sym}</b>. ${e.message || 'Is the backend running?'}</div>`;
    return;
  }

  const hist = await (async () => {
    try { const h = await apiHistory(sym, '1mo', '1d'); return h.points || []; }
    catch (_) { return []; }
  })();

  const ai = buildAI(d, hist);

  res.innerHTML = `
    <!-- HEADER -->
    <div class="sh fi">
      <div class="sh-grid">
        <div>
          <div class="sh-name">${d.name}</div>
          <div class="sh-sym">${sym} · NSE/BSE · ₹ INR</div>
          <div class="sh-meta">
            <div class="sh-mi"><div class="sh-ml">Open</div><div class="sh-mv">${inr(d.open)}</div></div>
            <div class="sh-mi"><div class="sh-ml">High</div><div class="sh-mv" style="color:var(--green)">${inr(d.high)}</div></div>
            <div class="sh-mi"><div class="sh-ml">Low</div><div class="sh-mv" style="color:var(--red)">${inr(d.low)}</div></div>
            <div class="sh-mi"><div class="sh-ml">Prev Close</div><div class="sh-mv">${inr(d.prev)}</div></div>
            <div class="sh-mi"><div class="sh-ml">Volume</div><div class="sh-mv">${fNum(d.volume)}</div></div>
          </div>
          <button class="wl-add" onclick="this.textContent='★ Added';this.style.color='var(--lime)';this.style.borderColor='var(--lime)'">☆ Add to Watchlist</button>
        </div>
        <div style="text-align:right;flex-shrink:0">
          <div class="sh-price"><em>₹</em>${Number(d.price).toLocaleString('en-IN',{minimumFractionDigits:2})}</div>
          <div class="sh-badge ${udc(d.pct)}">${(d.change >= 0 ? '+' : '') + d.change.toFixed(2)} &nbsp; ${fPct(d.pct)}</div>
          ${d.mcap_fmt ? `<div style="font-size:0.62rem;color:var(--muted);margin-top:8px">Mkt Cap: ${d.mcap_fmt}</div>` : ''}
        </div>
      </div>
    </div>

    <!-- CHART -->
    <div class="chart-card fi">
      <div class="chart-hdr">
        <div class="chart-lbl">${sym.replace('.NS','')} · Price Chart</div>
        <div class="rtabs">
          <button class="rtab" onclick="changeRange(this,'${sym}','5d','30m')">5D</button>
          <button class="rtab active" onclick="changeRange(this,'${sym}','1mo','1d')">1M</button>
          <button class="rtab" onclick="changeRange(this,'${sym}','3mo','1d')">3M</button>
          <button class="rtab" onclick="changeRange(this,'${sym}','1y','1wk')">1Y</button>
          <button class="rtab" onclick="changeRange(this,'${sym}','5y','1mo')">5Y</button>
        </div>
      </div>
      <div class="chart-wrap"><canvas id="mainChart" style="width:100%;height:150px"></canvas></div>
    </div>

    <!-- AI + INDICATORS -->
    <div class="two-col fi">
      <div class="card">
        <div class="ai-hdr"><div class="ai-pulse"></div>MarketMIND AI</div>
        <div class="ai-body">${ai.text}</div>
        <div class="ai-tags">${ai.tags.map(t => `<span class="tag ${t.c}">${t.l}</span>`).join('')}</div>
      </div>
      <div class="card">
        <div class="card-lbl">Technical Indicators</div>
        ${buildIndicators(d, hist)}
      </div>
    </div>

    <!-- METRICS -->
    <div class="card fi">
      <div class="card-lbl">Key Metrics</div>
      <div class="three-col">
        <div class="m-cell"><div class="m-lbl">Market Cap</div><div class="m-val">${d.mcap_fmt || '—'}</div></div>
        <div class="m-cell"><div class="m-lbl">Volume</div><div class="m-val">${fNum(d.volume)}</div></div>
        <div class="m-cell"><div class="m-lbl">Day Range</div><div class="m-val" style="font-size:0.7rem">${inr(d.low)} – ${inr(d.high)}</div></div>
        <div class="m-cell"><div class="m-lbl">Open</div><div class="m-val">${inr(d.open)}</div></div>
        <div class="m-cell"><div class="m-lbl">Prev Close</div><div class="m-val">${inr(d.prev)}</div></div>
        <div class="m-cell"><div class="m-lbl">Change %</div><div class="m-val ${udc(d.pct)}">${fPct(d.pct)}</div></div>
      </div>
    </div>

    <!-- NEWS -->
    <div class="card fi">
      <div class="card-lbl">Market Context</div>
      ${buildContextNews(d.name || sym)}
    </div>
  `;

  requestAnimationFrame(() => drawChart('mainChart', hist, isUp(d.pct)));
}

async function changeRange(el, sym, range, interval) {
  document.querySelectorAll('.rtab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  try {
    const resp = await apiHistory(sym, range, interval);
    const d    = await apiQuote(sym);
    requestAnimationFrame(() => drawChart('mainChart', resp.points, isUp(d.pct)));
  } catch (_) {}
}

function sma(arr, n) {
  if (arr.length < n) return null;
  return arr.slice(-n).reduce((a, b) => a + b, 0) / n;
}
function rsi(arr, n = 14) {
  if (arr.length < n + 1) return null;
  let g = 0, l = 0;
  for (let i = arr.length - n; i < arr.length; i++) {
    const d = arr[i] - arr[i-1];
    d > 0 ? g += d : l += Math.abs(d);
  }
  return 100 - (100 / (1 + (l ? g / l : 99)));
}

function buildIndicators(d, hist) {
  const pr  = hist.map(p => p.c);
  const r   = rsi(pr);
  const s20 = sma(pr, 20);
  const s50 = sma(pr, 50);
  const p   = d.price;

  const rows = [];
  if (r !== null) {
    const [lbl, cls] = r > 70 ? ['OVERBOUGHT','is2'] : r < 30 ? ['OVERSOLD','ib'] : ['NEUTRAL','ih'];
    rows.push({ n: 'RSI (14)', v: r.toFixed(1), s: [lbl, cls] });
  }
  if (s20 !== null) rows.push({ n: 'SMA 20', v: inr(s20), s: p > s20 ? ['BUY','ib'] : ['SELL','is2'] });
  if (s50 !== null) rows.push({ n: 'SMA 50', v: inr(s50), s: p > s50 ? ['BULLISH','ib'] : ['BEARISH','is2'] });

  const rng = d.high - d.low;
  const pos = rng > 0 ? ((p - d.low) / rng) * 100 : 50;
  rows.push({ n: 'Day Position', v: pos.toFixed(0) + '%', s: pos > 70 ? ['Near High','is2'] : pos < 30 ? ['Near Low','ib'] : ['Mid Range','ih'] });
  rows.push({ n: "Today's Move", v: (d.change >= 0 ? '+' : '') + d.change.toFixed(2) + ' ₹', s: isUp(d.pct) ? ['UP DAY','ib'] : ['DOWN DAY','is2'] });

  return rows.map(r =>
    `<div class="irow">
      <div class="in">${r.n}</div>
      <div class="ir"><div class="iv">${r.v}</div><div class="isig ${r.s[1]}">${r.s[0]}</div></div>
    </div>`
  ).join('');
}

function buildAI(d, hist) {
  const pr  = hist.map(p => p.c);
  const r   = rsi(pr);
  const s20 = sma(pr, 20);
  const s50 = sma(pr, 50);
  const tags = [];
  let text   = `<b>${d.name}</b> is trading at <b>${inr(d.price)}</b>. `;

  if (d.pct >= 2)       { text += `Strong bullish momentum — up ${fPct(d.pct)} today. `;   tags.push({ l:'Bullish Today', c:'tag-b' }); }
  else if (d.pct <= -2) { text += `Significant selling pressure — down ${fPct(d.pct)}. `; tags.push({ l:'Bearish Today', c:'tag-r' }); }
  else                  { text += `Consolidating with a modest ${fPct(d.pct)} move today. `; tags.push({ l:'Neutral', c:'tag-n' }); }

  if (r !== null) {
    if      (r > 70) { text += `RSI at ${r.toFixed(1)} — <b>overbought</b>; momentum may stall. `;           tags.push({ l:'Overbought (RSI)', c:'tag-r' }); }
    else if (r < 30) { text += `RSI at ${r.toFixed(1)} — <b>oversold</b>; potential reversal zone. `;        tags.push({ l:'Oversold (RSI)',   c:'tag-b' }); }
    else              { text += `RSI at ${r.toFixed(1)} in neutral zone. `; }
  }

  if (s20 && s50) {
    if      (d.price > s20 && d.price > s50) { text += `Price above SMA20 & SMA50 — <b>uptrend intact</b>. `;         tags.push({ l:'Above MAs', c:'tag-b' }); }
    else if (d.price < s20 && d.price < s50) { text += `Price below both MAs — <b>downtrend caution</b>. `;           tags.push({ l:'Below MAs', c:'tag-r' }); }
    else                                      { text += `Price between key MAs — trend mixed, await confirmation. `; }
  }

  text += `<br/><span style="font-size:0.68rem;color:var(--muted)">⚠ Rule-based AI for research. Not SEBI-registered investment advice.</span>`;
  return { text, tags };
}

function buildContextNews(name) {
  const slug = name.split(' ')[0];
  const items = [
    { src:'Economic Times',   t:`${slug}: Analysts revise target prices after latest quarterly beat`,           time:'1h ago'  },
    { src:'Moneycontrol',     t:`FII desk net buyers in ${slug} — institutional block deal reported on NSE`,    time:'3h ago'  },
    { src:'Business Standard',t:`Nifty 50 view: Key support at 24,100 as broader market consolidates`,          time:'4h ago'  },
    { src:'Mint',             t:`India CPI moderates — positive signal for rate-sensitive sector stocks`,        time:'5h ago'  },
    { src:'CNBC TV18',        t:`${slug} management raises FY26 guidance at annual analyst/investor day`,        time:'7h ago'  },
  ];
  return items.map(n =>
    `<div class="nitem">
      <div class="n-src">${n.src}</div>
      <div class="n-ttl">${n.t}</div>
      <div class="n-time">${n.time}</div>
    </div>`
  ).join('');
}

async function renderScreener() {
  document.getElementById('mainArea').innerHTML = `
    <div class="fi">
      <div class="page-title">Stock Screener</div>
      <div class="page-sub">Filter NSE stocks by sector · Live prices</div>
    </div>
    <div class="card fi">
      <div style="display:flex;align-items:center;gap:0.65rem;flex-wrap:wrap;margin-bottom:1rem">
        <select id="secFilter" style="background:var(--ink2);border:1px solid var(--border);color:var(--text);padding:0.48rem 0.8rem;border-radius:7px;font-size:0.76rem;outline:none">
          <option value="">All Sectors</option>
          <option>IT</option><option>Banking</option><option>Energy</option>
          <option>Auto</option><option>Pharma</option><option>Infra</option>
          <option>Consumer</option><option>FMCG</option><option>Finance</option>
        </select>
        <button class="btn-sm" style="padding:0.48rem 0.9rem;font-size:0.76rem" onclick="loadScr()">Apply Filter</button>
        <span style="font-size:0.65rem;color:var(--muted);margin-left:auto">Click row to deep-dive →</span>
      </div>
      <div class="scr-hdr">
        <span>Symbol</span><span>Company</span><span>Price (₹)</span><span>Change</span><span></span>
      </div>
      <div id="scrRows"><div class="ld"><div class="spin"></div> Loading prices…</div></div>
    </div>
  `;
  loadScr();
}

async function loadScr() {
  const sec    = document.getElementById('secFilter')?.value || '';
  const list   = sec ? SCREENER_LIST.filter(s => s.sec === sec) : SCREENER_LIST;
  const el     = document.getElementById('scrRows');
  if (!el) return;
  el.innerHTML = `<div class="ld"><div class="spin"></div> Fetching live prices…</div>`;

  try {
    const syms = list.map(s => s.sym);
    const data = await apiBatch(syms);
    let html   = '';
    for (const s of list) {
      const d = data[s.sym];
      html += `<div class="scr-row" onclick="quickSearch('${s.sym}')">
        <span class="scr-sym">${s.sym.replace('.NS','')}</span>
        <span><span style="font-size:0.78rem">${s.name}</span><br/><span class="scr-sec">${s.sec}</span></span>
        <span style="font-family:monospace;font-size:0.78rem">${d && !d.error ? inr(d.price) : '—'}</span>
        <span class="${d && !d.error ? udc(d.pct) : ''}" style="font-family:monospace;font-size:0.74rem">${d && !d.error ? fPct(d.pct) : '—'}</span>
        <button class="scr-b" onclick="event.stopPropagation();quickSearch('${s.sym}')">→</button>
      </div>`;
    }
    el.innerHTML = html;
  } catch (_) {
    el.innerHTML = `<div class="err">⚠ Backend not responding. Run <code>backend/start.sh</code> first.</div>`;
  }
}

function renderNewsPage() {
  document.getElementById('mainArea').innerHTML = `
    <div class="fi">
      <div class="page-title">Market News</div>
      <div class="page-sub">Indian financial markets · Live feed</div>
    </div>
    <div class="card fi">
      ${NEWS_DATA.map((n, i) =>
        `<div class="nitem fi" style="animation-delay:${i * 0.04}s">
          <div style="display:flex;align-items:center;gap:0.45rem;margin-bottom:2px">
            <div class="n-src">${n.src}</div>
            <span class="n-tag">${n.tag}</span>
          </div>
          <div class="n-ttl">${n.title}</div>
          <div class="n-time">${n.time}</div>
        </div>`
      ).join('')}
    </div>
  `;
}

function renderPortfolio() {
  document.getElementById('mainArea').innerHTML = `
    <div class="fi">
      <div class="page-title">Portfolio</div>
      <div class="page-sub">Track your investments</div>
    </div>
    <div class="card fi">
      <div class="port-empty">
        <div class="port-icon">📊</div>
        <div style="font-size:0.9rem;font-weight:600;color:var(--text)">Portfolio Coming Soon</div>
        <div class="port-msg">Add stocks to track your portfolio P&L, allocation, and performance vs Nifty 50.</div>
        <button class="btn-sm" onclick="goTo('research',null)">Start Researching Stocks</button>
      </div>
    </div>
  `;
}

function fullRefresh() {
  cacheClear();
  buildTicker();
  buildSbWl();
  if (document.getElementById('idxStrip')) loadIndices();
}

(async () => {
  renderDashboard();
  checkApiStatus();
  buildTicker();
  buildSbWl();

  setInterval(() => {
    cacheClear();
    buildTicker();
    buildSbWl();
    checkApiStatus();
    if (document.getElementById('idxStrip')) loadIndices();
  }, 62000);
})();
