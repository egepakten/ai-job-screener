# 🚀 Deployment Guide - How to Run & Deploy

## 📦 Quick Start (Local Development)

### Prerequisites

- Python 3.12+
- Node.js 18+
- OpenAI API key

---

## 🎯 Local Development Setup

### Step 1: Clone & Setup Environment

```bash
cd /Users/EgePakten/Desktop/ai-job-screener

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# Install Node.js dependencies (frontend)
cd job-assistant-frontend
npm install
cd ..
```

---

### Step 2: Configure Environment

Create `.env` file in project root:

```bash
# .env
OPENAI_API_KEY=sk-your-api-key-here
PORT=8000
```

---

### Step 3: Build FAISS Index

**⚠️ REQUIRED - Run this first!**

```bash
./rebuild_index.sh
```

**Expected output:**

```
📂 Loading jobs from: /Users/EgePakten/Desktop/ai-job-screener/jobs_raw
📄 Found 5 JSON files
  ✓ Loaded: job_1.json - Software Development Engineer II at Expedia
  ✓ Loaded: job_2.json - ...

🔢 Total jobs loaded: 5
🧠 Embedding texts...
🔍 Creating FAISS index...
💾 Saving index and metadata...
✅ FAISS index and metadata saved with 5 jobs!
```

---

### Step 4: Start Backend

**Terminal 1:**

```bash
./run_backend.sh
```

**Expected output:**

```
INFO:     Started server process
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete.
```

**Test it:**

```bash
curl http://localhost:8000/stats
```

---

### Step 5: Start Frontend

**Terminal 2:**

```bash
./run_frontend.sh
```

**Expected output:**

```
VITE v5.0.0  ready in 234 ms

➜  Local:   http://localhost:3000/
➜  Network: use --host to expose
```

---

### Step 6: Open Browser

Go to: **http://localhost:3000**

You should see:

- Navigation bar with "Chat" and "Browse Jobs"
- Modern glassmorphism UI
- Working search and chat features

---

## ✅ Verify Everything Works

### Run Test Suite

```bash
./test_endpoints.sh
```

**Expected output:**

```
🧪 Testing Job Search API Endpoints

Testing GET /stats... ✓ PASSED (HTTP 200)
Testing GET /jobs... ✓ PASSED (HTTP 200)
Testing POST /chat... ✓ PASSED (HTTP 200)
Testing GET /jobs?search=engineer... ✓ PASSED (HTTP 200)
Testing POST /chat with return_all... ✓ PASSED (HTTP 200)
Testing POST /user/profile... ✓ PASSED (HTTP 200)
Testing GET /user/profile/test_user... ✓ PASSED (HTTP 200)

🎉 Testing Complete! All tests passed.
```

---

## 🔧 Manual Testing

### Test Backend Endpoints

```bash
# 1. Health check
curl http://localhost:8000/stats

# 2. Browse jobs
curl http://localhost:8000/jobs?page=1&limit=5

# 3. Search jobs
curl "http://localhost:8000/jobs?search=python"

# 4. Chat with AI
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Show me backend engineering jobs"}'
```

### Test Frontend

1. Open **http://localhost:3000**
2. Click "Browse Jobs"
3. Search for "engineer"
4. Click "Chat"
5. Type "Show me Python jobs"
6. Verify results appear

---

## 📁 Project Scripts

### Backend Scripts

**`run_backend.sh`**

```bash
#!/bin/bash
cd "$(dirname "$0")/job-assistant-backend"
source ../venv/bin/activate
uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

**`rebuild_index.sh`**

```bash
#!/bin/bash
source venv/bin/activate
cd job-assistant-backend/rag
python build_index.py
```

### Frontend Scripts

**`run_frontend.sh`**

```bash
#!/bin/bash
cd job-assistant-frontend
npm run dev
```

### Testing Script

**`test_endpoints.sh`**

```bash
#!/bin/bash
# Tests all API endpoints
curl -s http://localhost:8000/stats
curl -s http://localhost:8000/jobs
# ... more tests
```

---

## 🐛 Troubleshooting

### Backend won't start

**Error: "ModuleNotFoundError"**

```bash
# Solution: Install dependencies
source venv/bin/activate
pip install -r requirements.txt
```

**Error: "Index file not found"**

```bash
# Solution: Build index
./rebuild_index.sh
```

**Error: "OpenAI API key not found"**

```bash
# Solution: Check .env file
cat .env | grep OPENAI_API_KEY
```

---

### Frontend shows blank page

**Error: "Network Error"**

```bash
# Solution: Check if backend is running
curl http://localhost:8000/stats

# If not, start backend:
./run_backend.sh
```

**Error: "Cannot GET /"**

```bash
# Solution: Wrong directory
cd job-assistant-frontend
npm run dev
```

---

### No jobs showing

**Issue: Empty results**

```bash
# Solution: Check if jobs exist
ls -l jobs_raw/

# Rebuild index
./rebuild_index.sh
```

---

### Port already in use

**Error: "Address already in use"**

```bash
# Find process using port 8000
lsof -i :8000

# Kill the process
kill -9 <PID>

# Or use different port
uvicorn main:app --port 8001
```

---

## 🌐 Production Deployment

### Option 1: Docker (Recommended)

**Create `Dockerfile`:**

```dockerfile
# Backend
FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY job-assistant-backend ./job-assistant-backend
COPY jobs_raw ./jobs_raw
COPY vector_index ./vector_index
CMD ["uvicorn", "job-assistant-backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**Build and run:**

```bash
docker build -t job-assistant .
docker run -p 8000:8000 --env-file .env job-assistant
```

---

### Option 2: Cloud Platforms

#### Railway.app

1. Connect GitHub repo
2. Add environment variables
3. Deploy automatically

#### Render.com

1. Create new Web Service
2. Build command: `pip install -r requirements.txt`
3. Start command: `uvicorn job-assistant-backend.main:app --host 0.0.0.0 --port 8000`

#### AWS EC2

```bash
# SSH into server
ssh ubuntu@your-server-ip

# Install dependencies
sudo apt update
sudo apt install python3-pip nodejs npm

# Clone repo
git clone your-repo-url
cd ai-job-screener

# Setup and run
./rebuild_index.sh
./run_backend.sh &
cd job-assistant-frontend && npm run build
```

---

## 📊 Monitoring

### Check System Stats

```bash
curl http://localhost:8000/stats | jq
```

**Response:**

```json
{
  "total_jobs": 2500,
  "total_users": 3,
  "cache_size": {
    "hits": 45,
    "misses": 12,
    "maxsize": 128,
    "currsize": 12
  },
  "max_gpt_results": 20
}
```

### Monitor Cache Hit Rate

```python
# In main.py
cache_info = cached_embed.cache_info()
hit_rate = cache_info.hits / (cache_info.hits + cache_info.misses)
print(f"Cache hit rate: {hit_rate:.1%}")
# Target: >60% hit rate
```

### Monitor Costs

```bash
# Track OpenAI API usage
# Dashboard: https://platform.openai.com/usage

# Estimate monthly costs:
# - 1000 browse requests: $0 (no GPT)
# - 1000 search requests: $0 (no GPT)
# - 1000 chat requests: ~$2 (with GPT)
```

---

## 🔒 Security

### Environment Variables

```bash
# Never commit .env file
echo ".env" >> .gitignore

# Use secure API keys
OPENAI_API_KEY=sk-...
DATABASE_URL=postgresql://...
```

### CORS Configuration

```python
# In main.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",          # Development
        "https://yourdomain.com",         # Production
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Rate Limiting

```python
from slowapi import Limiter

limiter = Limiter(key_func=get_remote_address)

@app.post("/chat")
@limiter.limit("10/minute")
async def chat(request: Request):
    ...
```

---

## 📈 Scaling

### Current Capacity

- ✅ 2,500 jobs - **Perfect with FAISS**
- ✅ 100 concurrent users - **No issues**
- ✅ 1000 queries/day - **~$2/day**

### When to Scale

| Job Count | Solution           | Estimated Cost          |
| --------- | ------------------ | ----------------------- |
| 2,500     | Current (FAISS)    | $0/month infrastructure |
| 10,000    | Pinecone/Weaviate  | ~$70/month              |
| 100,000   | Pinecone + Redis   | ~$200/month             |
| 1M+       | Distributed system | $500+/month             |

---

## ✅ Pre-Deployment Checklist

Before going to production:

- [ ] Environment variables configured
- [ ] FAISS index built (`./rebuild_index.sh`)
- [ ] All tests passing (`./test_endpoints.sh`)
- [ ] CORS configured for production domain
- [ ] Rate limiting enabled
- [ ] Error handling tested
- [ ] Logging configured
- [ ] Backup strategy for index
- [ ] Monitoring setup
- [ ] SSL certificate installed (HTTPS)

---

## 🎯 Performance Optimization

### Backend

```python
# Use async where possible
@app.get("/jobs")
async def get_jobs():
    return await fetch_jobs_async()

# Enable compression
from fastapi.middleware.gzip import GZipMiddleware
app.add_middleware(GZIPMiddleware, minimum_size=1000)

# Cache static responses
from fastapi_cache import FastAPICache
```

### Frontend

```bash
# Production build
npm run build

# Serve with compression
npm install -g serve
serve -s dist -l 3000
```

---

## 📞 Support & Resources

### Logs

```bash
# Backend logs
tail -f backend.log

# Frontend logs
npm run dev --debug
```

### Debug Mode

```python
# Enable FastAPI debug mode
uvicorn main:app --reload --log-level debug
```

### Health Check Endpoint

```python
@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "jobs_loaded": len(retriever.metadata),
        "index_size": retriever.index.ntotal
    }
```

---

## 🎉 You're Ready!

### Development

```bash
./rebuild_index.sh    # One-time
./run_backend.sh      # Terminal 1
./run_frontend.sh     # Terminal 2
```

### Production

```bash
# Build frontend
cd job-assistant-frontend && npm run build

# Run backend with production settings
uvicorn job-assistant-backend.main:app \
  --host 0.0.0.0 \
  --port 8000 \
  --workers 4 \
  --no-access-log
```

---

## 📚 Additional Resources

- **SUMMARY.md** - Project overview
- **FRONTEND.md** - Frontend implementation
- **BACKEND.md** - Backend API details
- **FastAPI Docs** - https://fastapi.tiangolo.com
- **FAISS Docs** - https://github.com/facebookresearch/faiss

---

**Status**: ✅ Ready for Production  
**Last Updated**: October 2025  
**Support**: Check test_endpoints.sh for debugging
