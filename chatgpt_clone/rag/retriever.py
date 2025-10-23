# chatgpt_clone/rag/retriever.py
import faiss
import numpy as np
import pickle
import os

def save_faiss_index(index, path=None, metadata=None):
    if path is None:
        # Default path: two directories up from this script, then into vector_index
        base_dir = os.path.join(os.path.dirname(__file__), "..", "..")
        path = os.path.join(base_dir, "vector_index", "faiss.index")
    
    path = str(path)  # ✅ Ensure it's a string
    os.makedirs(os.path.dirname(path), exist_ok=True)  # ✅ Ensure directory exists

    faiss.write_index(index, path)

    meta_path = path.replace(".index", ".meta.pkl")
    with open(meta_path, "wb") as f:
        pickle.dump(metadata, f)


def load_faiss_index(path=None):
    if path is None:
        # Default path: two directories up from this script, then into vector_index
        base_dir = os.path.join(os.path.dirname(__file__), "..", "..")
        path = os.path.join(base_dir, "vector_index", "faiss.index")
    
    index = faiss.read_index(path)
    meta_path = path.replace(".index", ".meta.pkl")
    with open(meta_path, "rb") as f:
        metadata = pickle.load(f)
    return index, metadata

def create_faiss_index(vectors: list):
    dimension = len(vectors[0])
    index = faiss.IndexFlatL2(dimension)
    index.add(np.array(vectors).astype("float32"))
    return index
