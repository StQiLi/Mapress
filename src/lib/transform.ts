import { Outline, CategoryNode, GraphEdge, GraphNode } from "./schema";

export function pruneOutline(outline: Outline, maxNodes: number): Outline {
  const cats = outline.categories.map(c => ({ ...c, facts: [...(c.facts||[])] }));
  let count = cats.length + cats.reduce((s,c)=>s+(c.facts?.length||0),0);
  if (count <= maxNodes) return { ...outline, categories: cats };

  type Scored = { ci:number; fi:number; score:number };
  const scored: Scored[] = [];
  cats.forEach((c,ci) => c.facts?.forEach((f,fi) => {
    const domains = new Set((f.sources||[]).map(s => { 
      try { 
        return new URL(s.url).hostname; 
      } catch { 
        return s.url; 
      } 
    }));
    scored.push({ ci, fi, score: domains.size });
  }));
  scored.sort((a,b)=>a.score - b.score); // prune least corroborated first
  for (const {ci,fi} of scored) {
    if (count <= maxNodes) break;
    cats[ci].facts.splice(fi,1);
    count--;
  }
  const filtered = cats.filter(c => (c.facts?.length||0) > 0);
  return { ...outline, categories: filtered };
}

export function outlineToGraph(outline: Outline): { nodes: GraphNode[]; edges: GraphEdge[] } {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];
  outline.categories.forEach((c, i) => {
    const catId = `cat-${i}`;
    nodes.push({ 
      id: catId, 
      type: "category", 
      data: { title: c.title, sources: c.sources || [] }, 
      position: { x: 0, y: i * 120 } 
    });
    (c.facts||[]).forEach((f, j) => {
      const factId = `cat-${i}-fact-${j}`;
      nodes.push({ 
        id: factId, 
        type: "fact", 
        data: { title: f.title, bullets: f.bullets, sources: f.sources }, 
        position: { x: 300, y: (i*120)+(j*90) } 
      });
      edges.push({ id: `e-${catId}-${factId}`, source: catId, target: factId });
    });
  });
  return { nodes, edges };
}
