"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ReactFlow,
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  ConnectionMode,
  NodeTypes,
} from "reactflow";
import "reactflow/dist/style.css";
import { ELK } from "elkjs/lib/elk.bundled.js";

const elk = new ELK();

const nodeTypes: NodeTypes = {
  category: CategoryNode,
  fact: FactNode,
};

function CategoryNode({ data }: { data: any }) {
  return (
    <div className="bg-blue-100 border-2 border-blue-300 rounded-lg p-3 min-w-[200px] shadow-lg">
      <div className="font-semibold text-blue-900 text-sm">{data.title}</div>
      {data.sources && data.sources.length > 0 && (
        <div className="text-xs text-blue-600 mt-1">
          {data.sources.length} source{data.sources.length !== 1 ? "s" : ""}
        </div>
      )}
    </div>
  );
}

function FactNode({ data }: { data: any }) {
  return (
    <div className="bg-green-100 border-2 border-green-300 rounded-lg p-3 min-w-[200px] shadow-lg">
      <div className="font-semibold text-green-900 text-sm">{data.title}</div>
      <div className="text-xs text-green-600 mt-1">
        {data.bullets?.length || 0} bullet{data.bullets?.length !== 1 ? "s" : ""}
      </div>
      {data.sources && data.sources.length > 0 && (
        <div className="text-xs text-green-600 mt-1">
          {data.sources.length} source{data.sources.length !== 1 ? "s" : ""}
        </div>
      )}
    </div>
  );
}

interface MapCanvasProps {
  nodes: any[];
  edges: any[];
  onNodeSelect: (node: any) => void;
  isLoading: boolean;
}

export default function MapCanvas({ nodes, edges, onNodeSelect, isLoading }: MapCanvasProps) {
  const [reactFlowNodes, setNodes, onNodesChange] = useNodesState([]);
  const [reactFlowEdges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isLayouting, setIsLayouting] = useState(false);

  // Update nodes and edges when props change
  useEffect(() => {
    if (nodes.length > 0) {
      setNodes(nodes);
      setEdges(edges);
    }
  }, [nodes, edges, setNodes, setEdges]);

  const onNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    onNodeSelect(node);
  }, [onNodeSelect]);

  const runLayout = useCallback(async () => {
    if (reactFlowNodes.length === 0) return;

    setIsLayouting(true);
    try {
      const graph = {
        id: "root",
        layoutOptions: {
          "elk.algorithm": "layered",
          "elk.direction": "RIGHT",
          "elk.spacing.nodeNode": "80",
          "elk.layered.spacing.nodeNodeBetweenLayers": "100",
        },
        children: reactFlowNodes.map((node) => ({
          id: node.id,
          width: 200,
          height: 80,
        })),
        edges: reactFlowEdges.map((edge) => ({
          id: edge.id,
          sources: [edge.source],
          targets: [edge.target],
        })),
      };

      const layoutedGraph = await elk.layout(graph);
      
      const layoutedNodes = reactFlowNodes.map((node) => {
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
    } finally {
      setIsLayouting(false);
    }
  }, [reactFlowNodes, reactFlowEdges, setNodes]);

  return (
    <div className="h-full relative">
      <ReactFlow
        nodes={reactFlowNodes}
        edges={reactFlowEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        connectionMode={ConnectionMode.Loose}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.1 }}
      >
        <Background />
        <Controls>
          <button
            onClick={runLayout}
            disabled={isLayouting || reactFlowNodes.length === 0}
            className="px-3 py-1 bg-white border border-gray-300 rounded text-xs hover:bg-gray-50 disabled:opacity-50"
          >
            {isLayouting ? "Layouting..." : "Auto Layout"}
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
