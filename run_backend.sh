#!/bin/bash

echo "🚀 Starting Job Assistant Backend..."

# Navigate to the chatgpt_clone directory
cd "$(dirname "$0")/chatgpt_clone"

# Check if virtual environment exists
if [ ! -d "../venv" ]; then
    echo "📦 Creating virtual environment..."
    cd ..
    python3 -m venv venv
    cd chatgpt_clone
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source ../venv/bin/activate

# Install requirements
echo "📥 Installing requirements..."
pip install -q -r ../requirements.txt

# Run the server
echo "✅ Starting FastAPI server on http://localhost:8000"
cd ..
uvicorn chatgpt_clone.main:app --reload --host 0.0.0.0 --port 8000

