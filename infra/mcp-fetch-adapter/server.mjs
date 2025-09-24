import express from "express";
import { spawn } from "node:child_process";
import { McpClient } from "@modelcontextprotocol/sdk/client/mcp.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

async function callFetchTool(url, maxLength = 12000) {
  // Use a known fetch MCP server image; stdio mode via `-i`
  const child = spawn("docker", ["run", "-i", "--rm", "mcp/fetch"], {
    stdio: ["pipe", "pipe", "inherit"],
  });

  const transport = new StdioClientTransport({
    stdin: child.stdin,
    stdout: child.stdout
  });
  const client = new McpClient({ name: "mapress", version: "1.0.0" });

  try {
    await client.connect(transport);
    const res = await client.callTool("fetch", { url, max_length: maxLength });
    const content = res?.content ?? [];
    const text = content.map(c => ("text" in c ? c.text : "")).join("");
    const title = (res?.meta && res.meta.title) || url;
    return { title, markdown: text };
  } finally {
    child.kill("SIGTERM");
  }
}

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

app.post("/fetch", async (req, res) => {
  const { url } = req.body ?? {};
  if (!url) return res.status(400).json({ error: "url required" });
  try {
    const data = await callFetchTool(url);
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

const PORT = process.env.PORT || 8081;
app.listen(PORT, '0.0.0.0', () => console.log(`Fetch adapter on :${PORT}`));
