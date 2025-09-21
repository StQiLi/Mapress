const OPENROUTER = "https://openrouter.ai/api/v1/chat/completions";

export const SYSTEM_OUTLINE_PROMPT = `
You create a citation-backed news outline from multiple articles.

OUTPUT RULES
- Produce 4–7 top-level CATEGORIES about the user's query (node = category).
- Under each category, list 1–4 FACTS with very short titles (<= 6 words).
- Each FACT must have 1–2 bullet points and EVERY bullet must be supported by at least one source URL from the provided set.
- Prefer facts corroborated by >=2 distinct sources; if conflicting information appears, keep separate facts with distinct citations.
- Keep depth <= 2 (category -> facts). Total nodes (categories + facts) <= MAX_NODES.
- Return VALID JSON matching the provided schema exactly. If data is insufficient, return fewer categories/facts; never invent URLs.

SCHEMA:
{
  "query": string,
  "generatedAt": string,
  "categories": [
    {
      "title": string,
      "facts": [
        {
          "title": string,
          "bullets": string[],
          "sources": [{ "url": string, "outlet"?: string, "quote"?: string }]
        }
      ],
      "sources"?: [{ "url": string, "outlet"?: string }]
    }
  ]
}`;

export const SYSTEM_NODE_DETAIL = `
Summarize the selected category or fact using ONLY the provided excerpts and URLs.
Output JSON:
{ "summary": string, "keyFacts": string[], "sources": [{ "url": string, "outlet"?: string, "quote"?: string }], "lastUpdated": string }
3–4 sentence neutral summary, then 3–5 key fact bullets. Do not invent URLs.`;

export async function callOpenRouterJSON(messages: any[], system?: string) {
  console.log("🤖 LLM Request starting...");
  
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) {
    console.error("❌ Missing OPENROUTER_API_KEY");
    throw new Error("Missing OPENROUTER_API_KEY");
  }
  
  const model = process.env.MODEL; // set to Grok-4-fast ID in env
  if (!model) {
    console.error("❌ Missing MODEL");
    throw new Error("Missing MODEL");
  }

  console.log("🔧 LLM Config:", { model, hasKey: !!key, systemLength: system?.length || 0, messagesCount: messages.length });

  const body: any = {
    model,
    messages: system ? [{ role: "system", content: system }, ...messages] : messages,
    response_format: { type: "json_object" },
    temperature: 0.1,
  };
  
  console.log("📤 Sending request to OpenRouter...");
  console.log("📤 Request body preview:", {
    model: body.model,
    messagesCount: body.messages.length,
    systemLength: body.messages[0]?.content?.length || 0,
    userContentLength: body.messages[1]?.content?.length || 0
  });
  
  const res = await fetch(OPENROUTER, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://mapress.local/",
      "X-Title": "Mapress",
    },
    body: JSON.stringify(body),
  });
  
  console.log("📥 LLM Response status:", res.status, res.statusText);
  
  if (!res.ok) {
    const errorText = await res.text();
    console.error("❌ LLM request failed:", res.status, errorText);
    throw new Error(`LLM ${res.status} ${errorText}`);
  }
  
  const data = await res.json();
  console.log("📋 LLM Response data:", {
    choices: data.choices?.length || 0,
    usage: data.usage,
    model: data.model
  });
  
  const content = data.choices?.[0]?.message?.content;
  console.log("✅ LLM Response content length:", content?.length || 0);
  console.log("📝 LLM Response preview:", content?.substring(0, 200) + "...");
  
  return content;
}
