# MCP Adapters Setup Guide

This guide explains how to set up the MCP (Model Context Protocol) adapters for Mapress.

## Quick Start (Mock Mode)

For development and testing, you can run mock adapters that simulate MCP functionality:

```bash
# Start mock adapters
./run-mcp-adapters.sh
```

This will start:
- Fetch adapter: http://localhost:7071/fetch
- Search adapter: http://localhost:7072/search

## Production Setup (Real MCP Servers)

### Prerequisites

1. **Docker** installed and running
2. **Docker Hub account** (for pulling MCP server images)
3. **API keys** for search providers (optional, depending on chosen MCP servers)

### Step 1: Docker Authentication

```bash
# Login to Docker Hub
docker login
```

### Step 2: Choose MCP Servers

#### Option A: Use Official MCP Servers

**Fetch Server:**
- Image: `mcp/fetch` (official)
- No API key required
- Handles web scraping and content extraction

**Search Server Options:**
- `mcp/brave-search` - Brave Search API
- `mcpcommunity/leehanchung-bing-search-mcp` - Bing Search
- `mcp/exa` - Exa AI (research-oriented)

#### Option B: Use Community Servers

Check the [MCP Community Catalog](https://github.com/modelcontextprotocol/servers) for more options.

### Step 3: Configure Environment

Create `.env.local` in your Mapress root:

```env
# MCP Adapter Endpoints
MCP_FETCH_URL=http://localhost:7071
MCP_SEARCH_URL=http://localhost:7072

# Optional: API keys for search providers
BING_API_KEY=your-bing-api-key
BRAVE_API_KEY=your-brave-api-key
```

### Step 4: Start MCP Adapters

```bash
# Build and start adapters
docker compose up -d --build

# Check status
docker compose ps

# View logs
docker compose logs -f
```

### Step 5: Test the Setup

```bash
# Test fetch adapter
curl -X POST http://localhost:7071/fetch \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'

# Test search adapter
curl -X POST http://localhost:7072/search \
  -H "Content-Type: application/json" \
  -d '{"query": "AI regulation", "max": 5}'
```

## Troubleshooting

### Common Issues

1. **Docker authentication errors**
   ```bash
   docker login
   docker pull node:20-alpine
   ```

2. **MCP server not found**
   - Check if the Docker image exists
   - Try alternative MCP server images
   - Use mock adapters for development

3. **API key issues**
   - Ensure API keys are set in environment
   - Check API key permissions
   - Try keyless MCP servers first

### Alternative: Use Mock Adapters

If you encounter issues with Docker or MCP servers, you can always fall back to mock adapters:

```bash
# Stop Docker containers
docker compose down

# Start mock adapters
./run-mcp-adapters.sh
```

## Architecture Overview

```
Mapress App
    ↓ HTTP
MCP Adapters (Express servers)
    ↓ STDIO
MCP Servers (Docker containers)
    ↓ API calls
External Services (Search APIs, Web scraping)
```

## MCP Server Images Reference

### Fetch Servers
- `mcp/fetch` - Official fetch server
- `mcpcommunity/fetch-server` - Community alternative

### Search Servers
- `mcp/brave-search` - Brave Search API
- `mcpcommunity/leehanchung-bing-search-mcp` - Bing Search
- `mcp/exa` - Exa AI search
- `mcpcommunity/duckduckgo-search` - DuckDuckGo (keyless)

### Combined Servers
- `mcp/exa` - Search + fetch in one server

## Development Workflow

1. **Start with mock adapters** for initial development
2. **Set up Docker environment** when ready for real MCP servers
3. **Configure API keys** for production search providers
4. **Test end-to-end** with real news queries
5. **Deploy to production** with proper MCP server configuration

## Production Deployment

For production deployment:

1. **Use container orchestration** (Kubernetes, Docker Swarm)
2. **Set up monitoring** for MCP adapter health
3. **Configure load balancing** for multiple adapter instances
4. **Implement retry logic** for MCP server failures
5. **Set up logging** for debugging MCP interactions

## Next Steps

Once MCP adapters are running:

1. Update your `.env.local` with the adapter URLs
2. Test the Mapress app with real MCP functionality
3. Monitor adapter logs for any issues
4. Scale adapters as needed for production load
