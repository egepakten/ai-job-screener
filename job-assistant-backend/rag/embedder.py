# chatgpt_clone/rag/embedder.py
import os
import json
import openai
from dotenv import load_dotenv

load_dotenv()
openai_client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def embed_text(text: str) -> list:
    response = openai_client.embeddings.create(
        model="text-embedding-3-small",
        input=text
    )
    return response.data[0].embedding

def load_and_embed_jobs(jobs_folder="jobs_raw"):
    texts, metadata = [], []
    for filename in os.listdir(jobs_folder):
        if filename.endswith(".json"):
            with open(os.path.join(jobs_folder, filename)) as f:
                data = json.load(f)
                text = f"{data['title']} at {data['company']}: {data['description']}"
                texts.append(text)
                metadata.append({
                    "filename": filename,
                    "title": data.get("title"),
                    "company": data.get("company"),
                    "salary": data.get("salary"),
                })
    return texts, metadata
