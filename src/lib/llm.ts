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
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) throw new Error("Missing OPENROUTER_API_KEY");
  const model = process.env.MODEL; // set to Grok-4-fast ID in env
  if (!model) throw new Error("Missing MODEL");

  const body: any = {
    model,
    messages: system ? [{ role: "system", content: system }, ...messages] : messages,
    response_format: { type: "json_object" },
    temperature: 0.1,
  };
  
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
  
  if (!res.ok) throw new Error(`LLM ${res.status} ${await res.text()}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content;
}
