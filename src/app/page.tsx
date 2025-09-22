"use client";

import { useState, useCallback } from "react";
import MapCanvas from "@/components/MapCanvas";
import Sidebar from "@/components/Sidebar";
import StatusBar from "@/components/StatusBar";
import ExportButtons from "@/components/ExportButtons";

export default function Home() {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [sources, setSources] = useState<string[]>([]);
  const [nodes, setNodes] = useState<any[]>([]);
  const [edges, setEdges] = useState<any[]>([]);
  const [selectedNode, setSelectedNode] = useState<any>(null);

  const handleNodeSelect = useCallback((node: any) => {
    // Toggle: if clicking the same node, deselect it
    if (selectedNode && selectedNode.id === node.id) {
      setSelectedNode(null);
    } else {
      setSelectedNode(node);
    }
  }, [selectedNode]);

  const handleGenerate = useCallback(async () => {
    if (!query.trim()) return;
    
    setIsLoading(true);
    setStatus("search");
    setSources([]);
    setNodes([]);
    setEdges([]);
    setSelectedNode(null);

    try {
      // Simulate progress steps
      setStatus("search");
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setStatus("fetch");
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setStatus("cluster");
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setStatus("layout");
      
      const response = await fetch("/api/map", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          prompt: query.trim(),
          recencyDays: 7,
          maxSources: 8,
          depth: 2
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Transform the new format to the old format for compatibility
      const transformedNodes = Object.values(data.nodes).map((node: any, index: number) => ({
        id: node.id,
        type: "category",
        position: { x: index * 250, y: index * 100 },
        data: {
          title: node.title,
          summary: node.summary,
          sources: node.citations || [],
          facts: [], // New format doesn't have nested facts
          // Pass through the new verbose fields
          keyPoints: node.keyPoints || [],
          context: node.context || "",
          implications: node.implications || "",
          relatedTopics: node.relatedTopics || []
        }
      }));

      const transformedEdges = data.edges.map((edge: any, index: number) => ({
        id: `edge-${index}`,
        source: edge.from,
        target: edge.to,
        label: edge.label || ""
      }));

      setNodes(transformedNodes);
      setEdges(transformedEdges);
      setStatus("done");
      
      // Extract sources from citations
      const allSources = Object.values(data.nodes).flatMap((node: any) => 
        (node.citations || []).map((citation: any) => citation.url)
      );
      setSources([...new Set(allSources)]);

    } catch (error) {
      console.error("Error generating map:", error);
      setStatus("error");
    } finally {
      setIsLoading(false);
    }
  }, [query]);

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Mapress</h1>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex space-x-4">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter your news query (e.g., 'AI regulation this week')"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
            />
            <button
              onClick={handleGenerate}
              disabled={isLoading || !query.trim()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Generating..." : "Generate Map"}
            </button>
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <StatusBar status={status} isLoading={isLoading} sources={sources} />

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Map Canvas */}
        <div className="flex-1">
          <MapCanvas
            nodes={nodes}
            edges={edges}
            onNodeSelect={handleNodeSelect}
            isLoading={isLoading}
          />
        </div>

        {/* Sidebar */}
        {selectedNode && (
          <div className="w-80 border-l border-gray-200">
            <Sidebar node={selectedNode} onClose={() => setSelectedNode(null)} />
          </div>
        )}
      </div>

      {/* Export Buttons */}
      {nodes.length > 0 && (
        <div className="bg-white border-t border-gray-200 p-4">
          <div className="max-w-7xl mx-auto">
            <ExportButtons nodes={nodes} edges={edges} />
          </div>
        </div>
      )}
    </div>
  );
}
