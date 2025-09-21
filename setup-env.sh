#!/bin/bash

# Setup environment for Mapress with MCP adapters

echo "🔧 Setting up Mapress environment..."

# Create .env.local file
cat > .env.local << EOF
MCP_SEARCH_URL=http://localhost:7072
MCP_FETCH_URL=http://localhost:7071
MAX_URLS=8
MAX_NODES=16
MAX_TOKENS=2500
NEXT_PUBLIC_APP_NAME=Mapress
EOF

echo "✅ Created .env.local file"

# Check if MCP adapters are running
echo "🔍 Checking MCP adapters..."

FETCH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:7071/fetch -X POST -H "Content-Type: application/json" -d '{"url":"test"}' 2>/dev/null)
SEARCH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:7072/search -X POST -H "Content-Type: application/json" -d '{"query":"test"}' 2>/dev/null)

if [ "$FETCH_STATUS" = "200" ]; then
  echo "✅ Fetch adapter is running on port 7071"
else
  echo "❌ Fetch adapter not responding on port 7071"
  echo "   Run: ./start-mcp-adapters.sh"
fi

if [ "$SEARCH_STATUS" = "200" ]; then
  echo "✅ Search adapter is running on port 7072"
else
  echo "❌ Search adapter not responding on port 7072"
  echo "   Run: ./start-mcp-adapters.sh"
fi

echo ""
echo "🚀 Next steps:"
echo "1. Start MCP adapters: ./start-mcp-adapters.sh"
echo "2. Start Next.js: npm run dev"
echo "3. Open http://localhost:3000"
echo "4. Try a query like 'AI regulation this week'"
echo ""
echo "📝 Environment variables set:"
echo "   MCP_FETCH_URL=http://localhost:7071"
echo "   MCP_SEARCH_URL=http://localhost:7072"
