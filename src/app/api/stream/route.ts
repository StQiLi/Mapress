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

  const stream = new ReadableStream({
    async start(controller) {
      const send = (ev: any) => sseSend(controller, ev);
      try {
        send({ type: "status", step: "search" });

        let urls: string[] = [];
        if (mock) {
          const sample = (await import("@/test-fixtures/docs.sample.json")).default as any;
          urls = sample.docs.map((d: any) => d.url).slice(0, maxUrls);
        } else {
          urls = await mcpSearch(query, maxUrls);
        }
        send({ type: "sources", urls });

        send({ type: "status", step: "fetch" });
        const docs = [];
        if (mock) {
          const sample = (await import("@/test-fixtures/docs.sample.json")).default as any;
          for (const d of sample.docs.slice(0, maxUrls)) docs.push(d);
        } else {
          const tasks = urls.map(async (u) => {
            try { return await mcpFetch(u); } catch { return { title: u, markdown: "" }; }
          });
          const results = await Promise.all(tasks);
          results.forEach((r, i) => docs.push({ url: urls[i], title: r.title, markdown: r.markdown.slice(0, 1000) }));
        }

        send({ type: "status", step: "cluster" });
        const userContent =
          `QUERY: ${query}\n\nARTICLES:\n` +
          docs.map((d: any, i: number) => `[#${i + 1}] (${d.url})\n${d.markdown}`).join("\n\n");
        const raw = mock
          ? (await import("@/test-fixtures/outline.sample.json")).default
          : await callOpenRouterJSON([{ role: "user", content: userContent }], SYSTEM_OUTLINE_PROMPT);

        const outline: Outline = typeof raw === "string" ? JSON.parse(raw) : raw;
        outline.query = query;
        outline.generatedAt = nowIso();

        const pruned = pruneOutline(outline, maxNodes);
        send({ type: "partialOutline", categories: pruned.categories.map(c => ({ title: c.title })) });

        send({ type: "status", step: "layout" });
        const { nodes, edges } = outlineToGraph(pruned);
        // (Optional) elk layout can be client-side; keep server simple.
        send({ type: "graph", nodes, edges });

        send({ type: "status", step: "done" });
        controller.close();
      } catch (e: any) {
        sseSend(controller, { type: "error", message: e?.message || "unknown error" });
        controller.close();
      }
    }
  });

  return new Response(stream, { headers: { "Content-Type": "text/event-stream" } });
}
