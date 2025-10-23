#!/bin/bash

# 🧪 Test All API Endpoints
# Run this after starting the backend to verify everything works

BASE_URL="http://localhost:8000"
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🧪 Testing Job Search API Endpoints"
echo "=================================="
echo ""

# Function to test endpoint
test_endpoint() {
    local name=$1
    local url=$2
    local method=$3
    local data=$4
    
    echo -n "Testing $name... "
    
    if [ "$method" = "POST" ]; then
        response=$(curl -s -w "\n%{http_code}" -X POST "$url" \
            -H "Content-Type: application/json" \
            -d "$data" 2>/dev/null)
    else
        response=$(curl -s -w "\n%{http_code}" "$url" 2>/dev/null)
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" = "200" ]; then
        echo -e "${GREEN}✓ PASSED${NC} (HTTP $http_code)"
        if [ ! -z "$5" ]; then
            echo "   Response preview: $(echo "$body" | jq -r "$5" 2>/dev/null || echo "$body" | head -c 100)"
        fi
    else
        echo -e "${RED}✗ FAILED${NC} (HTTP $http_code)"
        echo "   Response: $body"
    fi
    echo ""
}

# Check if server is running
echo "🔍 Checking if server is running..."
if ! curl -s "$BASE_URL/stats" > /dev/null 2>&1; then
    echo -e "${RED}❌ Server is not running!${NC}"
    echo ""
    echo "Please start the server first:"
    echo "   cd ai-job-screener"
    echo "   ./run_backend.sh"
    echo ""
    exit 1
fi
echo -e "${GREEN}✓ Server is running${NC}"
echo ""

# Test 1: Stats endpoint
echo "📊 Test 1: System Stats"
test_endpoint "GET /stats" "$BASE_URL/stats" "GET" "" ".total_jobs"

# Test 2: Jobs endpoint (first page)
echo "📋 Test 2: Get Jobs (Page 1)"
test_endpoint "GET /jobs?page=1&limit=5" "$BASE_URL/jobs?page=1&limit=5" "GET" "" ".results | length"

# Test 3: Jobs endpoint with search
echo "🔍 Test 3: Search Jobs"
test_endpoint "GET /jobs?search=software" "$BASE_URL/jobs?search=software&limit=5" "GET" "" ".results | length"

# Test 4: Chat endpoint (GPT mode)
echo "💬 Test 4: Chat (GPT Mode)"
test_endpoint "POST /chat" "$BASE_URL/chat" "POST" '{"message": "Show me software engineering jobs"}' ".mode"

# Test 5: Chat endpoint (Fast mode)
echo "⚡ Test 5: Chat (Fast Mode - No GPT)"
test_endpoint "POST /chat (fast)" "$BASE_URL/chat" "POST" '{"message": "Python jobs", "return_all": true}' ".mode"

# Test 6: Save user profile
echo "👤 Test 6: Save User Profile"
test_endpoint "POST /user/profile" "$BASE_URL/user/profile" "POST" '{
  "user_id": "test_user",
  "preferences": {
    "tech_stack": ["Python", "AWS"],
    "salary_min": 60000,
    "company_size": "large"
  }
}' ".status"

# Test 7: Get user profile
echo "👤 Test 7: Get User Profile"
test_endpoint "GET /user/profile/test_user" "$BASE_URL/user/profile/test_user" "GET" "" ".user_id"

# Test 8: Chat with user memory
echo "🧠 Test 8: Chat with User Memory"
test_endpoint "POST /chat (with memory)" "$BASE_URL/chat" "POST" '{
  "message": "Find suitable jobs for me",
  "user_memory": "Python developer, prefers AWS, looking for £60K+ at large companies"
}' ".mode"

# Test 9: Pagination (multiple pages)
echo "📄 Test 9: Jobs Pagination (Page 2)"
test_endpoint "GET /jobs?page=2" "$BASE_URL/jobs?page=2&limit=5" "GET" "" ".page"

# Summary
echo ""
echo "=================================="
echo "🎉 Testing Complete!"
echo ""
echo "📝 What to check next:"
echo "   1. Review the responses above"
echo "   2. Check that GPT mode returns an 'answer'"
echo "   3. Verify fast mode has mode: 'fast'"
echo "   4. Confirm user profile was saved"
echo ""
echo "💡 Manual tests you can try:"
echo "   # Get all stats"
echo "   curl $BASE_URL/stats | jq"
echo ""
echo "   # Browse jobs"
echo "   curl '$BASE_URL/jobs?page=1&limit=10' | jq '.results[] | {title, company, salary}'"
echo ""
echo "   # Search jobs"
echo "   curl '$BASE_URL/jobs?search=python' | jq"
echo ""
echo "   # Chat with GPT"
echo "   curl -X POST $BASE_URL/chat \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{\"message\": \"Show me Python backend jobs at big companies\"}' | jq"
echo ""

