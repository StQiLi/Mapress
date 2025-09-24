import express from "express";

const app = express();
app.use(express.json());

// Health check endpoint (Render expects /healthz)
app.get("/healthz", (req, res) => {
  res.status(200).json({ status: "healthy", service: "mcp-fetch" });
});

// Also keep /health for compatibility
app.get("/health", (req, res) => {
  res.status(200).json({ status: "healthy", service: "mcp-fetch" });
});

// Simple fetch implementation using direct web scraping
async function fetchContent(url, maxLength = 12000) {
  try {
    console.log(`Fetching content from: ${url}`);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Mapress/1.0)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
      },
      timeout: 10000
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const html = await response.text();
    
    // Simple HTML to markdown conversion
    let markdown = html
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    // Extract title from HTML
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : new URL(url).hostname;
    
    // Truncate if too long
    if (markdown.length > maxLength) {
      markdown = markdown.substring(0, maxLength) + '...';
    }
    
    console.log(`Fetched ${markdown.length} characters from ${title}`);
    
    return {
      title,
      markdown
    };
  } catch (error) {
    console.error("Fetch error:", error);
    // Return fallback content
    return {
      title: new URL(url).hostname,
      markdown: `Content from ${url} could not be fetched. Error: ${error.message}`
    };
  }
}

app.post("/fetch", async (req, res) => {
  const { url } = req.body ?? {};
  if (!url) return res.status(400).json({ error: "url required" });
  
  try {
    console.log(`Fetching URL: ${url}`);
    const data = await fetchContent(url);
    res.json(data);
  } catch (e) {
    console.error("Fetch error:", e);
    res.status(500).json({ error: String(e) });
  }
});

const PORT = process.env.PORT || 8081;
app.listen(PORT, '0.0.0.0', () => console.log(`Fetch adapter on :${PORT}`));
