# 🚀 Job Assistant AI - Quick Start Guide

A ChatGPT-style AI assistant for job search powered by GPT-4 and RAG (Retrieval Augmented Generation).

## 📋 Prerequisites

1. **Python 3.8+** and **Node.js 18+**
2. **OpenAI API Key** - Get one from [OpenAI Platform](https://platform.openai.com/api-keys)

## ⚙️ Setup

### 1. Configure Environment Variables

Create a `.env` file in the `chatgpt_clone/` directory:

```bash
cd chatgpt_clone
cat > .env << EOF
OPENAI_API_KEY=your_openai_api_key_here
EOF
cd ..
```

### 2. Build the FAISS Index (First Time Only)

```bash
cd chatgpt_clone/rag
python3 build_index.py
cd ../..
```

This will create a vector index from your job listings in `jobs_raw/`. You should see "✅ FAISS index and metadata saved." when complete.

## 🏃 Running the Application

### Option 1: Run Both Frontend & Backend Together

Open **two terminal windows**:

**Terminal 1 - Backend:**

```bash
chmod +x run_backend.sh
./run_backend.sh
```

**Terminal 2 - Frontend:**

```bash
chmod +x run_frontend.sh
./run_frontend.sh
```

### Option 2: Run Manually

**Backend:**

```bash
cd chatgpt_clone
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r ../requirements.txt
cd ..
uvicorn chatgpt_clone.main:app --reload --port 8000
```

**Frontend:**

```bash
cd job-assistant-frontend
npm install
npm run dev
```

## 🌐 Access the Application

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **API Docs:** http://localhost:8000/docs

## 🎯 Features

- ✨ ChatGPT-style conversational interface
- 🔍 AI-powered job search using RAG
- 💼 Context-aware responses based on actual job listings
- 🎨 Modern, responsive UI with dark mode
- 📱 Mobile-friendly design

## 📁 Project Structure

```
ai-job-screener/
├── chatgpt_clone/              # Backend (FastAPI + RAG)
│   ├── main.py                 # FastAPI app with CORS
│   ├── rag/                    # RAG implementation
│   │   ├── embedder.py         # Text embedding
│   │   ├── retriever.py        # FAISS retrieval
│   │   └── build_index.py      # Index builder
│   └── .env                    # API keys (create this)
├── job-assistant-frontend/     # Frontend (React + TypeScript)
│   ├── src/
│   │   ├── components/         # UI components
│   │   ├── pages/              # Page components
│   │   └── services/           # API integration
│   └── package.json
├── jobs_raw/                   # Job listings (JSON files)
├── vector_index/               # FAISS index (auto-generated)
└── requirements.txt            # Python dependencies
```

## 🐛 Troubleshooting

### Backend Issues

**Error: "No module named 'chatgpt_clone'"**

- Make sure you're running from the `ai-job-screener/` directory
- Use: `uvicorn chatgpt_clone.main:app` (not `python main.py`)

**Error: "No such file or directory: 'vector_index/faiss.index'"**

- Run the index builder first: `cd chatgpt_clone/rag && python3 build_index.py`

**CORS Errors:**

- Make sure the backend is running on port 8000
- Check that CORS middleware is enabled in `main.py`

### Frontend Issues

**Module not found errors:**

- Run `npm install` in the `job-assistant-frontend/` directory

**API connection failed:**

- Verify the backend is running on http://localhost:8000
- Check the browser console for detailed error messages

## 🔄 Adding New Jobs

1. Add new job JSON files to `jobs_raw/` directory
2. Rebuild the FAISS index: `cd chatgpt_clone/rag && python3 build_index.py && cd ../..`
3. Restart the backend server

## 📝 Example Job JSON Format

```json
{
  "title": "Senior Software Engineer",
  "company": "Tech Corp",
  "salary": "$120K - $180K",
  "description": "We are looking for an experienced engineer..."
}
```

## 🤝 Need Help?

- Check the API documentation at http://localhost:8000/docs
- Review the browser console for frontend errors
- Check the terminal logs for backend errors

## 🎉 Enjoy Your Job Assistant AI!

Ask questions like:

- "What job positions are available?"
- "Show me high paying jobs"
- "Tell me about remote positions"
- "What are the requirements for the software engineer role?"
