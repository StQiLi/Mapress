"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import {
  ReactFlow,
  Node,
  Edge,
  useNodesState,
  useEdgesState,
  ConnectionMode,
  NodeTypes,
  ReactFlowInstance,
} from "@reactflow/core";
import { Background } from "@reactflow/background";
import { Controls } from "@reactflow/controls";
import { generateSuperCategories, SuperCategory } from "@/lib/super-categories";
import "@reactflow/core/dist/style.css";
import "../styles/graph.css";
import ELK from "elkjs/lib/elk.bundled.js";
import * as d3 from "d3-force";

const elk = new ELK();

const nodeTypes: NodeTypes = {
  category: CategoryNode,
  fact: FactNode,
};

function CategoryNode({ data }: { data: any }) {
  // Get tri-color gradient based on related topics
  const getCategoryGradient = (relatedTopics: string[]) => {
    const colorMap = {
      "Technology": "#3b82f6",
      "Politics": "#ef4444", 
      "Economy": "#10b981",
      "International": "#8b5cf6",
      "Society": "#f59e0b",
      "Science": "#6366f1"
    };
    
    const colors = relatedTopics
      .filter(topic => colorMap[topic as keyof typeof colorMap])
      .map(topic => colorMap[topic as keyof typeof colorMap]);
    
    if (colors.length === 0) {
      return "#6b7280"; // Fallback color
    }
    
    if (colors.length === 1) {
      // Single color - create a subtle gradient
      const color = colors[0];
      return `linear-gradient(135deg, ${color}, ${color}dd, ${color}aa)`;
    }
    
    if (colors.length === 2) {
      // Two colors - create diagonal gradient
      return `linear-gradient(135deg, ${colors[0]}, ${colors[1]})`;
    }
    
    // Three or more colors - create tri-color gradient
    const color1 = colors[0];
    const color2 = colors[1] || colors[0];
    const color3 = colors[2] || colors[1] || colors[0];
    
    return `linear-gradient(135deg, ${color1} 0%, ${color2} 50%, ${color3} 100%)`;
  };

  const gradientStyle = getCategoryGradient(data.relatedTopics || []);
  
  return (
    <div 
      className="shadow-lg border-2 border-white/20 backdrop-blur-sm"
      style={{
        width: '120px',
        height: '120px',
        borderRadius: '50%',
        background: gradientStyle,
        color: 'white',
        fontSize: '12px',
        fontWeight: 'bold',
        textAlign: 'center',
        padding: '8px',
        lineHeight: '1.2',
        wordWrap: 'break-word',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textShadow: '0 1px 2px rgba(0,0,0,0.3)'
      }}
    >
      {data.title}
    </div>
  );
}

function FactNode({ data }: { data: any }) {
  // Get tri-color gradient based on related topics
  const getCategoryGradient = (relatedTopics: string[]) => {
    const colorMap = {
      "Technology": "#3b82f6",
      "Politics": "#ef4444", 
      "Economy": "#10b981",
      "International": "#8b5cf6",
      "Society": "#f59e0b",
      "Science": "#6366f1"
    };
    
    const colors = relatedTopics
      .filter(topic => colorMap[topic as keyof typeof colorMap])
      .map(topic => colorMap[topic as keyof typeof colorMap]);
    
    if (colors.length === 0) {
      return "#6b7280"; // Fallback color
    }
    
    if (colors.length === 1) {
      // Single color - create a subtle gradient
      const color = colors[0];
      return `linear-gradient(135deg, ${color}, ${color}dd, ${color}aa)`;
    }
    
    if (colors.length === 2) {
      // Two colors - create diagonal gradient
      return `linear-gradient(135deg, ${colors[0]}, ${colors[1]})`;
    }
    
    // Three or more colors - create tri-color gradient
    const color1 = colors[0];
    const color2 = colors[1] || colors[0];
    const color3 = colors[2] || colors[1] || colors[0];
    
    return `linear-gradient(135deg, ${color1} 0%, ${color2} 50%, ${color3} 100%)`;
  };

  const gradientStyle = getCategoryGradient(data.relatedTopics || []);
  
  return (
    <div 
      className="shadow-lg border-2 border-white/20 backdrop-blur-sm"
      style={{
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        background: gradientStyle,
        color: 'white',
        fontSize: '10px',
        fontWeight: 'semibold',
        textAlign: 'center',
        padding: '6px',
        lineHeight: '1.2',
        wordWrap: 'break-word',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textShadow: '0 1px 2px rgba(0,0,0,0.3)'
      }}
    >
      {data.title}
    </div>
  );
}

interface MapCanvasProps {
  nodes: any[];
  edges: any[];
  onNodeSelect: (node: any) => void;
  isLoading: boolean;
  selectedNodeId?: string;
  onSuperCategoriesChange?: (categories: SuperCategory[]) => void;
}

export default function MapCanvas({ nodes, edges, onNodeSelect, isLoading, selectedNodeId, onSuperCategoriesChange }: MapCanvasProps) {
  const [reactFlowNodes, setNodes, onNodesChange] = useNodesState([]);
  const [reactFlowEdges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isLayouting, setIsLayouting] = useState(false);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);

  const runLayout = useCallback(async () => {
    if (reactFlowNodes.length === 0) {
      return;
    }

    setIsLayouting(true);
    try {
      const graph = {
        id: "root",
        layoutOptions: {
          "elk.algorithm": "force",
          "elk.spacing.nodeNode": "150",
          "elk.spacing.edgeNode": "100",
          "elk.spacing.edgeEdge": "50",
          "elk.force.iterations": "300",
          "elk.force.repulsion": "1000",
          "elk.force.gravity": "0.1",
        },
        children: reactFlowNodes.filter(node => node && node.id).map((node) => ({
          id: node.id,
          width: node.type === 'category' ? 120 : 80,
          height: node.type === 'category' ? 120 : 80,
        })),
        edges: reactFlowEdges.map((edge) => ({
          id: edge.id,
          sources: [edge.source],
          targets: [edge.target],
        })),
      };

      const layoutedGraph = await elk.layout(graph);
      
      const layoutedNodes = reactFlowNodes.filter(node => node && node.id).map((node) => {
        const layoutedNode = layoutedGraph.children?.find((n) => n.id === node.id);
        return {
          ...node,
          position: {
            x: layoutedNode?.x || 0,
            y: layoutedNode?.y || 0,
          },
        };
      });

      setNodes(layoutedNodes);
    } catch (error) {
      console.error("Layout failed:", error);
      // Fallback: spread nodes in a circle to avoid overlapping
      const centerX = 400;
      const centerY = 300;
      const radius = Math.max(200, reactFlowNodes.length * 30);
      const angleStep = (2 * Math.PI) / reactFlowNodes.length;
      
      const fallbackNodes = reactFlowNodes.filter(node => node && node.id).map((node, index) => {
        const angle = index * angleStep;
        const nodeRadius = node.type === 'category' ? 60 : 40;
        return {
          ...node,
          position: {
            x: centerX + radius * Math.cos(angle) - nodeRadius,
            y: centerY + radius * Math.sin(angle) - nodeRadius,
          },
        };
      });
      setNodes(fallbackNodes);
    } finally {
      setIsLayouting(false);
    }
  }, [reactFlowNodes, reactFlowEdges, setNodes, setIsLayouting]);

  const handleGenerateSuperCategories = useCallback(() => {
    if (nodes.length === 0) return;
    
    const categories = generateSuperCategories(nodes);
    onSuperCategoriesChange?.(categories);
  }, [nodes, onSuperCategoriesChange]);

  const onNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    if (!node || !node.id) {
      console.warn("onNodeClick received invalid node:", node);
      return;
    }
    
    onNodeSelect(node);
    
    // Debug: Log node position
    console.log("Clicked node:", node.id, "Position:", node.position);
    
    // Simple zoom and center on click
    setTimeout(() => {
      if (reactFlowInstance && node.position) {
        console.log("Centering on clicked node:", node.id, node.position);
        reactFlowInstance.setCenter(node.position.x + 175, node.position.y + 100, {
          zoom: 2.0,
          duration: 600,
        });
      }
    }, 100);
  }, [onNodeSelect, reactFlowInstance]);

  // D3 force simulation for collision detection
  const simulation = useRef<d3.Simulation<any, undefined> | null>(null);
  const isDragging = useRef<string | null>(null);
  const isUpdatingFromSimulation = useRef<boolean>(false);

  // Initialize D3 force simulation
  const initializeSimulation = useCallback(() => {
    if (simulation.current) {
      simulation.current.stop();
    }

    // Convert React Flow nodes to D3 simulation format
    const d3Nodes = reactFlowNodes.map(node => ({
      id: node.id,
      x: node.position.x,
      y: node.position.y,
      type: node.type,
      fx: null,
      fy: null,
      vx: 0,
      vy: 0
    }));

    simulation.current = d3.forceSimulation(d3Nodes)
      .force("collision", d3.forceCollide()
        .radius((d: any) => d.type === 'category' ? 70 : 50) // Node radius + buffer
        .strength(0.8)
      )
      .force("center", d3.forceCenter(400, 300).strength(0.1))
      .force("charge", d3.forceManyBody().strength(-300))
      .on("tick", () => {
        // Update node positions from simulation without triggering re-renders
        if (simulation.current && !isUpdatingFromSimulation.current) {
          isUpdatingFromSimulation.current = true;
          const simNodes = simulation.current.nodes();
          
          setNodes(prevNodes => {
            const updatedNodes = prevNodes.map(node => {
              const simNode = simNodes.find((n: any) => n.id === node.id);
              if (simNode && simNode.id !== isDragging.current) {
                return {
                  ...node,
                  position: { x: simNode.x, y: simNode.y }
                };
              }
              return node;
            });
            
            // Only update if positions actually changed to prevent infinite loops
            const hasChanges = updatedNodes.some((node, index) => {
              const prevNode = prevNodes[index];
              return prevNode && (
                Math.abs(node.position.x - prevNode.position.x) > 0.1 ||
                Math.abs(node.position.y - prevNode.position.y) > 0.1
              );
            });
            
            return hasChanges ? updatedNodes : prevNodes;
          });
          
          // Reset flag after a brief delay
          setTimeout(() => {
            isUpdatingFromSimulation.current = false;
          }, 10);
        }
      });
  }, [reactFlowNodes, setNodes]);

  // Update simulation when nodes change (but avoid infinite loops)
  useEffect(() => {
    if (reactFlowNodes.length > 0 && simulation.current && !isDragging.current && !isUpdatingFromSimulation.current) {
      const d3Nodes = reactFlowNodes.map(node => ({
        id: node.id,
        x: node.position.x,
        y: node.position.y,
        type: node.type,
        fx: null,
        fy: null,
        vx: 0,
        vy: 0
      }));
      simulation.current.nodes(d3Nodes);
      // Only restart if not already running
      if (simulation.current.alpha() < 0.1) {
        simulation.current.alpha(0.3).restart();
      }
    }
  }, [reactFlowNodes.length]); // Only depend on length, not the full nodes array

  // Simple collision detection without physics simulation
  const handleSimpleCollision = useCallback((draggedNode: Node) => {
    if (!draggedNode || !draggedNode.id) return;

    const minDistance = 140; // Minimum distance between nodes
    let hasCollisions = false;
    
    const updatedNodes = reactFlowNodes.map(node => {
      if (node.id === draggedNode.id) return node;
      
      const dx = draggedNode.position.x - node.position.x;
      const dy = draggedNode.position.y - node.position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // If nodes are too close, push the other node away
      if (distance < minDistance && distance > 0) {
        hasCollisions = true;
        const pushDistance = minDistance - distance;
        const pushX = (dx / distance) * pushDistance * 0.5; // Gentle push
        const pushY = (dy / distance) * pushDistance * 0.5; // Gentle push
        
        return {
          ...node,
          position: {
            x: node.position.x - pushX,
            y: node.position.y - pushY,
          },
        };
      }
      
      return node;
    });
    
    // Only update if there were collisions to prevent infinite loops
    if (hasCollisions) {
      setNodes(updatedNodes);
      console.log("Simple collision detected for node:", draggedNode.id);
    }
  }, [reactFlowNodes, setNodes]);

  // Handle node drag with simple collision detection
  const onNodeDrag = useCallback((_event: React.MouseEvent, node: Node) => {
    if (!node || !node.id) return;
    
    // Add visual feedback for dragging node
    const nodeElement = document.querySelector(`[data-id="${node.id}"]`);
    if (nodeElement && !nodeElement.classList.contains('dragging')) {
      nodeElement.classList.add('dragging');
    }
    
    // Use simple collision detection
    handleSimpleCollision(node);
  }, [handleSimpleCollision]);

  // Handle node drag start
  const onNodeDragStart = useCallback((_event: React.MouseEvent, node: Node) => {
    if (!node || !node.id) return;
    console.log("Started dragging node:", node.id);
    
    // Mark as dragging
    isDragging.current = node.id;
  }, []);

  // Handle node drag end
  const onNodeDragStop = useCallback((_event: React.MouseEvent, node: Node) => {
    if (!node || !node.id) return;
    
    console.log("Drag stopped for node:", node.id, "at position:", node.position);
    
    // Remove dragging visual feedback
    const nodeElement = document.querySelector(`[data-id="${node.id}"]`);
    if (nodeElement) {
      nodeElement.classList.remove('dragging');
    }
    
    // Clear dragging state
    isDragging.current = null;
  }, []);

  // Let ReactFlow handle dragging naturally - no custom handlers needed

  // Update nodes and edges when props change
  useEffect(() => {
    const validNodes = nodes.filter(n => n && n.id);
    console.log("MapCanvas received nodes:", validNodes.length, validNodes.map(n => ({ id: n.id, position: n.position })));
    if (validNodes.length > 0) {
      // Preserve existing positions when updating nodes
      setNodes(prevNodes => {
        const nodeMap = new Map(prevNodes.map(node => [node.id, node]));
        return validNodes.map(node => {
          const existingNode = nodeMap.get(node.id);
          if (existingNode) {
            // Keep existing position if node already exists
            return {
              ...node,
              position: existingNode.position
            };
          }
          // Use original position for new nodes
          return node;
        });
      });
      
      // Generate enhanced edges based on shared categories
      const enhancedEdges = generateEnhancedEdges(validNodes, edges);
      console.log("Setting edges:", enhancedEdges);
      setEdges(enhancedEdges);
      
      // Skip physics simulation for now to avoid infinite loops
      // setTimeout(() => {
      //   initializeSimulation();
      // }, 100);
    }
  }, [nodes, edges, setNodes, setEdges]);

  // Cleanup simulation on unmount
  useEffect(() => {
    return () => {
      if (simulation.current) {
        simulation.current.stop();
      }
    };
  }, []);

  // Check if nodes are overlapping
  const checkForOverlappingNodes = (nodes: any[]) => {
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const node1 = nodes[i];
        const node2 = nodes[j];
        const dx = node1.position.x - node2.position.x;
        const dy = node1.position.y - node2.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Calculate actual node sizes (category nodes are 120px, fact nodes are 80px)
        const node1Radius = node1.type === 'category' ? 60 : 40;
        const node2Radius = node2.type === 'category' ? 60 : 40;
        const minDistance = node1Radius + node2Radius + 20; // 20px buffer
        
        if (distance < minDistance) {
          return true;
        }
      }
    }
    return false;
  };

  // Generate enhanced edges that connect ALL nodes with shared super categories
  const generateEnhancedEdges = (nodes: any[], originalEdges: any[]) => {
    // Filter out invalid edges from original edges
    const validOriginalEdges = originalEdges.filter(edge => {
      const isValid = edge && 
                     edge.source && 
                     edge.target && 
                     typeof edge.source === 'string' && 
                     typeof edge.target === 'string' &&
                     edge.source.length > 0 && 
                     edge.target.length > 0;
      
      if (!isValid) {
        console.warn("Filtering out invalid original edge:", edge);
      }
      return isValid;
    });
    
    const newEdges = [...validOriginalEdges];
    const processedPairs = new Set<string>();
    let edgesAdded = 0;

    console.log("Generating enhanced edges for nodes:", nodes.map(n => ({ id: n.id, topics: n.data.relatedTopics })));

    // Connect ALL nodes that share ANY super category
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const node1 = nodes[i];
        const node2 = nodes[j];
        const pairKey = `${node1.id}-${node2.id}`;
        const reversePairKey = `${node2.id}-${node1.id}`;
        
        if (processedPairs.has(pairKey) || processedPairs.has(reversePairKey)) {
          continue;
        }

        const sharedCategories = getSharedCategories(node1, node2);
        console.log(`Checking ${node1.id} vs ${node2.id}:`, {
          node1Topics: node1.data.relatedTopics,
          node2Topics: node2.data.relatedTopics,
          sharedCategories
        });

        if (sharedCategories.length > 0 && node1.id && node2.id && node1.id !== node2.id) {
          const edgeId = `category-${node1.id}-${node2.id}`;
          const color = getCategoryColor(sharedCategories[0]);
          
          // Validate that both nodes exist and have valid IDs
          if (typeof node1.id === 'string' && typeof node2.id === 'string' && 
              node1.id.length > 0 && node2.id.length > 0) {
            
            newEdges.push({
              id: edgeId,
              source: node1.id,
              target: node2.id,
              type: 'smoothstep',
              style: { 
                strokeWidth: 3, 
                stroke: color,
                strokeDasharray: '5,5'
              },
              label: sharedCategories[0],
              labelStyle: { 
                fontSize: 10, 
                fill: color,
                fontWeight: 'bold'
              }
            });
          } else {
            console.warn("Skipping edge creation - invalid node IDs:", {
              node1Id: node1.id,
              node2Id: node2.id,
              node1Type: typeof node1.id,
              node2Type: typeof node2.id
            });
          }
          
          processedPairs.add(pairKey);
          edgesAdded++;
          console.log(`Added edge between ${node1.id} and ${node2.id} for category: ${sharedCategories[0]}`);
        }
      }
    }

    console.log(`Generated ${edgesAdded} enhanced edges. Total edges: ${newEdges.length}`);
    return newEdges;
  };

  // Get shared categories between two nodes
  const getSharedCategories = (node1: any, node2: any) => {
    const topics1 = node1.data.relatedTopics || [];
    const topics2 = node2.data.relatedTopics || [];
    return topics1.filter((topic: string) => topics2.includes(topic));
  };

  // Get color for category
  const getCategoryColor = (category: string) => {
    const colorMap: { [key: string]: string } = {
      "Technology": "#3b82f6",
      "Politics": "#ef4444", 
      "Economy": "#10b981",
      "International": "#8b5cf6",
      "Society": "#f59e0b",
      "Science": "#6366f1"
    };
    return colorMap[category] || "#6b7280";
  };

  // Center on selected node when it changes
  useEffect(() => {
    if (selectedNodeId && reactFlowInstance) {
      // Find the actual node in the current nodes
      // No automatic centering when node is selected
    }
  }, [selectedNodeId, reactFlowInstance, reactFlowNodes]);

  return (
    <div className="h-full relative">
      <ReactFlow
        nodes={reactFlowNodes}
        edges={reactFlowEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        onNodeDragStart={onNodeDragStart}
        onNodeDrag={onNodeDrag}
        onNodeDragStop={onNodeDragStop}
        onInit={setReactFlowInstance}
        connectionMode={ConnectionMode.Loose}
        nodeTypes={nodeTypes}
        fitView={false}
        fitViewOptions={{ padding: 0.1 }}
        defaultEdgeOptions={{
          style: { strokeWidth: 4, stroke: '#ef4444' },
          type: 'smoothstep',
        }}
        nodesDraggable={true}
        nodesConnectable={false}
        elementsSelectable={true}
        panOnDrag={[1, 2]} // Only pan with middle mouse button and right click
        selectNodesOnDrag={false}
        panOnScroll={true}
        zoomOnScroll={true}
      >
        <Background 
          gap={20} 
          size={1} 
          color="#cbd5e1"
          style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}
        />
        <Controls showInteractive={false} showZoom={false} showFitView={false}>
          <button
            onClick={runLayout}
            disabled={isLayouting || reactFlowNodes.length === 0}
            className="px-4 py-2 text-sm font-semibold rounded-lg bg-white text-gray-800 hover:bg-gray-100 hover:shadow-md transition-all duration-300 ease-in-out min-w-[100px] text-center mr-2"
            style={{
              padding: '0.5rem 1rem',
              fontSize: '0.875rem',
              fontWeight: '600',
              borderRadius: '0.5rem',
              backgroundColor: 'white',
              color: '#1f2937',
              transition: 'all 0.3s ease-in-out',
              minWidth: '100px',
              textAlign: 'center',
              cursor: 'pointer',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              border: 'none',
              opacity: (isLayouting || reactFlowNodes.length === 0) ? 0.5 : 1
            }}
          >
            {isLayouting ? "Layouting..." : "Auto Layout"}
          </button>
          
          {/* Custom Fit View Button */}
          <button
            onClick={() => reactFlowInstance?.fitView({ padding: 0.2 })}
            disabled={reactFlowNodes.length === 0}
            className="px-4 py-2 text-sm font-semibold rounded-lg bg-white text-gray-800 hover:bg-gray-100 hover:shadow-md transition-all duration-300 ease-in-out min-w-[100px] text-center mr-2"
            style={{
              padding: '0.5rem 1rem',
              fontSize: '0.875rem',
              fontWeight: '600',
              borderRadius: '0.5rem',
              backgroundColor: 'white',
              color: '#1f2937',
              transition: 'all 0.3s ease-in-out',
              minWidth: '100px',
              textAlign: 'center',
              cursor: 'pointer',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              border: 'none',
              opacity: reactFlowNodes.length === 0 ? 0.5 : 1
            }}
          >
            Fit View
          </button>
          
          {/* Custom Zoom In Button */}
          <button
            onClick={() => reactFlowInstance?.zoomIn({ duration: 300 })}
            className="px-3 py-2 text-sm font-semibold rounded-lg bg-white text-gray-800 hover:bg-gray-100 hover:shadow-md transition-all duration-300 ease-in-out min-w-[60px] text-center mr-2"
            style={{
              padding: '0.5rem 0.75rem',
              fontSize: '0.875rem',
              fontWeight: '600',
              borderRadius: '0.5rem',
              backgroundColor: 'white',
              color: '#1f2937',
              transition: 'all 0.3s ease-in-out',
              minWidth: '60px',
              textAlign: 'center',
              cursor: 'pointer',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              border: 'none'
            }}
            title="Zoom In"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
              <line x1="11" y1="8" x2="11" y2="14"/>
              <line x1="8" y1="11" x2="14" y2="11"/>
            </svg>
          </button>
          
          {/* Custom Zoom Out Button */}
          <button
            onClick={() => reactFlowInstance?.zoomOut({ duration: 300 })}
            className="px-3 py-2 text-sm font-semibold rounded-lg bg-white text-gray-800 hover:bg-gray-100 hover:shadow-md transition-all duration-300 ease-in-out min-w-[60px] text-center"
            style={{
              padding: '0.5rem 0.75rem',
              fontSize: '0.875rem',
              fontWeight: '600',
              borderRadius: '0.5rem',
              backgroundColor: 'white',
              color: '#1f2937',
              transition: 'all 0.3s ease-in-out',
              minWidth: '60px',
              textAlign: 'center',
              cursor: 'pointer',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              border: 'none'
            }}
            title="Zoom Out"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
              <line x1="8" y1="11" x2="14" y2="11"/>
            </svg>
          </button>
        </Controls>
      </ReactFlow>
      
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-600">Generating mind map...</p>
          </div>
        </div>
      )}

    </div>
  );
}
