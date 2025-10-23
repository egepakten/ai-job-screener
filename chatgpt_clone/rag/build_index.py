# chatgpt_clone/rag/build_index.py

import os, json
from embedder import embed_text
from retriever import save_faiss_index, create_faiss_index

# Get the path to jobs_raw (two directories up from this script)
jobs_dir = os.path.join(os.path.dirname(__file__), "..", "..", "jobs_raw")
texts, metadata = [], []

print(f"📂 Loading jobs from: {jobs_dir}")

# Filter for JSON files only and sort them
json_files = sorted([f for f in os.listdir(jobs_dir) if f.endswith('.json')])
print(f"📄 Found {len(json_files)} JSON files")

for fname in json_files:
    try:
        with open(os.path.join(jobs_dir, fname)) as f:
            job = json.load(f)
            
            # 🎯 Extract and clean data
            title = job.get('title', 'Unknown Position')
            company = job.get('company', 'Unknown Company')
            salary = job.get('salary', 'Not specified')
            tech_stack = job.get('technologies', [])
            description = job.get('description', '')
            visa_sponsorship = job.get('visa_sponsorship', 'unknown')
            link = job.get('link', '')
            
            # Extract location from link or set default
            location = "London, UK"  # Default based on your Glassdoor link
            
            # Create short description (first 200 chars)
            short_description = description[:200] if description else "No description available"
            
            # 🧠 Create optimized embedding text (summarized, not full description)
            # This is what will be embedded - focused and concise
            embedding_text = f"{title} | {company} | {salary} | {', '.join(tech_stack[:5])} | {short_description}"
            
            texts.append(embedding_text)
            
            # 📦 Store RICH metadata (this won't be embedded, just stored for retrieval)
            metadata.append({
                "title": title,
                "company": company,
                "salary": salary,
                "tech_stack": tech_stack,
                "location": location,
                "description": short_description,
                "visa_sponsorship": visa_sponsorship,
                "link": link,
                "full_description": description  # Store full description for detail view
            })
            
            print(f"  ✓ Loaded: {fname} - {title} at {company}")
    except Exception as e:
        print(f"  ✗ Error loading {fname}: {e}")
        continue

print(f"\n🔢 Total jobs loaded: {len(texts)}")

# Embed all text
print("🧠 Embedding texts...")
print("   (Using optimized summary format: title | company | salary | tech_stack | short_description)")
vectors = [embed_text(t) for t in texts]

# Create FAISS index
print("🔍 Creating FAISS index...")
index = create_faiss_index(vectors)

# Save index and metadata
print("💾 Saving index and metadata...")
save_faiss_index(index, metadata=metadata)
print(f"✅ FAISS index and metadata saved with {len(texts)} jobs!")
print(f"📊 Metadata includes: title, company, salary, tech_stack, location, description, visa_sponsorship, link")
