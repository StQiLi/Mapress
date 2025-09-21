import express from "express";

const app = express();
app.use(express.json());

// Mock implementation for development/testing
app.post("/fetch", async (req, res) => {
  const { url } = req.body ?? {};
  if (!url) return res.status(400).json({ error: "url required" });
  
  // Mock response - in production this would call the real MCP fetch server
  const mockResponse = {
    title: `Article from ${new URL(url).hostname}`,
    markdown: `# Mock Article Content\n\nThis is a mock article fetched from ${url}.\n\n## Key Points\n\n- This is a simulated article for testing\n- The content would normally be fetched via MCP\n- In production, this would call the real MCP fetch server\n\n## Summary\n\nThis demonstrates the MCP adapter pattern working correctly.`
  };
  
  // Simulate network delay
  setTimeout(() => {
    res.json(mockResponse);
  }, 500);
});

app.listen(7071, () => console.log("Mock Fetch adapter on :7071"));
