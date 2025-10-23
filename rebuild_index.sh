#!/bin/bash

# 🔨 Rebuild FAISS Index with Optimized Embeddings
# This script rebuilds the vector index with rich metadata

echo "🔄 Rebuilding FAISS index with optimized embeddings..."
echo ""

# Navigate to the rag directory
cd "$(dirname "$0")/chatgpt_clone/rag"

# Check if jobs_raw directory exists
if [ ! -d "../../jobs_raw" ]; then
    echo "❌ Error: jobs_raw directory not found!"
    echo "   Expected location: $(pwd)/../../jobs_raw"
    exit 1
fi

# Count job files
JOB_COUNT=$(ls -1 ../../jobs_raw/*.json 2>/dev/null | wc -l | tr -d ' ')
echo "📊 Found $JOB_COUNT job files in jobs_raw/"

if [ "$JOB_COUNT" -eq 0 ]; then
    echo "❌ No job files found! Please add JSON files to jobs_raw/"
    exit 1
fi

echo ""
echo "🚀 Starting index rebuild..."
echo "   This will:"
echo "   ✅ Load all jobs from jobs_raw/"
echo "   ✅ Create optimized embeddings (title | company | salary | tech | description)"
echo "   ✅ Store rich metadata (company, tech_stack, location, visa, etc.)"
echo "   ✅ Save to vector_index/"
echo ""

# Run the build script
python build_index.py

# Check if successful
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Index rebuild complete!"
    echo ""
    echo "📦 Generated files:"
    ls -lh ../../vector_index/
    echo ""
    echo "🎯 Next steps:"
    echo "   1. Start backend: ./run_backend.sh"
    echo "   2. Test endpoints:"
    echo "      - curl http://localhost:8000/jobs"
    echo "      - curl http://localhost:8000/stats"
    echo "      - curl -X POST http://localhost:8000/chat -H 'Content-Type: application/json' -d '{\"message\": \"Show me Python jobs\"}'"
else
    echo ""
    echo "❌ Index rebuild failed!"
    echo "   Check error messages above"
    exit 1
fi

