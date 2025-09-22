// Simplified MCP Client using HTTP
export interface MCPToolResult {
  success: boolean;
  data?: any;
  error?: string;
  durationMs: number;
  bytes: number;
}

class MCPClient {
  private searchUrl: string;
  private fetchUrl: string;

  constructor() {
    this.searchUrl = process.env.MCP_SEARCH_URL || 'http://localhost:7072';
    this.fetchUrl = process.env.MCP_FETCH_URL || 'http://localhost:7071';
  }

  async searchNews(query: string, maxSources = 8, recencyDays = 7): Promise<MCPToolResult> {
    const startTime = Date.now();
    
    try {
      const response = await fetch(`${this.searchUrl}/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, max: maxSources })
      });

      if (!response.ok) {
        throw new Error(`Search failed: ${response.status}`);
      }

      const data = await response.json();
      const durationMs = Date.now() - startTime;
      
      return {
        success: true,
        data: data.urls || [],
        durationMs,
        bytes: JSON.stringify(data).length
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        durationMs: Date.now() - startTime,
        bytes: 0
      };
    }
  }

  async fetchAndParse(url: string): Promise<MCPToolResult> {
    const startTime = Date.now();
    
    try {
      const response = await fetch(`${this.fetchUrl}/fetch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });

      if (!response.ok) {
        throw new Error(`Fetch failed: ${response.status}`);
      }

      const data = await response.json();
      const durationMs = Date.now() - startTime;
      
      return {
        success: true,
        data: { title: data.title, content: data.markdown, url },
        durationMs,
        bytes: JSON.stringify(data).length
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        durationMs: Date.now() - startTime,
        bytes: 0
      };
    }
  }

  close() {
    // No cleanup needed for HTTP
  }
}

export async function mcpSearch(query: string, max = 8): Promise<string[]> {
  const SEARCH = process.env.MCP_SEARCH_URL;
  
  if (!SEARCH) {
    return [];
  }
  
  try {
    const r = await fetch(`${SEARCH}/search`, { 
      method: "POST", 
      headers: { "content-type": "application/json" }, 
      body: JSON.stringify({ query, max }) 
    });
    
    if (!r.ok) {
      throw new Error(`Search failed ${r.status}`);
    }
    
    const data = await r.json();
    return Array.isArray(data.urls) ? data.urls.slice(0, max) : [];
  } catch (error) {
    throw error;
  }
}

export async function mcpFetch(url: string): Promise<{ title: string; markdown: string }> {
  const FETCH = process.env.MCP_FETCH_URL;
  
  if (!FETCH) {
    throw new Error("MCP fetch not configured");
  }
  
  try {
    const r = await fetch(`${FETCH}/fetch`, { 
      method: "POST", 
      headers: { "content-type": "application/json" }, 
      body: JSON.stringify({ url }) 
    });
    
    if (!r.ok) {
      throw new Error(`Fetch failed ${r.status}`);
    }
    
    const data = await r.json();
    return { 
      title: data.title ?? url, 
      markdown: data.markdown ?? data.text ?? "" 
    };
  } catch (error) {
    throw error;
  }
}

export function createMCPClient(): MCPClient {
  return new MCPClient();
}
