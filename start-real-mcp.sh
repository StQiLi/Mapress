#!/bin/bash

# Start real MCP adapters for Mapress
# This script starts real MCP adapters with actual web search and content fetching

echo "🚀 Starting REAL MCP adapters for Mapress..."

# Kill any existing adapters
pkill -f "server-mock.mjs" 2>/dev/null || true
pkill -f "server-real.mjs" 2>/dev/null || true

# Start real fetch adapter
echo "📄 Starting real fetch adapter on port 7071..."
cd infra/mcp-fetch-adapter
node server-real.mjs &
FETCH_PID=$!

# Start real search adapter
echo "🔍 Starting real search adapter on port 7072..."
cd ../mcp-search-adapter
node server-real.mjs &
SEARCH_PID=$!

# Wait a moment for servers to start
sleep 3

# Test the adapters
echo "🧪 Testing real adapters..."

# Test fetch adapter
echo "Testing fetch adapter..."
FETCH_TEST=$(curl -s -X POST http://localhost:7071/fetch \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}' 2>/dev/null)

if [[ $FETCH_TEST == *"title"* ]]; then
  echo "✅ Real fetch adapter working"
else
  echo "❌ Real fetch adapter failed"
  echo "Response: $FETCH_TEST"
fi

# Test search adapter
echo "Testing search adapter..."
SEARCH_TEST=$(curl -s -X POST http://localhost:7072/search \
  -H "Content-Type: application/json" \
  -d '{"query": "AI regulation", "max": 3}' 2>/dev/null)

if [[ $SEARCH_TEST == *"urls"* ]]; then
  echo "✅ Real search adapter working"
else
  echo "❌ Real search adapter failed"
  echo "Response: $SEARCH_TEST"
fi

echo ""
echo "🎉 REAL MCP adapters are running!"
echo "  📄 Fetch adapter: http://localhost:7071/fetch (PID: $FETCH_PID)"
echo "  🔍 Search adapter: http://localhost:7072/search (PID: $SEARCH_PID)"
echo ""
echo "📝 To use with Mapress, set these environment variables:"
echo "  MCP_FETCH_URL=http://localhost:7071"
echo "  MCP_SEARCH_URL=http://localhost:7072"
echo ""
echo "🛑 To stop the adapters, run:"
echo "  kill $FETCH_PID $SEARCH_PID"
echo "  or: pkill -f 'server-real.mjs'"
echo ""
echo "🔧 These adapters use:"
echo "  - DuckDuckGo API for search"
echo "  - Direct web scraping for content"
echo "  - No Docker required!"
