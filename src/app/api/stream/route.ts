import { NextRequest } from "next/server";
import { sseSend } from "@/lib/sse";
import { Outline } from "@/lib/schema";
import { mcpSearch, mcpFetch } from "@/lib/mcp";
import { callOpenRouterJSON, SYSTEM_OUTLINE_PROMPT } from "@/lib/llm";
import { outlineToGraph, pruneOutline } from "@/lib/transform";
import { nowIso } from "@/lib/util";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const { query, maxUrls = Number(process.env.MAX_URLS || 8), maxNodes = Number(process.env.MAX_NODES || 16), mock } = await req.json();

  console.log("🚀 SSE Stream started:", { query, maxUrls, maxNodes, mock });
  console.log("🔧 Environment:", { 
    MCP_SEARCH_URL: process.env.MCP_SEARCH_URL, 
    MCP_FETCH_URL: process.env.MCP_FETCH_URL,
    OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY ? "SET" : "NOT SET",
    MODEL: process.env.MODEL
  });

  const stream = new ReadableStream({
    async start(controller) {
      const send = (ev: any) => {
        console.log("📤 SSE Event:", ev.type, ev.step || ev);
        sseSend(controller, ev);
      };
      try {
        send({ type: "status", step: "search" });

        let urls: string[] = [];
        if (mock) {
          console.log("🎭 Using mock data for search");
          const sample = (await import("@/test-fixtures/docs.sample.json")).default as any;
          urls = sample.docs.map((d: any) => d.url).slice(0, maxUrls);
          console.log("📄 Mock URLs found:", urls.length);
        } else {
          console.log("🔍 Calling MCP search with query:", query);
          try {
            urls = await mcpSearch(query, maxUrls);
            console.log("✅ MCP search returned:", urls.length, "URLs");
            console.log("📋 URLs:", urls);
          } catch (error) {
            console.error("❌ MCP search failed:", error);
            throw error;
          }
        }
        send({ type: "sources", urls });

        send({ type: "status", step: "fetch" });
        const docs = [];
        if (mock) {
          console.log("🎭 Using mock data for fetch");
          const sample = (await import("@/test-fixtures/docs.sample.json")).default as any;
          for (const d of sample.docs.slice(0, maxUrls)) docs.push(d);
          console.log("📄 Mock docs loaded:", docs.length);
        } else {
          console.log("📥 Fetching content for", urls.length, "URLs");
          const tasks = urls.map(async (u, index) => {
            console.log(`📄 Fetching ${index + 1}/${urls.length}: ${u}`);
            try { 
              const result = await mcpFetch(u);
              console.log(`✅ Fetched ${u}:`, result.title?.substring(0, 50) + "...");
              return result;
            } catch (error) {
              console.error(`❌ Failed to fetch ${u}:`, error);
              return { title: u, markdown: "" };
            }
          });
          const results = await Promise.all(tasks);
          results.forEach((r, i) => {
            const doc = { url: urls[i], title: r.title, markdown: r.markdown.slice(0, 1000) };
            docs.push(doc);
            console.log(`📋 Doc ${i + 1}: ${doc.title} (${doc.markdown.length} chars)`);
          });
        }

        send({ type: "status", step: "cluster" });
        const userContent =
          `QUERY: ${query}\n\nARTICLES:\n` +
          docs.map((d: any, i: number) => `[#${i + 1}] (${d.url})\n${d.markdown}`).join("\n\n");
        
        console.log("🧠 Clustering with LLM...");
        console.log("📝 User content length:", userContent.length, "characters");
        console.log("📋 Content preview:", userContent.substring(0, 200) + "...");
        
        const raw = mock
          ? (await import("@/test-fixtures/outline.sample.json")).default
          : await callOpenRouterJSON([{ role: "user", content: userContent }], SYSTEM_OUTLINE_PROMPT);
        
        console.log("🤖 LLM response type:", typeof raw);
        console.log("🤖 LLM response preview:", typeof raw === "string" ? raw.substring(0, 20000) : JSON.stringify(raw).substring(0, 20000) + "...");

        const outline: Outline = typeof raw === "string" ? JSON.parse(raw) : raw;
        outline.query = query;
        outline.generatedAt = nowIso();

        console.log("📊 Parsed outline:", {
          categories: outline.categories.length,
          totalFacts: outline.categories.reduce((sum, cat) => sum + (cat.facts?.length || 0), 0)
        });

        const pruned = pruneOutline(outline, maxNodes);
        console.log("✂️ Pruned outline:", {
          categories: pruned.categories.length,
          totalFacts: pruned.categories.reduce((sum, cat) => sum + (cat.facts?.length || 0), 0)
        });
        
        send({ type: "partialOutline", categories: pruned.categories.map(c => ({ title: c.title })) });

        send({ type: "status", step: "layout" });
        const { nodes, edges } = outlineToGraph(pruned);
        console.log("🗺️ Generated graph:", { nodes: nodes.length, edges: edges.length });
        console.log("📋 Nodes:", nodes.map(n => ({ id: n.id, type: n.type, title: n.data.title })));
        
        // (Optional) elk layout can be client-side; keep server simple.
        send({ type: "graph", nodes, edges });

        send({ type: "status", step: "done" });
        console.log("✅ Stream completed successfully");
        controller.close();
      } catch (e: any) {
        sseSend(controller, { type: "error", message: e?.message || "unknown error" });
        controller.close();
      }
    }
  });

  return new Response(stream, { headers: { "Content-Type": "text/event-stream" } });
}
