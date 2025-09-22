const OPENROUTER = "https://openrouter.ai/api/v1/chat/completions";

// Tool definitions for Grok
export const MCP_TOOLS = [
  {
    type: "function",
    function: {
      name: "searchNews",
      description: "Search for fresh, diverse news sources on a topic",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "Search query for news articles"
          },
          maxSources: {
            type: "number",
            description: "Maximum number of sources to return (default: 8)",
            default: 8
          },
          recencyDays: {
            type: "number", 
            description: "Maximum age of articles in days (default: 7)",
            default: 7
          }
        },
        required: ["query"]
      }
    }
  },
  {
    type: "function", 
    function: {
      name: "fetchAndParse",
      description: "Fetch and parse content from a URL",
      parameters: {
        type: "object",
        properties: {
          url: {
            type: "string",
            description: "URL to fetch and parse"
          }
        },
        required: ["url"]
      }
    }
  }
];

export const SYSTEM_MAP_PROMPT = `
You create comprehensive topic maps from news sources. Use searchNews to find sources, then fetchAndParse to get content.

Return JSON with this structure:
{
  "nodes": {
    "id1": {
      "id": "id1", 
      "title": "Category Name",
      "summary": "Detailed summary with comprehensive analysis and context (up to 2000 characters)",
      "citations": [{"url": "https://example.com", "title": "Article Title", "publishedAt": "2024-01-15"}],
      "keyPoints": ["Key point 1", "Key point 2", "Key point 3"],
      "context": "Historical context and background information",
      "implications": "What this means for the future and broader implications",
      "relatedTopics": ["Related topic 1", "Related topic 2"]
    }
  },
  "edges": [{"from": "id1", "to": "id2", "label": "Relationship description"}]
}

Requirements:
- 3-5 main categories with comprehensive analysis
- Each category needs multiple citations from diverse sources
- Summaries should be detailed, analytical, and provide context
- Include key points, context, implications, and related topics
- Use the tools to gather real content first
- Make connections between topics explicit with labeled edges
- Provide rich, verbose content that gives users deep insights`;

export const SYSTEM_OUTLINE_PROMPT = `
You create a citation-backed news outline from multiple articles.

OUTPUT RULES
- Produce 4–7 top-level CATEGORIES about the user's query (node = category).
- Under each category, list 1–4 FACTS with very short titles (<= 6 words).
- Each FACT must have 1–2 bullet points and EVERY bullet must be supported by at least one source URL from the provided set.
- Prefer facts corroborated by >=2 distinct sources; if conflicting information appears, keep separate facts with distinct citations.
- Keep depth <= 2 (category -> facts). Total nodes (categories + facts) <= MAX_NODES.
- Return VALID JSON matching the provided schema exactly. If data is insufficient, return fewer categories/facts; never invent URLs.

SCHEMA:
{
  "query": string,
  "generatedAt": string,
  "categories": [
    {
      "title": string,
      "facts": [
        {
          "title": string,
          "bullets": string[],
          "sources": [{ "url": string, "outlet"?: string, "quote"?: string }]
        }
      ],
      "sources"?: [{ "url": string, "outlet"?: string }]
    }
  ]
}`;

export const SYSTEM_NODE_DETAIL = `
Summarize the selected category or fact using ONLY the provided excerpts and URLs.
Output JSON:
{ "summary": string, "keyFacts": string[], "sources": [{ "url": string, "outlet"?: string, "quote"?: string }], "lastUpdated": string }
3–4 sentence neutral summary, then 3–5 key fact bullets. Do not invent URLs.`;

export interface ToolCall {
  id: string;
  type: "function";
  function: {
    name: string;
    arguments: string;
  };
}

export interface ToolResult {
  tool_call_id: string;
  role: "tool";
  content: string;
}

export interface LLMResponse {
  choices: Array<{
    message: {
      role: string;
      content?: string;
      tool_calls?: ToolCall[];
    };
    finish_reason?: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export async function callOpenRouterWithTools(
  messages: any[], 
  tools: any[] = MCP_TOOLS,
  system?: string
): Promise<LLMResponse> {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) {
    throw new Error("Missing OPENROUTER_API_KEY");
  }
  
  const model = process.env.MODEL;
  if (!model) {
    throw new Error("Missing MODEL");
  }

  const body: any = {
    model,
    messages: system ? [{ role: "system", content: system }, ...messages] : messages,
    tools,
    tool_choice: "auto",
    temperature: 0.1,
  };
  
  const res = await fetch(OPENROUTER, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://mapress.local/",
      "X-Title": "Mapress",
    },
    body: JSON.stringify(body),
  });
  
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`LLM ${res.status} ${errorText}`);
  }
  
  return await res.json();
}

export async function callOpenRouterJSON(messages: any[], system?: string) {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) {
    throw new Error("Missing OPENROUTER_API_KEY");
  }
  
  const model = process.env.MODEL;
  if (!model) {
    throw new Error("Missing MODEL");
  }

  const body: any = {
    model,
    messages: system ? [{ role: "system", content: system }, ...messages] : messages,
    response_format: { type: "json_object" },
    temperature: 0.1,
  };
  
  const res = await fetch(OPENROUTER, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://mapress.local/",
      "X-Title": "Mapress",
    },
    body: JSON.stringify(body),
  });
  
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`LLM ${res.status} ${errorText}`);
  }
  
  const data = await res.json();
  return data.choices?.[0]?.message?.content;
}
