import express from "express";
import { spawn } from "node:child_process";
import { McpClient } from "@modelcontextprotocol/sdk/client/mcp.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const BING_IMAGE = "mcpcommunity/leehanchung-bing-search-mcp";
const { BING_API_KEY } = process.env;

async function callSearchTool(query, max = 8) {
  const envPairs = [];
  if (BING_API_KEY) envPairs.push(`BING_API_KEY=${BING_API_KEY}`);

  const child = spawn(
    "docker",
    ["run", "-i", "--rm", ...envPairs.flatMap(e => ["-e", e]), BING_IMAGE],
    { stdio: ["pipe", "pipe", "inherit"] }
  );

  const transport = new StdioClientTransport({
    stdin: child.stdin,
    stdout: child.stdout
  });
  const client = new McpClient({ name: "mapress", version: "1.0.0" });

  try {
    await client.connect(transport);
    // Most search MCPs use a tool name like "search" (sometimes "web_search_*")
    const tools = await client.listTools();
    const toolName =
      tools.tools.find(t => /search/i.test(t.name))?.name ?? "search";
    const result = await client.callTool(toolName, { query, max_results: max });

    // Normalize to { urls: string[] }
    const urls = [];
    for (const c of result?.content ?? []) {
      if (c.type === "text") {
        try {
          const parsed = JSON.parse(c.text);
          if (Array.isArray(parsed.results)) {
            for (const r of parsed.results) if (r.url) urls.push(r.url);
          } else if (Array.isArray(parsed.urls)) {
            urls.push(...parsed.urls);
          }
        } catch {
          // fallback: collect http links from text
          const m = c.text.match(/https?:\/\/\S+/g);
          if (m) urls.push(...m);
        }
      }
    }
    return [...new Set(urls)];
  } finally {
    child.kill("SIGTERM");
  }
}

const app = express();
app.use(express.json());

app.post("/search", async (req, res) => {
  const { query, max = 8 } = req.body ?? {};
  if (!query) return res.status(400).json({ error: "query required" });
  try {
    const urls = await callSearchTool(query, max);
    res.json({ urls: urls.slice(0, max) });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

app.listen(3000, () => console.log("Search adapter on :3000"));
