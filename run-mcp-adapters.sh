#!/bin/bash

# Run MCP adapters locally for development/testing
# This script starts mock versions of the MCP adapters

echo "Starting MCP adapters..."

# Start fetch adapter
cd infra/mcp-fetch-adapter
node server-mock.mjs &
FETCH_PID=$!

# Start search adapter  
cd ../mcp-search-adapter
node server-mock.mjs &
SEARCH_PID=$!

echo "MCP adapters started:"
echo "  Fetch adapter: http://localhost:7071/fetch (PID: $FETCH_PID)"
echo "  Search adapter: http://localhost:7072/search (PID: $SEARCH_PID)"
echo ""
echo "To stop the adapters, run:"
echo "  kill $FETCH_PID $SEARCH_PID"
echo ""
echo "Or press Ctrl+C to stop this script"

# Wait for interrupt
trap "echo 'Stopping adapters...'; kill $FETCH_PID $SEARCH_PID; exit" INT
wait
