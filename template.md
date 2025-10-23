ai-job-screener/
│
├── jobs_raw/ # Raw scraped job JSONs
├── embeddings/ # (Optional) saved vectors
├── app/
│ ├── ingest.py # Load jobs into vector DB
│ ├── ask.py # Semantic query + RAG
│ └── web.py # FastAPI app
│
├── utils/
│ ├── openai_client.js
│ └── chroma_client.py
│
├── .env # API keys
└── requirements.txt
