#!/bin/bash
# ──────────────────────────────────────────────────────────
# Wardly — One-Click Project Launcher
# Usage: ./start.sh
# ──────────────────────────────────────────────────────────

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_PORT=8000
FRONTEND_PORT=5173

RED='\033[0;31m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}  WARDLY — Civic Audit & Complaint Intelligence  ${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# ── Kill any existing processes on required ports ──
kill_port() {
  local port=$1
  local pids=$(lsof -t -i tcp:$port 2>/dev/null || true)
  if [ -n "$pids" ]; then
    echo -e "${YELLOW}⚠  Port $port in use — killing PID(s): $pids${NC}"
    echo "$pids" | xargs kill -9 2>/dev/null || true
    for i in 1 2 3 4 5; do
      if ! lsof -t -i tcp:$port >/dev/null 2>&1; then
        break
      fi
      sleep 0.5
    done
  fi
}

kill_port $BACKEND_PORT
kill_port $FRONTEND_PORT

# ── Backend ──
echo -e "${GREEN}▸ Starting Backend (FastAPI on :${BACKEND_PORT})...${NC}"
cd "$SCRIPT_DIR/backend"

if [ ! -d ".venv" ]; then
  echo -e "${YELLOW}  Creating Python virtual environment...${NC}"
  python3 -m venv .venv
fi

source .venv/bin/activate

# Quick dependency check — only install if requirements changed
if [ requirements.txt -nt .venv/.deps_installed ] 2>/dev/null; then
  echo -e "${YELLOW}  Installing/updating Python dependencies...${NC}"
  pip install -q -r requirements.txt
  touch .venv/.deps_installed
fi

uvicorn app.main:app --reload --port $BACKEND_PORT --host 0.0.0.0 &
BACKEND_PID=$!
echo -e "${GREEN}  ✓ Backend PID: $BACKEND_PID${NC}"

# ── Frontend ──
echo -e "${GREEN}▸ Starting Frontend (Vite on :${FRONTEND_PORT})...${NC}"
cd "$SCRIPT_DIR/frontend"

if [ ! -d "node_modules" ]; then
  echo -e "${YELLOW}  Installing npm dependencies...${NC}"
  npm install
fi

npm run dev -- --port $FRONTEND_PORT --host &
FRONTEND_PID=$!
echo -e "${GREEN}  ✓ Frontend PID: $FRONTEND_PID${NC}"

echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}  ✅ Wardly is running!${NC}"
echo -e "  Backend  → ${CYAN}http://localhost:${BACKEND_PORT}${NC}"
echo -e "  Frontend → ${CYAN}http://localhost:${FRONTEND_PORT}${NC}"
echo -e "  Swagger  → ${CYAN}http://localhost:${BACKEND_PORT}/docs${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}  Press Ctrl+C to stop both servers${NC}"
echo ""

# Auto-open in user's default browser (non-blocking)
sleep 2
if command -v open >/dev/null 2>&1; then
  open "http://localhost:${FRONTEND_PORT}" 2>/dev/null || true
elif command -v xdg-open >/dev/null 2>&1; then
  xdg-open "http://localhost:${FRONTEND_PORT}" 2>/dev/null || true
fi


# ── Trap Ctrl+C to kill both ──
cleanup() {
  echo ""
  echo -e "${RED}Shutting down Wardly...${NC}"
  kill $BACKEND_PID 2>/dev/null || true
  kill $FRONTEND_PID 2>/dev/null || true
  # Clean up any remaining processes on ports
  kill_port $BACKEND_PORT
  kill_port $FRONTEND_PORT
  echo -e "${GREEN}✓ All servers stopped.${NC}"
  exit 0
}

trap cleanup SIGINT SIGTERM

# Wait for either process to exit
wait
