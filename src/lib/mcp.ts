const SEARCH = process.env.MCP_SEARCH_URL;
const FETCH = process.env.MCP_FETCH_URL;

export async function mcpSearch(query: string, max = 8): Promise<string[]> {
  if (!SEARCH) return []; // mock mode or fallback handled upstream
  const r = await fetch(`${SEARCH}/search`, { 
    method: "POST", 
    headers: { "content-type": "application/json" }, 
    body: JSON.stringify({ query, max }) 
  });
  if (!r.ok) throw new Error(`MCP search failed ${r.status}`);
  const data = await r.json();
  return Array.isArray(data.urls) ? data.urls.slice(0, max) : [];
}

export async function mcpFetch(url: string): Promise<{ title: string; markdown: string }> {
  if (!FETCH) throw new Error("MCP fetch not configured");
  const r = await fetch(`${FETCH}/fetch`, { 
    method: "POST", 
    headers: { "content-type": "application/json" }, 
    body: JSON.stringify({ url }) 
  });
  if (!r.ok) throw new Error(`MCP fetch failed ${r.status}`);
  const data = await r.json();
  return { 
    title: data.title ?? url, 
    markdown: data.markdown ?? data.text ?? "" 
  };
}
