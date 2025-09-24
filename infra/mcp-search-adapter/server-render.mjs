import express from "express";

const app = express();
app.use(express.json());

// Health check endpoint (Render expects /healthz)
app.get("/healthz", (req, res) => {
  res.status(200).json({ status: "healthy", service: "mcp-search" });
});

// Also keep /health for compatibility
app.get("/health", (req, res) => {
  res.status(200).json({ status: "healthy", service: "mcp-search" });
});

// Simple search implementation using DuckDuckGo API
async function searchWeb(query, max = 8) {
  try {
    const response = await fetch(`https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`);
    const data = await response.json();
    
    const urls = [];
    
    // Extract URLs from results
    if (data.Results) {
      for (const result of data.Results.slice(0, max)) {
        if (result.FirstURL) {
          urls.push(result.FirstURL);
        }
      }
    }
    
    // Also try related topics
    if (data.RelatedTopics && urls.length < max) {
      for (const topic of data.RelatedTopics.slice(0, max - urls.length)) {
        if (topic.FirstURL) {
          urls.push(topic.FirstURL);
        }
      }
    }
    
    return [...new Set(urls)]; // Remove duplicates
  } catch (error) {
    console.error("Search error:", error);
    // Fallback to mock results
    return [
      `https://example.com/search?q=${encodeURIComponent(query)}`,
      `https://news.example.com/${encodeURIComponent(query)}`,
      `https://blog.example.com/${encodeURIComponent(query)}`
    ].slice(0, max);
  }
}

app.post("/search", async (req, res) => {
  const { query, max = 8 } = req.body ?? {};
  if (!query) return res.status(400).json({ error: "query required" });
  
  try {
    console.log(`Searching for: ${query} (max: ${max})`);
    const urls = await searchWeb(query, max);
    console.log(`Found ${urls.length} URLs:`, urls);
    res.json({ urls: urls.slice(0, max) });
  } catch (e) {
    console.error("Search error:", e);
    res.status(500).json({ error: String(e) });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => console.log(`Search adapter on :${PORT}`));
