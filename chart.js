/**
 * MarketMIND — Canvas Chart Engine
 * Lightweight chart renderer. Zero external dependencies.
 */

/**
 * Draw a full price chart with grid, labels, fill, and hover tooltip.
 * @param {string} canvasId
 * @param {{t:number, c:number}[]} pts  - array of {timestamp_ms, close}
 * @param {boolean} positive
 */
function drawChart(canvasId, pts, positive) {
  const cv = document.getElementById(canvasId);
  if (!cv || !pts || pts.length < 2) return;

  const dpr  = window.devicePixelRatio || 1;
  const rect = cv.getBoundingClientRect();
  const W    = rect.width  || 600;
  const H    = rect.height || 150;

  cv.width  = W * dpr;
  cv.height = H * dpr;
  cv.style.width  = W + 'px';
  cv.style.height = H + 'px';

  const ctx = cv.getContext('2d');
  ctx.scale(dpr, dpr);

  const prices = pts.map(p => p.c);
  const times  = pts.map(p => p.t);
  const minP   = Math.min(...prices);
  const maxP   = Math.max(...prices);
  const range  = maxP - minP || 1;

  const pad = { t: 10, r: 10, b: 30, l: 58 };
  const cW  = W - pad.l - pad.r;
  const cH  = H - pad.t - pad.b;

  const px = i  => pad.l + (i / (prices.length - 1)) * cW;
  const py = v  => pad.t + cH - ((v - minP) / range) * cH;

  const color     = positive ? '#22c55e' : '#ef4444';
  const colorFade = positive ? 'rgba(34,197,94,0.09)' : 'rgba(239,68,68,0.09)';

  ctx.clearRect(0, 0, W, H);

  // ── Horizontal grid lines ──
  ctx.strokeStyle = 'rgba(255,255,255,0.04)';
  ctx.lineWidth   = 1;
  for (let i = 0; i <= 4; i++) {
    const y = pad.t + (cH / 4) * i;
    ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(W - pad.r, y); ctx.stroke();
  }

  // ── Y axis labels ──
  ctx.fillStyle  = 'rgba(85,85,110,0.9)';
  ctx.font       = `${Math.round(9 * dpr) / dpr}px monospace`;
  ctx.textAlign  = 'right';
  ctx.textBaseline = 'middle';
  for (let i = 0; i <= 4; i++) {
    const v   = maxP - (range / 4) * i;
    const y   = pad.t + (cH / 4) * i;
    const lbl = v >= 1000 ? '₹' + (v / 1000).toFixed(1) + 'k' : '₹' + Math.round(v);
    ctx.fillText(lbl, pad.l - 5, y);
  }

  // ── X axis labels ──
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'alphabetic';
  const xCount = Math.min(6, prices.length);
  const xStep  = Math.floor((prices.length - 1) / (xCount - 1));
  for (let i = 0; i < prices.length; i += xStep) {
    const d   = new Date(times[i]);
    const lbl = d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
    ctx.fillText(lbl, px(i), H - 6);
  }

  // ── Gradient fill ──
  const grad = ctx.createLinearGradient(0, pad.t, 0, H - pad.b);
  grad.addColorStop(0,   colorFade);
  grad.addColorStop(1,   'rgba(0,0,0,0)');

  ctx.beginPath();
  ctx.moveTo(px(0), py(prices[0]));
  for (let i = 1; i < prices.length; i++) ctx.lineTo(px(i), py(prices[i]));
  ctx.lineTo(px(prices.length - 1), H - pad.b);
  ctx.lineTo(px(0), H - pad.b);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();

  // ── Price line ──
  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.lineWidth   = 2;
  ctx.lineJoin    = 'round';
  ctx.moveTo(px(0), py(prices[0]));
  for (let i = 1; i < prices.length; i++) ctx.lineTo(px(i), py(prices[i]));
  ctx.stroke();

  // ── End dot ──
  const lx = px(prices.length - 1);
  const ly = py(prices[prices.length - 1]);
  ctx.beginPath();
  ctx.arc(lx, ly, 3.5, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();

  // ── Hover tooltip ──
  const tip = document.getElementById(canvasId + '_tip');
  if (!tip) {
    const t = document.createElement('div');
    t.id = canvasId + '_tip';
    t.style.cssText = `
      position:absolute;background:rgba(16,16,26,0.96);
      border:1px solid rgba(255,255,255,0.1);
      border-radius:7px;padding:6px 10px;
      font-family:monospace;font-size:11px;color:#eeeef6;
      pointer-events:none;opacity:0;transition:opacity 0.15s;
      white-space:nowrap;z-index:10;
    `;
    cv.parentElement.style.position = 'relative';
    cv.parentElement.appendChild(t);
  }
  const tooltip = document.getElementById(canvasId + '_tip');

  cv.onmousemove = (e) => {
    const bnd = cv.getBoundingClientRect();
    const mx  = e.clientX - bnd.left;
    const my  = e.clientY - bnd.top;

    if (mx < pad.l || mx > W - pad.r) { tooltip.style.opacity = '0'; return; }

    const idx   = Math.round(((mx - pad.l) / cW) * (prices.length - 1));
    const safeI = Math.max(0, Math.min(prices.length - 1, idx));
    const v     = prices[safeI];
    const d     = new Date(times[safeI]);
    const dStr  = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

    tooltip.innerHTML = `<span style="color:var(--muted,#55556e)">${dStr}</span><br/>₹${Number(v).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

    let tx = mx + 12;
    if (tx + 130 > W) tx = mx - 130;
    tooltip.style.left    = tx + 'px';
    tooltip.style.top     = (my - 10) + 'px';
    tooltip.style.opacity = '1';
  };
  cv.onmouseleave = () => { tooltip.style.opacity = '0'; };
}


/**
 * Draw a sparkline (mini chart, no labels or tooltips).
 */
function drawSparkline(canvasId, pts, positive) {
  const cv = document.getElementById(canvasId);
  if (!cv || !pts || pts.length < 2) return;

  const W = cv.offsetWidth || 180;
  const H = 26;
  cv.width  = W;
  cv.height = H;

  const ctx    = cv.getContext('2d');
  const prices = pts.map(p => p.c);
  const mn     = Math.min(...prices);
  const mx     = Math.max(...prices);
  const rng    = mx - mn || 1;
  const color  = positive ? '#22c55e' : '#ef4444';

  ctx.clearRect(0, 0, W, H);
  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.lineWidth   = 1.5;
  ctx.lineJoin    = 'round';

  prices.forEach((v, i) => {
    const x = (i / (prices.length - 1)) * W;
    const y = H - 2 - ((v - mn) / rng) * (H - 4);
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });
  ctx.stroke();
}
