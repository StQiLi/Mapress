const SEARCH = process.env.MCP_SEARCH_URL;
const FETCH = process.env.MCP_FETCH_URL;

export async function mcpSearch(query: string, max = 8): Promise<string[]> {
  console.log("🔍 MCP Search request:", { query, max, SEARCH_URL: SEARCH });
  
  if (!SEARCH) {
    console.log("⚠️ No MCP_SEARCH_URL set, returning empty array");
    return []; // mock mode or fallback handled upstream
  }
  
  try {
    const requestBody = { query, max };
    console.log("📤 Sending request to:", `${SEARCH}/search`);
    console.log("📤 Request body:", requestBody);
    
    const r = await fetch(`${SEARCH}/search`, { 
      method: "POST", 
      headers: { "content-type": "application/json" }, 
      body: JSON.stringify(requestBody) 
    });
    
    console.log("📥 Response status:", r.status, r.statusText);
    
    if (!r.ok) {
      const errorText = await r.text();
      console.error("❌ MCP search failed:", r.status, errorText);
      throw new Error(`MCP search failed ${r.status}: ${errorText}`);
    }
    
    const data = await r.json();
    console.log("📋 MCP search response:", data);
    
    const urls = Array.isArray(data.urls) ? data.urls.slice(0, max) : [];
    console.log("✅ MCP search returning:", urls.length, "URLs");
    return urls;
  } catch (error) {
    console.error("❌ MCP search error:", error);
    throw error;
  }
}

export async function mcpFetch(url: string): Promise<{ title: string; markdown: string }> {
  console.log("📄 MCP Fetch request:", { url, FETCH_URL: FETCH });
  
  if (!FETCH) {
    console.error("❌ No MCP_FETCH_URL configured");
    throw new Error("MCP fetch not configured");
  }
  
  try {
    const requestBody = { url };
    console.log("📤 Sending request to:", `${FETCH}/fetch`);
    console.log("📤 Request body:", requestBody);
    
    const r = await fetch(`${FETCH}/fetch`, { 
      method: "POST", 
      headers: { "content-type": "application/json" }, 
      body: JSON.stringify(requestBody) 
    });
    
    console.log("📥 Response status:", r.status, r.statusText);
    
    if (!r.ok) {
      const errorText = await r.text();
      console.error("❌ MCP fetch failed:", r.status, errorText);
      throw new Error(`MCP fetch failed ${r.status}: ${errorText}`);
    }
    
    const data = await r.json();
    console.log("📋 MCP fetch response:", {
      title: data.title?.substring(0, 50) + "...",
      markdownLength: data.markdown?.length || 0
    });
    
    const result = { 
      title: data.title ?? url, 
      markdown: data.markdown ?? data.text ?? "" 
    };
    
    console.log("✅ MCP fetch returning:", {
      title: result.title.substring(0, 50) + "...",
      markdownLength: result.markdown.length
    });
    
    return result;
  } catch (error) {
    console.error("❌ MCP fetch error:", error);
    throw error;
  }
}
