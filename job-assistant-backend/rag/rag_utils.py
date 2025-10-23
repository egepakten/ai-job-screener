# chatgpt_clone/rag/rag_utils.py
from .embedder import embed_text, load_and_embed_jobs
from .retriever import create_faiss_index, save_faiss_index

def build_vector_index():
    texts, metadata = load_and_embed_jobs()
    embeddings = [embed_text(t) for t in texts]
    index = create_faiss_index(embeddings)
    save_faiss_index(index, metadata)
    print("✅ Vector index built and saved.")
