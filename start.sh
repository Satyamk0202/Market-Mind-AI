#!/bin/bash
# ═══════════════════════════════════════════
#  MarketMIND — Backend Setup & Start Script
#  macOS / Linux
# ═══════════════════════════════════════════

set -e

echo ""
echo "╔══════════════════════════════════════╗"
echo "║      MarketMIND — Backend Setup      ║"
echo "╚══════════════════════════════════════╝"
echo ""

# Check Python
if ! command -v python3 &>/dev/null; then
  echo "❌  Python 3 not found. Install from https://python.org"
  exit 1
fi

echo "✅  Python: $(python3 --version)"

# Create virtual environment
if [ ! -d "venv" ]; then
  echo "📦  Creating virtual environment..."
  python3 -m venv venv
fi

# Activate
source venv/bin/activate

# Install dependencies
echo "📥  Installing dependencies..."
pip install --upgrade pip -q
pip install -r requirements.txt -q

echo ""
echo "✅  All dependencies installed!"
echo ""
echo "🚀  Starting MarketMIND API server..."
echo "    URL: http://localhost:5000"
echo "    Press Ctrl+C to stop"
echo ""

python app.py
