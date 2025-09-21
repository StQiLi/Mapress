import express from "express";

const app = express();
app.use(express.json());

// Real fetch implementation using web scraping
async function fetchContent(url) {
  try {
    console.log("📄 Fetching content from:", url);
    
    // Use a simple fetch to get the content
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Mapress/1.0)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const html = await response.text();
    console.log("📥 Fetched HTML length:", html.length);
    
    // Simple HTML parsing to extract title and content
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : new URL(url).hostname;
    
    // Extract text content (simple approach)
    let text = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    // Limit text length
    const maxLength = 5000;
    if (text.length > maxLength) {
      text = text.substring(0, maxLength) + '...';
    }
    
    console.log("✅ Extracted content:", {
      title: title.substring(0, 50) + "...",
      textLength: text.length
    });
    
    return { title, markdown: text };
    
  } catch (error) {
    console.error("❌ Fetch failed for", url, ":", error);
    
    // Return fallback content
    return {
      title: `Article from ${new URL(url).hostname}`,
      markdown: `# Content from ${url}\n\nThis is a fallback response. The original content could not be fetched due to: ${error.message}\n\nURL: ${url}`
    };
  }
}

app.post("/fetch", async (req, res) => {
  const { url } = req.body ?? {};
  console.log("📄 Fetch request:", { url });
  
  if (!url) {
    console.log("❌ No URL provided");
    return res.status(400).json({ error: "url required" });
  }
  
  try {
    const result = await fetchContent(url);
    console.log("✅ Fetch completed:", {
      title: result.title.substring(0, 50) + "...",
      markdownLength: result.markdown.length
    });
    res.json(result);
  } catch (e) {
    console.error("❌ Fetch failed:", e);
    res.status(500).json({ error: String(e) });
  }
});

app.listen(7071, () => console.log("📄 Real Fetch adapter on :7071"));
