import { createMCPClient, MCPToolResult } from "./mcp";
import { 
  callOpenRouterWithTools, 
  SYSTEM_MAP_PROMPT, 
  MCP_TOOLS,
  LLMResponse,
  ToolCall,
  ToolResult 
} from "./llm";
import { MapResponse, MapRequest } from "./schema";
import { nowIso } from "./util";

export interface ToolCallLog {
  tool: string;
  argsHash: string;
  durationMs: number;
  ok: boolean;
  bytes: number;
}

export interface RequestLog {
  promptHash: string;
  model: string;
  toolIterations: number;
  totalTokens: number;
  durationMs: number;
}

export class GrokToolCalling {
  private mcpClient = createMCPClient();
  private maxIterations: number;
  private fetchMaxBytes: number;
  private fetchTimeoutMs: number;

  constructor() {
    this.maxIterations = parseInt(process.env.MAX_TOOL_ITERATIONS || "8");
    this.fetchMaxBytes = parseInt(process.env.FETCH_MAX_BYTES || "2000000");
    this.fetchTimeoutMs = parseInt(process.env.FETCH_TIMEOUT_MS || "12000");
  }

  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
  }

  private async executeToolCall(toolCall: ToolCall): Promise<ToolResult> {
    const args = JSON.parse(toolCall.function.arguments);
    let content: string;

    try {
      let result: MCPToolResult;
      
      switch (toolCall.function.name) {
        case "searchNews":
          result = await this.mcpClient.searchNews(
            args.query, 
            args.maxSources || 8, 
            args.recencyDays || 7
          );
          break;
        
        case "fetchAndParse":
          result = await this.mcpClient.fetchAndParse(args.url);
          break;
        
        default:
          throw new Error(`Unknown tool: ${toolCall.function.name}`);
      }

      content = result.success 
        ? JSON.stringify(result.data)
        : JSON.stringify({ error: result.error });

    } catch (error) {
      content = JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    return {
      tool_call_id: toolCall.id,
      role: "tool",
      content
    };
  }

  async generateMap(request: MapRequest): Promise<MapResponse> {
    const messages: any[] = [
      {
        role: "user",
        content: `Create a topic map for: "${request.prompt}". Use searchNews to find sources, then fetchAndParse to get content. Return JSON with nodes and edges.`
      }
    ];

    let iterations = 0;

    try {
      while (iterations < this.maxIterations) {
        const response: LLMResponse = await callOpenRouterWithTools(
          messages,
          MCP_TOOLS,
          SYSTEM_MAP_PROMPT
        );

        const message = response.choices[0]?.message;
        if (!message) {
          throw new Error("No message in LLM response");
        }

        if (message.tool_calls && message.tool_calls.length > 0) {
          messages.push({
            role: "assistant",
            content: message.content,
            tool_calls: message.tool_calls
          });

          const toolResults = await Promise.all(
            message.tool_calls.map(toolCall => this.executeToolCall(toolCall))
          );

          messages.push(...toolResults);
          iterations++;
        } else {
          let finalContent = message.content;
          if (!finalContent) {
            throw new Error("No content in final LLM response");
          }

          let mapData: any;
          try {
            mapData = JSON.parse(finalContent);
          } catch (parseError) {
            throw new Error("LLM response is not valid JSON");
          }

          const mapResponse: MapResponse = {
            topic: request.prompt,
            generatedAt: nowIso(),
            depth: request.depth || 2,
            nodes: mapData.nodes || {},
            edges: mapData.edges || []
          };

          this.mcpClient.close();
          return mapResponse;
        }
      }

      throw new Error(`Max tool iterations (${this.maxIterations}) reached without completion`);

    } catch (error) {
      this.mcpClient.close();
      throw error;
    }
  }

  async generateMapFallback(request: MapRequest): Promise<MapResponse> {
    const { mcpSearch, mcpFetch } = await import("./mcp");
    
    const urls = await mcpSearch(request.prompt, request.maxSources);
    
    const docs = [];
    for (const url of urls.slice(0, 5)) {
      try {
        const result = await mcpFetch(url);
        docs.push({
          url,
          title: result.title,
          content: result.markdown.slice(0, 2000)
        });
      } catch (fetchError) {
        // Skip failed fetches
      }
    }

    const { callOpenRouterJSON } = await import("./llm");
    
    const content = docs.map((d, i) => 
      `[${i + 1}] ${d.title} (${d.url})\n${d.content}`
    ).join("\n\n");

    const raw = await callOpenRouterJSON(
      [{ role: "user", content: `Create a topic map for: "${request.prompt}"\n\nSources:\n${content}` }],
      SYSTEM_MAP_PROMPT
    );

    const mapData = typeof raw === "string" ? JSON.parse(raw) : raw;
    
    return {
      topic: request.prompt,
      generatedAt: nowIso(),
      depth: request.depth || 2,
      nodes: mapData.nodes || {},
      edges: mapData.edges || []
    };
  }
}
