import { z } from "zod";

export const SourceRef = z.object({
  url: z.string().url(),
  outlet: z.string().optional(),
  quote: z.string().max(240).optional(),
});
export type SourceRef = z.infer<typeof SourceRef>;

export const FactNode = z.object({
  title: z.string().max(60),
  bullets: z.array(z.string().max(140)).min(1).max(2),
  sources: z.array(SourceRef).min(1).max(3),
});
export type FactNode = z.infer<typeof FactNode>;

export const CategoryNode = z.object({
  title: z.string().max(60),
  facts: z.array(FactNode).min(1).max(4),
  sources: z.array(SourceRef).optional(),
});
export type CategoryNode = z.infer<typeof CategoryNode>;

export const Outline = z.object({
  query: z.string(),
  generatedAt: z.string(),
  categories: z.array(CategoryNode).min(3).max(7),
});
export type Outline = z.infer<typeof Outline>;

// React Flow graph
export type GraphNode = { 
  id: string; 
  type: "category" | "fact"; 
  data: any; 
  position: { x: number; y: number } 
};
export type GraphEdge = { 
  id: string; 
  source: string; 
  target: string 
};
