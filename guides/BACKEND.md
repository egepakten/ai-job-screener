# 🔧 Backend Guide - API & RAG System

## 📦 Overview

FastAPI-based backend with RAG (Retrieval-Augmented Generation) system using OpenAI embeddings, FAISS vector search, and GPT for intelligent job recommendations.

---

## 🏗️ Architecture

```
job-assistant-backend/
├── main.py                       # FastAPI app & endpoints
└── rag/
    ├── __init__.py
    ├── embedder.py               # OpenAI embeddings
    ├── retriever.py              # FAISS search
    ├── build_index.py            # Index builder
    └── vector_index/
        ├── faiss.index           # Vector index
        └── faiss.meta.pkl        # Job metadata
```

---

## 🎯 API Endpoints

### 1. Browse Jobs - `GET /jobs`

List all jobs with pagination and search.

**Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Jobs per page (default: 10)
- `search` (optional): Keyword to filter by

**Example:**

```bash
GET /jobs?page=1&limit=10
GET /jobs?search=python
```

**Response:**

```json
{
  "results": [
    {
      "title": "Software Engineer",
      "company": "Expedia",
      "salary": "£60K-£75K",
      "tech_stack": ["Java", "Scala", "AWS"],
      "location": "London, UK",
      "description": "Build scalable travel tech...",
      "visa_sponsorship": "Unknown",
      "link": "https://glassdoor.com/..."
    }
  ],
  "total": 2500,
  "page": 1,
  "page_size": 10,
  "has_next": true
}
```

---

### 2. Chat (Smart Search) - `POST /chat`

AI-powered job search and recommendations.

**Body:**

```json
{
  "message": "Show me Python backend jobs at big companies",
  "user_memory": "Senior dev, 5 years experience",
  "return_all": false
}
```

**Response:**

```json
{
  "answer": "Here are the top Python backend jobs at established companies:\n\n1. **Senior Python Engineer** at Google...",
  "jobs": [
    {
      "title": "Senior Python Engineer",
      "company": "Google",
      "salary": "£80K-£100K",
      "tech_stack": ["Python", "Django", "GCP"],
      "location": "London, UK",
      "link": "https://..."
    }
  ],
  "total_matches": 20,
  "mode": "gpt"
}
```

**Modes:**

- `mode: "gpt"` - Full GPT analysis (when `return_all: false`)
- `mode: "fast"` - Only semantic search (when `return_all: true`)

---

### 3. System Stats - `GET /stats`

Get system statistics.

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

---

### 4. Save User Profile - `POST /user/profile`

Store user preferences.

**Body:**

```json
{
  "user_id": "john_doe",
  "preferences": {
    "tech_stack": ["Python", "AWS", "Docker"],
    "salary_min": 70000,
    "company_size": "large",
    "visa_required": false,
    "notes": "Senior backend developer"
  }
}
```

**Response:**

```json
{
  "status": "saved",
  "user_id": "john_doe"
}
```

---

### 5. Get User Profile - `GET /user/profile/{user_id}`

Retrieve user preferences.

**Response:**

```json
{
  "user_id": "john_doe",
  "preferences": {
    "tech_stack": ["Python", "AWS", "Docker"],
    "salary_min": 70000,
    "company_size": "large"
  }
}
```

---

## 🧠 RAG System

### 1. Embedder (`rag/embedder.py`)

Creates vector embeddings using OpenAI.

```python
from openai import OpenAI

class Embedder:
    def __init__(self, api_key: str):
        self.client = OpenAI(api_key=api_key)
        self.model = "text-embedding-3-small"

    def embed(self, text: str) -> list[float]:
        """Generate embedding for text"""
        response = self.client.embeddings.create(
            model=self.model,
            input=text
        )
        return response.data[0].embedding

    def embed_batch(self, texts: list[str]) -> list[list[float]]:
        """Generate embeddings for multiple texts"""
        response = self.client.embeddings.create(
            model=self.model,
            input=texts
        )
        return [item.embedding for item in response.data]
```

---

### 2. Retriever (`rag/retriever.py`)

Searches FAISS index for relevant jobs.

```python
import faiss
import pickle

class Retriever:
    def __init__(self, index_path: str, metadata_path: str):
        self.index = faiss.read_index(index_path)
        with open(metadata_path, 'rb') as f:
            self.metadata = pickle.load(f)

    def search(self, query_embedding: list[float], k: int = 20):
        """Find k nearest neighbors"""
        query_vector = np.array([query_embedding], dtype='float32')
        distances, indices = self.index.search(query_vector, k)

        results = []
        for idx in indices[0]:
            if idx < len(self.metadata):
                results.append(self.metadata[idx])

        return results
```

---

### 3. Index Builder (`rag/build_index.py`)

Builds FAISS index from job data.

```python
def build_index(jobs_dir: str, output_dir: str):
    """Build FAISS index from jobs_raw/ directory"""

    # Load all jobs
    jobs = []
    for file in os.listdir(jobs_dir):
        with open(f"{jobs_dir}/{file}") as f:
            jobs.append(json.load(f))

    # Create embeddings
    embedder = Embedder(api_key=os.getenv("OPENAI_API_KEY"))
    texts = []
    metadata = []

    for job in jobs:
        # Optimized text for embedding
        text = f"{job['title']} | {job['company']} | "
        text += f"{job.get('salary', 'N/A')} | "
        text += f"{', '.join(job.get('tech_stack', []))} | "
        text += job.get('description', '')[:200]

        texts.append(text)
        metadata.append({
            "title": job.get("title"),
            "company": job.get("company"),
            "salary": job.get("salary"),
            "tech_stack": job.get("tech_stack", []),
            "location": job.get("location"),
            "description": job.get("description", "")[:300],
            "visa_sponsorship": job.get("visa_sponsorship"),
            "link": job.get("link")
        })

    # Generate embeddings
    embeddings = embedder.embed_batch(texts)

    # Build FAISS index
    dimension = len(embeddings[0])
    index = faiss.IndexFlatL2(dimension)
    index.add(np.array(embeddings, dtype='float32'))

    # Save
    faiss.write_index(index, f"{output_dir}/faiss.index")
    with open(f"{output_dir}/faiss.meta.pkl", 'wb') as f:
        pickle.dump(metadata, f)
```

---

## ⚙️ Configuration

### Environment Variables

Create `.env` file:

```bash
OPENAI_API_KEY=sk-...
PORT=8000
```

### Main Configuration (`main.py`)

```python
# GPT Context Limit
MAX_GPT_CONTEXT_RESULTS = 20  # Only send top 20 to GPT

# Cache Configuration
@lru_cache(maxsize=128)
def cached_embed(text: str):
    return embedder.embed(text)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## 🚀 Performance Optimization

### 1. Smart GPT Limiting

Instead of sending all results to GPT:

```python
# Before: Send all 2500 jobs
context = "\n".join([job['description'] for job in all_jobs])
gpt_response = openai.chat.completions.create(
    messages=[{"role": "user", "content": context}]
)

# After: Send only top 20
top_results = retriever.search(query_embedding, k=20)
context = "\n".join([job['description'] for job in top_results])
gpt_response = openai.chat.completions.create(
    messages=[{"role": "user", "content": context}]
)
```

**Savings:** 99% reduction in tokens

---

### 2. LRU Caching

Cache embeddings for repeated queries:

```python
from functools import lru_cache

@lru_cache(maxsize=128)
def cached_embed(text: str) -> list[float]:
    return embedder.embed(text)
```

**Benefits:**

- 70%+ cache hit rate
- Instant responses for cached queries
- Automatic memory management

---

### 3. Rich Metadata Storage

Store everything in FAISS metadata:

```python
metadata = {
    "title": "Software Engineer",
    "company": "Google",
    "salary": "£80K-£100K",
    "tech_stack": ["Python", "Django"],
    "location": "London",
    "description": "...",
    "visa_sponsorship": "Yes",
    "link": "https://..."
}
```

**Benefits:**

- No separate database needed
- Fast retrieval (everything in memory)
- Easy to rebuild

---

## 🧪 Testing

### Run Test Suite

```bash
./test_endpoints.sh
```

### Manual Testing

```bash
# Health check
curl http://localhost:8000/stats

# Browse jobs
curl http://localhost:8000/jobs?page=1

# Search jobs
curl "http://localhost:8000/jobs?search=python"

# Chat
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Show me backend jobs"}'
```

---

## 📊 Monitoring

### Cache Hit Rate

```python
from functools import lru_cache

# Check cache stats
cache_info = cached_embed.cache_info()
hit_rate = cache_info.hits / (cache_info.hits + cache_info.misses)
print(f"Cache hit rate: {hit_rate:.1%}")
```

### Cost Tracking

```python
# Track tokens per request
completion = openai.chat.completions.create(...)
tokens_used = completion.usage.total_tokens
cost = tokens_used * 0.000002  # $0.002 per 1K tokens
```

---

## 🔒 Security

### API Key Management

- Store in `.env` file
- Never commit to git
- Use environment variables

### CORS Configuration

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",      # Development
        "https://yourdomain.com"      # Production
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Rate Limiting

```python
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter

@app.post("/chat")
@limiter.limit("10/minute")
async def chat(request: Request, body: ChatRequest):
    ...
```

---

## 📦 Dependencies

```txt
fastapi==0.104.1
uvicorn==0.24.0
openai==1.3.0
faiss-cpu==1.7.4
numpy==1.26.0
python-dotenv==1.0.0
pydantic==2.5.0
```

---

## 🐛 Debugging

### Enable Logging

```python
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@app.post("/chat")
async def chat(body: ChatRequest):
    logger.info(f"Received message: {body.message}")
    logger.info(f"Found {len(results)} matches")
    logger.info(f"Cache hit rate: {hit_rate:.1%}")
```

### Common Issues

**Index not found:**

```bash
./rebuild_index.sh
```

**OpenAI API error:**

```bash
# Check API key
echo $OPENAI_API_KEY
```

**Slow responses:**

```python
# Reduce GPT context
MAX_GPT_CONTEXT_RESULTS = 10  # Instead of 20
```

---

## ✅ Best Practices

1. **Keep GPT context small** - Only send necessary data
2. **Use caching** - Cache embeddings and responses
3. **Rich metadata** - Store everything in FAISS
4. **Error handling** - Graceful degradation
5. **Monitoring** - Track costs and performance
6. **Testing** - Automated test suite
7. **Documentation** - Keep API docs updated

---

## 🚀 Production Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for:

- Server setup
- Environment configuration
- Scaling strategies
- Monitoring tools

---

**Next**: See [DEPLOYMENT.md](DEPLOYMENT.md) for deployment guide
