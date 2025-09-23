"use client";

import { useState, useCallback, useMemo } from "react";
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
  const [superCategories, setSuperCategories] = useState<any[]>([]);
  const [activeCategories, setActiveCategories] = useState<string[]>([]);

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
      
      // Debug: Log the raw data structure
      console.log("Raw API response:", data);
      console.log("Node IDs:", Object.keys(data.nodes));
      console.log("Edge references:", data.edges.map((e: any) => ({ from: e.from, to: e.to })));
      
      // Transform the new format to the old format for compatibility
      const nodeValues = Object.values(data.nodes);
      const centerX = 600;
      const centerY = 400;
      const radius = Math.max(300, nodeValues.length * 80);
      const angleStep = (2 * Math.PI) / nodeValues.length;
      
      const transformedNodes = nodeValues
        .filter((node: any) => node && node.id) // Filter out nodes without IDs
        .map((node: any, index: number) => {
          // Use a more systematic approach to prevent overlap
          const angle = index * angleStep;
          
          // Calculate base position on circle
          const baseX = centerX + radius * Math.cos(angle);
          const baseY = centerY + radius * Math.sin(angle);
          
          // Add controlled randomness that ensures minimum separation
          const randomOffsetX = (Math.random() - 0.5) * 300; // Increased spread
          const randomOffsetY = (Math.random() - 0.5) * 300; // Increased spread
          
          const position = { 
            x: baseX - 60 + randomOffsetX, // Center the node (120px width / 2 = 60px)
            y: baseY - 60 + randomOffsetY  // Center the node (120px height / 2 = 60px)
          };
          
          console.log(`Node ${node.id} positioned at:`, position, `(base: ${baseX}, ${baseY}, offset: ${randomOffsetX}, ${randomOffsetY})`);
          
          return {
            id: node.id,
            type: "category",
            position,
            draggable: true, // Explicitly set draggable
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
          };
        });

      // Filter out edges that reference non-existent nodes
      const validNodeIds = new Set(transformedNodes.map((node: any) => node.id));
      console.log("Valid node IDs:", Array.from(validNodeIds));
      
      const validEdges = data.edges.filter((edge: any) => {
        const isValid = validNodeIds.has(edge.from) && validNodeIds.has(edge.to);
        if (!isValid) {
          console.warn(`Invalid edge filtered out:`, edge);
        }
        return isValid;
      });
      
      console.log(`Filtered ${data.edges.length} edges down to ${validEdges.length} valid edges`);
      
      const transformedEdges = validEdges.map((edge: any, index: number) => ({
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

  const handleCategoryToggle = useCallback((categoryName: string) => {
    setActiveCategories(prev => {
      if (prev.includes(categoryName)) {
        // Remove category if already selected
        return prev.filter(cat => cat !== categoryName);
      } else {
        // Add category if not selected
        return [...prev, categoryName];
      }
    });
  }, []);

  const handleClearAllCategories = useCallback(() => {
    setActiveCategories([]);
  }, []);

  // Cluster nodes based on active categories
  const filteredNodes = useMemo(() => {
    if (activeCategories.length === 0) {
      console.log("Showing all nodes:", nodes.length);
      return nodes;
    }
    
    // Get nodes that match the active categories
    const matchingNodes = nodes.filter(node => {
      const nodeTopics = node.data.relatedTopics || [];
      return activeCategories.some(categoryName => nodeTopics.includes(categoryName));
    });
    
    if (matchingNodes.length === 0) {
      return [];
    }
    
    // Cluster nodes by category - arrange them in groups
    const clusteredNodes: any[] = [];
    let clusterIndex = 0;
    const clusterSpacing = 400; // Distance between clusters
    const nodeSpacing = 150; // Distance between nodes in same cluster
    
    activeCategories.forEach((categoryName, categoryIndex) => {
      const categoryNodes = matchingNodes.filter(node => {
        const nodeTopics = node.data.relatedTopics || [];
        return nodeTopics.includes(categoryName);
      });
      
      if (categoryNodes.length > 0) {
        // Position nodes in a cluster for this category
        const clusterX = 300 + (categoryIndex * clusterSpacing);
        const clusterY = 300;
        
        categoryNodes.forEach((node, nodeIndex) => {
          // Arrange nodes in a circle around the cluster center
          const angle = (nodeIndex / categoryNodes.length) * 2 * Math.PI;
          const radius = 120; // Distance from cluster center
          
          clusteredNodes.push({
            ...node,
            position: {
              x: clusterX + radius * Math.cos(angle) - 60, // Center the node (120px width / 2)
              y: clusterY + radius * Math.sin(angle) - 60  // Center the node (120px height / 2)
            }
          });
        });
      }
    });
    
    console.log(`Clustered ${clusteredNodes.length} nodes into ${activeCategories.length} categories`);
    return clusteredNodes;
  }, [nodes, activeCategories]);

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
      <div className="flex-1 relative">

        {/* Super Category Toggle Buttons - Floating Over Map */}
        <div className="absolute top-4 left-4 z-20 flex flex-wrap">
          {/* Category Buttons */}
          {[
            { name: "Technology", color: "bg-blue-600", hoverColor: "hover:bg-blue-700" },
            { name: "Politics", color: "bg-red-600", hoverColor: "hover:bg-red-700" },
            { name: "Economy", color: "bg-green-600", hoverColor: "hover:bg-green-700" },
            { name: "International", color: "bg-purple-600", hoverColor: "hover:bg-purple-700" },
            { name: "Society", color: "bg-yellow-600", hoverColor: "hover:bg-yellow-700" },
            { name: "Science", color: "bg-indigo-600", hoverColor: "hover:bg-indigo-700" }
          ].map((category) => {
            const isActive = activeCategories.includes(category.name);
            return (
              <button
                key={category.name}
                onClick={() => handleCategoryToggle(category.name)}
                className={`
                  px-4 py-2 text-sm font-semibold rounded-lg 
                  transition-all duration-300 ease-in-out
                  min-w-[100px] text-center mr-4 mb-2
                  ${isActive 
                    ? `${category.color} text-white shadow-lg transform scale-105` 
                    : 'bg-white text-gray-800 hover:bg-gray-100 hover:shadow-md'
                  }
                `}
                style={{
                  padding: '0.5rem 1rem',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  borderRadius: '0.5rem',
                  transition: 'all 0.3s ease-in-out',
                  minWidth: '100px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  backgroundColor: isActive 
                    ? (category.name === 'Technology' ? '#2563eb' : 
                       category.name === 'Politics' ? '#dc2626' :
                       category.name === 'Economy' ? '#16a34a' :
                       category.name === 'International' ? '#9333ea' :
                       category.name === 'Society' ? '#ca8a04' :
                       category.name === 'Science' ? '#4f46e5' : '#6b7280')
                    : 'white',
                  color: isActive ? 'white' : '#1f2937',
                  boxShadow: isActive ? '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  transform: isActive ? 'scale(1.05)' : 'scale(1)',
                  border: 'none'
                }}
              >
                {category.name}
              </button>
            );
          })}
          
          {/* Clear All Button */}
          {activeCategories.length > 0 && (
            <button
              onClick={handleClearAllCategories}
              className="px-4 py-2 text-sm font-semibold rounded-lg bg-gray-800 text-white hover:bg-gray-900 hover:shadow-lg transition-all duration-300 ease-in-out min-w-[100px] text-center mr-4 mb-2"
              style={{
                padding: '0.5rem 1rem',
                fontSize: '0.875rem',
                fontWeight: '600',
                borderRadius: '0.5rem',
                backgroundColor: '#1f2937',
                color: 'white',
                transition: 'all 0.3s ease-in-out',
                minWidth: '100px',
                textAlign: 'center',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
              }}
            >
              Clear All
            </button>
          )}
        </div>

        {/* Map Canvas */}
        <div className="flex-1 h-full">
          <MapCanvas
            nodes={filteredNodes}
            edges={edges}
            onNodeSelect={handleNodeSelect}
            isLoading={isLoading}
            selectedNodeId={selectedNode?.id}
            onSuperCategoriesChange={setSuperCategories}
          />
        </div>

        {/* Sidebar - Slides out from right, only covering graph area */}
        {selectedNode && (
          <div 
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              height: '100%',
              width: '384px',
              backgroundColor: '#ffffff',
              borderLeft: '1px solid #e5e7eb',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              zIndex: 50,
              transform: 'translateX(0)',
              transition: 'transform 300ms ease-in-out'
            }}
          >
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
