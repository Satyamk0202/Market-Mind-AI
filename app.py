"""
MarketMIND Backend — Flask API Server
Handles all Yahoo Finance data fetching server-side (no CORS issues)
Run: python app.py
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
import yfinance as yf
import pandas as pd
from datetime import datetime, timezone
import pytz
import traceback

app = Flask(__name__)
CORS(app)  # Allow all origins so frontend can call this locally

IST = pytz.timezone("Asia/Kolkata")

# ─── helpers ────────────────────────────────────────────────
def safe_float(val):
    try:
        f = float(val)
        return None if (f != f) else round(f, 4)   # NaN check
    except Exception:
        return None

def fmt_mcap(val):
    if val is None:
        return "—"
    if val >= 1e7:
        return f"₹{val/1e7:.2f} Cr"
    if val >= 1e5:
        return f"₹{val/1e5:.1f} L"
    return f"₹{val:.0f}"

# ─── routes ─────────────────────────────────────────────────

@app.route("/api/health")
def health():
    now_ist = datetime.now(IST)
    return jsonify({
        "status": "ok",
        "server_time_ist": now_ist.strftime("%Y-%m-%d %H:%M:%S IST"),
        "message": "MarketMIND API is running"
    })


@app.route("/api/quote/<symbol>")
def quote(symbol):
    """
    GET /api/quote/TCS.NS
    Returns current quote data for a single symbol.
    """
    try:
        ticker = yf.Ticker(symbol)
        info   = ticker.fast_info

        price    = safe_float(getattr(info, "last_price", None))
        prev     = safe_float(getattr(info, "previous_close", None))
        open_p   = safe_float(getattr(info, "open", None))
        high     = safe_float(getattr(info, "day_high", None))
        low      = safe_float(getattr(info, "day_low", None))
        vol      = getattr(info, "three_month_average_volume", None)
        mcap     = safe_float(getattr(info, "market_cap", None))

        if price is None:
            return jsonify({"error": f"No data found for {symbol}"}), 404

        chg  = round(price - prev, 2) if prev else 0
        pct  = round((chg / prev) * 100, 2) if prev else 0

        # Get full name from slow info (cached)
        try:
            slow = ticker.info
            name = slow.get("longName") or slow.get("shortName") or symbol
        except Exception:
            name = symbol.replace(".NS", "").replace(".BO", "")

        return jsonify({
            "symbol":   symbol,
            "name":     name,
            "price":    price,
            "prev":     prev,
            "open":     open_p,
            "high":     high,
            "low":      low,
            "volume":   int(vol) if vol else 0,
            "mcap":     mcap,
            "mcap_fmt": fmt_mcap(mcap),
            "change":   chg,
            "pct":      pct,
            "currency": "INR",
        })
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


@app.route("/api/history/<symbol>")
def history(symbol):
    """
    GET /api/history/TCS.NS?range=1mo&interval=1d
    Returns OHLCV history for charting.
    """
    range_    = request.args.get("range", "1mo")
    interval  = request.args.get("interval", "1d")

    VALID_RANGES    = ["1d","5d","1mo","3mo","6mo","1y","2y","5y","10y","ytd","max"]
    VALID_INTERVALS = ["1m","2m","5m","15m","30m","60m","90m","1h","1d","5d","1wk","1mo","3mo"]

    if range_   not in VALID_RANGES:    range_    = "1mo"
    if interval not in VALID_INTERVALS: interval  = "1d"

    try:
        ticker = yf.Ticker(symbol)
        df     = ticker.history(period=range_, interval=interval)

        if df.empty:
            return jsonify({"error": f"No history for {symbol}"}), 404

        df = df.reset_index()
        # Normalize timestamp column name
        ts_col = "Datetime" if "Datetime" in df.columns else "Date"

        points = []
        for _, row in df.iterrows():
            ts = row[ts_col]
            if hasattr(ts, "timestamp"):
                ts_ms = int(ts.timestamp() * 1000)
            else:
                ts_ms = int(pd.Timestamp(ts).timestamp() * 1000)
            c = safe_float(row.get("Close"))
            o = safe_float(row.get("Open"))
            h = safe_float(row.get("High"))
            l = safe_float(row.get("Low"))
            v = int(row.get("Volume", 0) or 0)
            if c is not None:
                points.append({"t": ts_ms, "o": o, "h": h, "l": l, "c": c, "v": v})

        return jsonify({"symbol": symbol, "range": range_, "interval": interval, "points": points})
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


@app.route("/api/batch")
def batch():
    """
    GET /api/batch?symbols=TCS.NS,INFY.NS,RELIANCE.NS
    Returns quotes for multiple symbols at once.
    """
    raw     = request.args.get("symbols", "")
    symbols = [s.strip() for s in raw.split(",") if s.strip()][:20]   # max 20

    if not symbols:
        return jsonify({"error": "No symbols provided"}), 400

    results = {}
    for sym in symbols:
        try:
            ticker = yf.Ticker(sym)
            info   = ticker.fast_info
            price  = safe_float(getattr(info, "last_price", None))
            prev   = safe_float(getattr(info, "previous_close", None))
            if price is None:
                results[sym] = {"error": "no data"}
                continue
            chg = round(price - prev, 2) if prev else 0
            pct = round((chg / prev) * 100, 2) if prev else 0
            results[sym] = {
                "symbol": sym,
                "price":  price,
                "prev":   prev,
                "change": chg,
                "pct":    pct,
                "high":   safe_float(getattr(info, "day_high", None)),
                "low":    safe_float(getattr(info, "day_low", None)),
                "volume": int(getattr(info, "three_month_average_volume", 0) or 0),
                "mcap":   safe_float(getattr(info, "market_cap", None)),
            }
        except Exception as e:
            results[sym] = {"error": str(e)}

    return jsonify(results)


@app.route("/api/indices")
def indices():
    """
    GET /api/indices
    Returns NIFTY 50, SENSEX, BANK NIFTY quotes.
    """
    SYMS = {"^NSEI": "NIFTY 50", "^BSESN": "SENSEX", "^NSEBANK": "BANK NIFTY"}
    raw  = request.args.get("symbols", ",".join(SYMS.keys()))
    syms = [s.strip() for s in raw.split(",") if s.strip()]

    results = []
    for sym in syms:
        try:
            ticker = yf.Ticker(sym)
            info   = ticker.fast_info
            price  = safe_float(getattr(info, "last_price", None))
            prev   = safe_float(getattr(info, "previous_close", None))
            if price is None:
                continue
            chg = round(price - prev, 2) if prev else 0
            pct = round((chg / prev) * 100, 2) if prev else 0
            results.append({
                "symbol": sym,
                "label":  SYMS.get(sym, sym),
                "price":  price,
                "prev":   prev,
                "change": chg,
                "pct":    pct,
            })
        except Exception:
            pass

    return jsonify(results)


@app.route("/api/search")
def search():
    """
    GET /api/search?q=reliance
    Returns top matching NSE symbols.
    """
    q = request.args.get("q", "").strip().lower()
    if not q:
        return jsonify([])

    # Curated list of popular NSE stocks
    STOCKS = [
        ("RELIANCE.NS","Reliance Industries"),("TCS.NS","Tata Consultancy Services"),
        ("INFY.NS","Infosys"),("HDFCBANK.NS","HDFC Bank"),("ICICIBANK.NS","ICICI Bank"),
        ("WIPRO.NS","Wipro"),("SBIN.NS","State Bank of India"),("KOTAKBANK.NS","Kotak Mahindra Bank"),
        ("AXISBANK.NS","Axis Bank"),("ITC.NS","ITC"),("LT.NS","Larsen & Toubro"),
        ("MARUTI.NS","Maruti Suzuki"),("SUNPHARMA.NS","Sun Pharmaceutical"),
        ("NTPC.NS","NTPC"),("TITAN.NS","Titan Company"),("HINDUNILVR.NS","Hindustan Unilever"),
        ("ASIANPAINT.NS","Asian Paints"),("BAJAJFINSV.NS","Bajaj Finserv"),
        ("BAJFINANCE.NS","Bajaj Finance"),("BHARTIARTL.NS","Bharti Airtel"),
        ("ONGC.NS","Oil and Natural Gas"),("COALINDIA.NS","Coal India"),
        ("POWERGRID.NS","Power Grid"),("TATAMOTORS.NS","Tata Motors"),
        ("HCLTECH.NS","HCL Technologies"),("TECHM.NS","Tech Mahindra"),
        ("ULTRACEMCO.NS","UltraTech Cement"),("NESTLEIND.NS","Nestle India"),
        ("ADANIENT.NS","Adani Enterprises"),("ADANIPORTS.NS","Adani Ports"),
        ("JSWSTEEL.NS","JSW Steel"),("TATASTEEL.NS","Tata Steel"),
        ("M&M.NS","Mahindra & Mahindra"),("INDUSINDBK.NS","IndusInd Bank"),
        ("GRASIM.NS","Grasim Industries"),("CIPLA.NS","Cipla"),
        ("DRREDDY.NS","Dr. Reddy's Laboratories"),("EICHERMOT.NS","Eicher Motors"),
        ("BPCL.NS","BPCL"),("HEROMOTOCO.NS","Hero MotoCorp"),
    ]

    results = [{"symbol": s, "name": n} for s, n in STOCKS
               if q in s.lower() or q in n.lower()][:10]
    return jsonify(results)


@app.route("/api/market_status")
def market_status():
    """
    GET /api/market_status
    Returns whether NSE is currently open.
    """
    now = datetime.now(IST)
    day = now.weekday()   # 0=Mon, 6=Sun
    h, m = now.hour, now.minute
    mins = h * 60 + m
    # NSE: 9:15 AM – 3:30 PM, Mon–Fri
    is_open = (0 <= day <= 4) and (555 <= mins <= 930)
    return jsonify({
        "open": is_open,
        "time_ist": now.strftime("%H:%M:%S"),
        "date": now.strftime("%d %b %Y"),
        "day": now.strftime("%A"),
    })


# ─── run ────────────────────────────────────────────────────
if __name__ == "__main__":
    print("\n" + "="*50)
    print("  MarketMIND API Server")
    print("  Running at: http://localhost:5000")
    print("  Open frontend/index.html in your browser")
    print("="*50 + "\n")
    app.run(debug=True, port=5000, host="0.0.0.0")
