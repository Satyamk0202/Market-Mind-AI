# MarketMIND 📈
### Full-Stack AI Indian Stock Market Research Platform

> Flask Backend · Vanilla JS Frontend · Real Yahoo Finance Data · ₹ INR · NSE/BSE

---

## 📁 Project Structure

```
MarketMIND/
├── backend/
│   ├── app.py              ← Flask API server (all data fetching)
│   ├── requirements.txt    ← Python dependencies
│   ├── start.sh            ← macOS/Linux setup + run script
│   └── start.bat           ← Windows setup + run script
│
├── frontend/
│   ├── index.html          ← Main HTML (single page app)
│   ├── css/
│   │   └── style.css       ← All styles
│   └── js/
│       ├── api.js          ← API client (talks to Flask)
│       ├── chart.js        ← Canvas chart engine (no CDN)
│       └── app.js          ← All UI logic & page rendering
│
├── .vscode/
│   ├── settings.json       ← Live Server + Python config
│   ├── extensions.json     ← Recommended extensions
│   └── launch.json         ← Run backend + open browser
│
└── README.md               ← This file
```

---

## 🚀 Setup — macOS (Step by Step)

### Prerequisites
- Python 3.8+ → https://python.org
- VS Code → https://code.visualstudio.com

### Step 1 — Open in VS Code
```bash
# Unzip and open
cd ~/Downloads
unzip MarketMIND.zip
open -a "Visual Studio Code" MarketMIND
```

### Step 2 — Install VS Code Extensions
VS Code will auto-prompt to install recommended extensions. Click **Install All**.

Or install manually (`Cmd+Shift+X`):
- **Live Server** by Ritwick Dey
- **Python** by Microsoft

### Step 3 — Start the Backend
**Option A — Terminal in VS Code** (`` Ctrl+` ``):
```bash
cd backend
chmod +x start.sh
./start.sh
```

**Option B — VS Code Run Panel** (`Cmd+Shift+D`):
- Select **"Run Flask Backend"**
- Click the green ▶ play button

You should see:
```
==================================================
  MarketMIND API Server
  Running at: http://localhost:5000
==================================================
```

### Step 4 — Open the Frontend
- Right-click `frontend/index.html` in VS Code Explorer
- Select **"Open with Live Server"**
- App opens at → `http://127.0.0.1:5500/frontend/index.html`

✅ The sidebar will show **"API Connected"** in green when working.

---

## 🔌 API Endpoints

All served from `http://localhost:5000/api`

| Endpoint | Description |
|---|---|
| `GET /api/health` | Server status + IST time |
| `GET /api/quote/TCS.NS` | Single stock live quote |
| `GET /api/history/TCS.NS?range=1mo&interval=1d` | OHLCV price history |
| `GET /api/batch?symbols=TCS.NS,INFY.NS` | Multiple quotes at once |
| `GET /api/indices` | NIFTY 50, SENSEX, BANK NIFTY |
| `GET /api/search?q=reliance` | Symbol search suggestions |
| `GET /api/market_status` | NSE open/closed status |

**Test in browser:**
```
http://localhost:5000/api/quote/TCS.NS
http://localhost:5000/api/indices
http://localhost:5000/api/health
```

---

## 🔍 Supported NSE Symbols

```
RELIANCE   TCS        INFY       HDFCBANK   ICICIBANK
WIPRO      SBIN       KOTAKBANK  ITC        AXISBANK
LT         MARUTI     SUNPHARMA  NTPC       BHARTIARTL
HINDUNILVR ASIANPAINT TITAN      BAJAJFINSV TATAMOTORS
ONGC       COALINDIA  POWERGRID  TECHM      HCLTECH
BAJFINANCE ADANIENT   ADANIPORTS JSWSTEEL   TATASTEEL
M&M        CIPLA      DRREDDY    EICHERMOT  BPCL
```

---

## ✨ Features

| Feature | Description |
|---|---|
| **Live Ticker Tape** | 12 NSE stocks scrolling live |
| **Market Indices** | NIFTY 50, SENSEX, BANK NIFTY with sparklines |
| **Stock Research** | Full analysis: price, chart, AI, indicators |
| **Price Charts** | 5D / 1M / 3M / 1Y / 5Y with hover tooltip |
| **AI Analysis** | Rule-based: RSI, SMA20, SMA50 signals |
| **Technical Indicators** | RSI(14), SMA20, SMA50, Day Position |
| **Stock Screener** | Filter 15 stocks by sector, live prices |
| **Search Suggestions** | Live autocomplete as you type |
| **Market News** | Indian financial news feed |
| **IST Clock** | Real-time + NSE open/close status |
| **API Status** | Sidebar shows backend connection health |
| **Auto Refresh** | Data refreshes every 60 seconds |

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Backend** | Python 3, Flask, yfinance, pandas |
| **Frontend** | Vanilla HTML5 / CSS3 / JavaScript |
| **Charts** | Custom Canvas API (zero dependencies) |
| **Data** | Yahoo Finance via yfinance library |
| **Styling** | CSS custom properties, system fonts |

---

## ⚙️ VS Code Shortcuts (macOS)

| Action | Shortcut |
|---|---|
| Open Explorer | `Cmd + Shift + E` |
| Open Terminal | `` Ctrl + ` `` |
| Run/Debug | `Cmd + Shift + D` |
| Open extensions | `Cmd + Shift + X` |
| Format file | `Shift + Alt + F` |

---

## ⚠️ Disclaimer

MarketMIND is for **educational and research purposes only**.
Yahoo Finance data may have up to 15 minutes delay.
Not SEBI-registered. Not investment advice.
Always consult a qualified financial advisor.
