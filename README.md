# Mapress - News Mind Map Generator

A real-time, citation-backed news mind map generator that transforms news queries into interactive visualizations with source citations.

## What Mapress Does

Mapress takes a user prompt (e.g., "AI regulation this week") and:
1. **Searches** the web for relevant news articles
2. **Fetches** article content and extracts key information
3. **Clusters** information into categories and facts
4. **Renders** an interactive mind map with citations
5. **Streams** progress in real-time via Server-Sent Events

## Features

- 🧠 **Intelligent Clustering**: Automatically organizes news into logical categories
- 📊 **Interactive Mind Maps**: Built with React Flow for smooth interactions
- 🔗 **Source Citations**: Every fact backed by verifiable sources
- ⚡ **Real-time Streaming**: Watch the map build step-by-step
- 🎨 **Auto Layout**: Automatic graph layout with elkjs
- 📱 **Responsive Design**: Works on desktop and mobile
- 📤 **Export Options**: Download as PNG or JSON
- 🧪 **Mock Mode**: Test without API keys

## Tech Stack

- **Framework**: Next.js 15 (App Router) + TypeScript
- **UI**: React Flow + Tailwind CSS
- **Layout**: elkjs for automatic graph layout
- **LLM**: Grok-4-fast via OpenRouter
- **Streaming**: Server-Sent Events (SSE)
- **Deployment**: Vercel-ready

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Run in Mock Mode (No API Keys Required)

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and:
- Toggle "Mock Mode" to ON
- Enter a query like "AI regulation this week"
- Click "Generate Map"

### 3. Run with Live APIs

Create a `.env.local` file:

```env
OPENROUTER_API_KEY=sk-your-key-here
MODEL=xai/grok-2-mini
MCP_SEARCH_URL=http://localhost:8082
MCP_FETCH_URL=http://localhost:8081
MAX_URLS=8
MAX_NODES=16
MAX_TOKENS=2500
NEXT_PUBLIC_APP_NAME=Mapress
```

Then run:
```bash
npm run dev
```

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `OPENROUTER_API_KEY` | OpenRouter API key for LLM access | Required for live mode |
| `MODEL` | LLM model to use | `xai/grok-2-mini` |
| `MCP_SEARCH_URL` | MCP search service URL | Optional |
| `MCP_FETCH_URL` | MCP fetch service URL | Optional |
| `MAX_URLS` | Maximum URLs to fetch | `8` |
| `MAX_NODES` | Maximum nodes in graph | `16` |
| `MAX_TOKENS` | Maximum tokens for LLM | `2500` |

### Limits & Constraints

- **URLs**: Maximum 8 sources per query
- **Nodes**: Maximum 16 nodes in the mind map
- **Depth**: Maximum 2 levels (categories → facts)
- **Facts**: 1-2 bullet points per fact
- **Sources**: Every bullet must have at least one source URL

## API Endpoints

### `/api/stream` (POST)
Main SSE endpoint that orchestrates the entire process:
- Searches for URLs
- Fetches article content
- Clusters information with LLM
- Generates mind map layout
- Streams progress updates

**Request Body:**
```json
{
  "query": "AI regulation this week",
  "mock": true,
  "maxUrls": 8,
  "maxNodes": 16
}
```

**SSE Events:**
- `status`: Current processing step
- `sources`: Found URLs
- `partialOutline`: Categories as they're generated
- `graph`: Final nodes and edges
- `error`: Error messages

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Routes    │    │   External      │
│                 │    │                 │    │   Services      │
│ • React Flow    │◄──►│ • /api/stream   │◄──►│ • OpenRouter    │
│ • SSE Client    │    │ • SSE Events    │    │ • MCP Search    │
│ • Auto Layout   │    │ • Error Handle  │    │ • MCP Fetch     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Development

### Project Structure

```
src/
├── app/
│   ├── api/stream/route.ts    # SSE orchestrator
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Main page
├── components/
│   ├── MapCanvas.tsx         # React Flow canvas
│   ├── Sidebar.tsx           # Node details panel
│   ├── StatusBar.tsx         # Progress indicator
│   └── ExportButtons.tsx     # Export functionality
├── lib/
│   ├── schema.ts             # Zod schemas
│   ├── llm.ts                # OpenRouter client
│   ├── mcp.ts                # MCP clients
│   ├── transform.ts           # Graph transformation
│   ├── sse.ts                # SSE utilities
│   ├── sanitize.ts           # URL/HTML sanitization
│   └── util.ts               # Helper functions
└── test-fixtures/
    ├── docs.sample.json      # Mock articles
    ├── outline.sample.json   # Mock outline
    └── graph.sample.json     # Mock graph
```

### Key Components

1. **SSE Orchestrator** (`/api/stream`): Coordinates the entire pipeline
2. **React Flow Canvas**: Interactive mind map visualization
3. **Auto Layout**: Client-side graph layout with elkjs
4. **Source Citations**: Every fact backed by verifiable URLs
5. **Export System**: PNG and JSON export capabilities

## Deployment

### Vercel Deployment

1. **Connect Repository**: Link your GitHub repo to Vercel
2. **Set Environment Variables**: Add all required env vars
3. **Deploy**: Automatic deployment on push to main

### Environment Setup

```bash
# Production environment variables
OPENROUTER_API_KEY=sk-your-production-key
MODEL=xai/grok-2-mini
MAX_URLS=8
MAX_NODES=16
MAX_TOKENS=2500
NEXT_PUBLIC_APP_NAME=Mapress
```

## Demo Script (90 seconds)

1. **Start the app**: `npm run dev`
2. **Enable Mock Mode**: Toggle the checkbox
3. **Enter query**: "AI regulation this week"
4. **Watch progress**: See the status bar animate through steps
5. **Explore the map**: Click nodes to see details in sidebar
6. **Check citations**: Every fact has source URLs
7. **Export**: Download PNG or JSON
8. **Try live mode**: Add API keys and test with real data

## Troubleshooting

### Common Issues

1. **"Missing OPENROUTER_API_KEY"**: Add your API key to `.env.local`
2. **"MCP fetch not configured"**: Use mock mode or set up MCP services
3. **Layout issues**: Click "Auto Layout" button in the map
4. **Export fails**: Ensure the map is fully loaded before exporting

### Mock Mode

Mock mode works without any API keys and uses pre-defined sample data. Perfect for:
- Development and testing
- Demonstrations
- Understanding the interface

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test in both mock and live modes
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For issues and questions:
- Check the troubleshooting section
- Review the demo script
- Test in mock mode first
- Ensure all environment variables are set correctly