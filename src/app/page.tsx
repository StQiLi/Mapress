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
  const [mockMode, setMockMode] = useState(true);

  const handleGenerate = useCallback(async () => {
    if (!query.trim()) return;
    
    setIsLoading(true);
    setStatus("Starting...");
    setSources([]);
    setNodes([]);
    setEdges([]);
    setSelectedNode(null);

    try {
      const response = await fetch("/api/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          query: query.trim(), 
          mock: mockMode,
          maxUrls: 8,
          maxNodes: 16 
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              
              switch (data.type) {
                case "status":
                  setStatus(data.step);
                  break;
                case "sources":
                  setSources(data.urls);
                  break;
                case "partialOutline":
                  // Show categories as they're generated
                  break;
                case "graph":
                  setNodes(data.nodes);
                  setEdges(data.edges);
                  break;
                case "error":
                  throw new Error(data.message);
              }
            } catch (e) {
              console.error("Error parsing SSE data:", e);
            }
          }
        }
      }
    } catch (error) {
      console.error("Error generating map:", error);
      setStatus(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsLoading(false);
    }
  }, [query, mockMode]);

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Mapress</h1>
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={mockMode}
                onChange={(e) => setMockMode(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm text-gray-600">Mock Mode</span>
            </label>
          </div>
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
            onNodeSelect={setSelectedNode}
            isLoading={isLoading}
          />
        </div>

        {/* Sidebar */}
        {selectedNode && (
          <div className="w-80 border-l border-gray-200">
            <Sidebar node={selectedNode} />
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
