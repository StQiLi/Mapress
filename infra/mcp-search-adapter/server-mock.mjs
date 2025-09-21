import express from "express";

const app = express();
app.use(express.json());

// Mock implementation for development/testing
app.post("/search", async (req, res) => {
  const { query, max = 8 } = req.body ?? {};
  if (!query) return res.status(400).json({ error: "query required" });
  
  // Mock response - in production this would call the real MCP search server
  const mockUrls = [
    "https://www.reuters.com/technology/ai-regulation-eu-act-2024",
    "https://www.ft.com/content/ai-regulation-us-biden-executive-order",
    "https://www.bbc.com/news/technology/ai-regulation-china",
    "https://www.wsj.com/articles/ai-regulation-uk-white-paper",
    "https://www.cnn.com/2024/ai-regulation-canada-bill-c-27",
    "https://www.theguardian.com/technology/ai-regulation-australia-discussion-paper",
    "https://www.bloomberg.com/news/ai-regulation-japan-guidelines",
    "https://www.techcrunch.com/ai-regulation-india-draft-policy"
  ];
  
  // Simulate network delay
  setTimeout(() => {
    res.json({ urls: mockUrls.slice(0, max) });
  }, 300);
});

app.listen(7072, () => console.log("Mock Search adapter on :7072"));
