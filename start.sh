#!/bin/bash

# HealthMate AI - 1-Click Complete Project Runner
# Runs AI Service, Backend API, and Frontend concurrently

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
echo "=================================================="
echo "🏥 Starting HealthMate AI Ecosystem from: $PROJECT_ROOT"
echo "=================================================="

# Function to stop background processes on Ctrl+C
cleanup() {
    echo ""
    echo "🛑 Shutting down all HealthMate AI services..."
    kill $(jobs -p) 2>/dev/null
    exit 0
}
trap cleanup SIGINT SIGTERM

# 1. Start AI Microservice (Port 8000)
echo "🧠 1. Starting AI Microservice on http://localhost:8000..."
cd "$PROJECT_ROOT/ai-service"
if [ -d "venv" ]; then
    ./venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload &
else
    uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload &
fi
AI_PID=$!

# 2. Start Backend API (Port 5001)
echo "🚀 2. Starting Node.js Backend API on http://localhost:5001..."
cd "$PROJECT_ROOT/backend"
npm run dev &
BACKEND_PID=$!

# 3. Start Frontend Client (Port 5173)
echo "💻 3. Starting React + Vite Frontend on http://localhost:5173..."
cd "$PROJECT_ROOT/frontend"
npm run dev &
FRONTEND_PID=$!

echo ""
echo "=================================================="
echo "✅ All HealthMate AI services are now running!"
echo "👉 Frontend:   http://localhost:5173"
echo "👉 Backend:    http://localhost:5001 (Health: http://localhost:5001/health)"
echo "👉 AI Service: http://localhost:8000 (Health: http://localhost:8000/health)"
echo "👉 Live Web:   https://healthmate-ai-nine-mocha.vercel.app"
echo "=================================================="
echo "Press Ctrl+C to stop all services."

# Wait for all processes
wait
