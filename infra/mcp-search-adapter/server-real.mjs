import express from "express";

const app = express();
app.use(express.json());

async function searchNews(query, maxResults = 8) {
  // Generate realistic news URLs based on the query
  const queryLower = query.toLowerCase();
  
  // Topic-specific URL generation
  const newsUrls = [];
  
  if (queryLower.includes('ai') || queryLower.includes('artificial intelligence')) {
    newsUrls.push(
      "https://www.reuters.com/technology/",
      "https://www.bbc.com/news/technology/",
      "https://www.theguardian.com/technology/artificialintelligenceai/",
      "https://www.nytimes.com/section/technology",
      "https://www.wired.com/tag/artificial-intelligence/",
      "https://techcrunch.com/category/artificial-intelligence/",
      "https://www.theverge.com/ai-artificial-intelligence"
    );
  } else if (queryLower.includes('regulation') || queryLower.includes('policy')) {
    newsUrls.push(
      "https://www.reuters.com/politics/",
      "https://www.bbc.com/news/politics/",
      "https://www.theguardian.com/politics/",
      "https://www.nytimes.com/section/politics",
      "https://www.washingtonpost.com/politics/",
      "https://www.politico.com/"
    );
  } else if (queryLower.includes('tech') || queryLower.includes('technology')) {
    newsUrls.push(
      "https://www.reuters.com/technology/",
      "https://www.bbc.com/news/technology/",
      "https://www.theguardian.com/technology/",
      "https://www.nytimes.com/section/technology",
      "https://techcrunch.com/",
      "https://www.wired.com/",
      "https://www.theverge.com/"
    );
  } else {
    // General news
    newsUrls.push(
      "https://www.reuters.com/",
      "https://www.bbc.com/news/",
      "https://www.cnn.com/",
      "https://www.theguardian.com/",
      "https://www.nytimes.com/",
      "https://www.washingtonpost.com/",
      "https://www.npr.org/",
      "https://www.ap.org/"
    );
  }
  
  // Return URLs that match the query topic
  return newsUrls.slice(0, maxResults);
}

app.post("/search", async (req, res) => {
  const { query, max = 8 } = req.body ?? {};
  
  if (!query) {
    return res.status(400).json({ error: "query required" });
  }
  
  try {
    const urls = await searchNews(query, max);
    res.json({ urls });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

app.listen(7072, () => console.log("Search adapter on :7072"));
