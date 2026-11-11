# HealthMate AI — Environment Setup Guide

**Architecture:** Distributed MERN Stack + Python FastAPI AI Service  
**Node.js Version:** >= 20.0.0  
**Python Version:** >= 3.10  

---

## 1. Quick Local Development Startup

```bash
# 1. Start Node.js Backend API Gateway (Port 5001)
cd backend
npm install
node src/server.js

# 2. Start Python FastAPI AI Service (Port 8000)
cd ai-service
source venv/bin/activate
uvicorn app.main:app --host 0.0.0.0 --port 8000

# 3. Start Vite React Frontend (Port 5173)
cd frontend
npm install
npm run dev
```

---

## 2. Port Allocation Reference

| Service | Port | Base URL |
| :--- | :--- | :--- |
| **Vite Frontend** | `5173` | `http://localhost:5173` |
| **Node.js Express Backend** | `5001` | `http://localhost:5001` |
| **FastAPI AI Service** | `8000` | `http://localhost:8000` |
| **MongoDB Atlas** | `27017` | `mongodb://localhost:27017` |
| **Redis Cloud** | `6379` | `redis://localhost:6379` |

---

## 3. Running Automated Tests

```bash
# Run backend security and integration tests
cd backend
npm test

# Run AI service pytest suite
cd ai-service
pytest tests/
```
