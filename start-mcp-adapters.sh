#!/bin/bash

# Start MCP adapters for Mapress
# This script starts the mock MCP adapters on the correct ports

echo "🚀 Starting MCP adapters for Mapress..."

# Kill any existing adapters
pkill -f "server-mock.mjs" 2>/dev/null || true

# Start fetch adapter
echo "📄 Starting fetch adapter on port 7071..."
cd infra/mcp-fetch-adapter
node server-mock.mjs &
FETCH_PID=$!

# Start search adapter
echo "🔍 Starting search adapter on port 7072..."
cd ../mcp-search-adapter
node server-mock.mjs &
SEARCH_PID=$!

# Wait a moment for servers to start
sleep 2

# Test the adapters
echo "🧪 Testing adapters..."

# Test fetch adapter
echo "Testing fetch adapter..."
FETCH_TEST=$(curl -s -X POST http://localhost:7071/fetch \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}' 2>/dev/null)

if [[ $FETCH_TEST == *"title"* ]]; then
  echo "✅ Fetch adapter working"
else
  echo "❌ Fetch adapter failed"
fi

# Test search adapter
echo "Testing search adapter..."
SEARCH_TEST=$(curl -s -X POST http://localhost:7072/search \
  -H "Content-Type: application/json" \
  -d '{"query": "AI regulation", "max": 3}' 2>/dev/null)

if [[ $SEARCH_TEST == *"urls"* ]]; then
  echo "✅ Search adapter working"
else
  echo "❌ Search adapter failed"
fi

echo ""
echo "🎉 MCP adapters are running!"
echo "  📄 Fetch adapter: http://localhost:7071/fetch (PID: $FETCH_PID)"
echo "  🔍 Search adapter: http://localhost:7072/search (PID: $SEARCH_PID)"
echo ""
echo "📝 To use with Mapress, set these environment variables:"
echo "  MCP_FETCH_URL=http://localhost:7071"
echo "  MCP_SEARCH_URL=http://localhost:7072"
echo ""
echo "🛑 To stop the adapters, run:"
echo "  kill $FETCH_PID $SEARCH_PID"
echo "  or: pkill -f 'server-mock.mjs'"
echo ""
echo "📖 For production setup with real MCP servers, see MCP_SETUP.md"
