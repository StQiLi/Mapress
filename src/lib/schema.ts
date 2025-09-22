import { z } from "zod";

// New schema for tool-calling system
export const Citation = z.object({
  url: z.string().url(),
  title: z.string().optional(),
  publishedAt: z.string().optional(),
});
export type Citation = z.infer<typeof Citation>;

export const MapNode = z.object({
  id: z.string(),
  title: z.string().max(100), // model-generated category/topic
  summary: z.string().max(2000), // More verbose summaries
  citations: z.array(Citation).min(1),
  children: z.array(z.string()).optional(),
  // Additional verbose fields
  keyPoints: z.array(z.string()).optional(),
  context: z.string().optional(),
  implications: z.string().optional(),
  relatedTopics: z.array(z.string()).optional(),
});
export type MapNode = z.infer<typeof MapNode>;

export const MapEdge = z.object({
  from: z.string(),
  to: z.string(),
  label: z.string().optional(),
});
export type MapEdge = z.infer<typeof MapEdge>;

export const MapResponse = z.object({
  topic: z.string(),
  generatedAt: z.string(), // ISO
  depth: z.number().min(1).max(3),
  nodes: z.record(z.string(), MapNode),
  edges: z.array(MapEdge),
});
export type MapResponse = z.infer<typeof MapResponse>;

// Request schema for /map endpoint
export const MapRequest = z.object({
  prompt: z.string().min(1),
  recencyDays: z.number().min(1).max(365).optional().default(7),
  maxSources: z.number().min(1).max(20).optional().default(8),
  depth: z.union([z.literal(1), z.literal(2), z.literal(3)]).optional().default(2),
});
export type MapRequest = z.infer<typeof MapRequest>;

// Legacy schemas (keeping for backward compatibility)
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
