'use client';

import React, { useState, useCallback, useMemo } from 'react';
import MapCanvas from './MapCanvas';
import Sidebar from './Sidebar';
import { Node } from '@reactflow/core';

interface MapViewPageProps {
  nodes: Node[];
  edges: any[];
  onBack: () => void;
}

export default function MapViewPage({ nodes, edges, onBack }: MapViewPageProps) {
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [activeCategories, setActiveCategories] = useState<string[]>([]);
  const [superCategories, setSuperCategories] = useState<string[]>([]);

  // Filter nodes based on active categories
  const filteredNodes = useMemo(() => {
    if (activeCategories.length === 0) {
      return nodes;
    }
    return nodes.filter(node => 
      activeCategories.some(category => 
        node.data?.relatedTopics?.includes(category)
      )
    );
  }, [nodes, activeCategories]);

  const handleNodeSelect = useCallback((node: Node) => {
    if (selectedNode && selectedNode.id === node.id) {
      setSelectedNode(null);
    } else {
      setSelectedNode(node);
    }
  }, [selectedNode]);

  const handleCategoryToggle = useCallback((categoryName: string) => {
    setActiveCategories(prev => {
      if (prev.includes(categoryName)) {
        return prev.filter(cat => cat !== categoryName);
      } else {
        return [...prev, categoryName];
      }
    });
  }, []);

  const clearAllCategories = useCallback(() => {
    setActiveCategories([]);
  }, []);

  // Get unique categories from all nodes
  const availableCategories = useMemo(() => {
    const categories = new Set<string>();
    nodes.forEach(node => {
      if (node.data?.relatedTopics) {
        node.data.relatedTopics.forEach((topic: string) => categories.add(topic));
      }
    });
    return Array.from(categories).sort();
  }, [nodes]);

  return (
    <div style={{ 
      height: '100vh', 
      width: '100%', 
      position: 'relative', 
      backgroundColor: '#f3f4f6',
      overflow: 'hidden'
    }}>
      {/* Category Filter Buttons - Top */}
      <div style={{
        position: 'absolute',
        top: '1rem',
        left: '1rem',
        right: '1rem',
        zIndex: 20,
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.5rem'
      }}>
        {availableCategories.map(category => {
          // Get the proper color for each category
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

          const categoryColor = getCategoryColor(category);
          const isActive = activeCategories.includes(category);

          return (
            <button
              key={category}
              onClick={() => handleCategoryToggle(category)}
              className="category-filter-button"
              style={{
                padding: '0.5rem 0.75rem',
                borderRadius: '9999px',
                fontSize: '0.875rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                backgroundColor: isActive ? categoryColor : 'white',
                color: isActive ? 'white' : categoryColor,
                boxShadow: isActive ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' : '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                border: isActive ? 'none' : `2px solid ${categoryColor}`,
                transform: 'scale(1)',
                outline: 'none',
                transition: 'none',
                WebkitTapHighlightColor: 'transparent',
                WebkitTouchCallout: 'none',
                WebkitUserSelect: 'none',
                MozUserSelect: 'none',
                msUserSelect: 'none',
                userSelect: 'none'
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = categoryColor;
                  e.currentTarget.style.color = 'white';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'white';
                  e.currentTarget.style.color = categoryColor;
                }
              }}
            >
              {category}
            </button>
          );
        })}
        {activeCategories.length > 0 && (
          <button
            onClick={clearAllCategories}
            style={{
              padding: '0.5rem 0.75rem',
              borderRadius: '9999px',
              fontSize: '0.875rem',
              fontWeight: '500',
              backgroundColor: '#4b5563',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#374151';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#4b5563';
            }}
          >
            Clear All
          </button>
        )}
      </div>

      {/* Map Canvas - Full Screen */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#f3f4f6'
      }}>
        <MapCanvas
          nodes={filteredNodes}
          edges={edges}
          onNodeSelect={handleNodeSelect}
          isLoading={false}
          selectedNodeId={selectedNode?.id}
          onSuperCategoriesChange={(categories) => setSuperCategories(categories.map(c => c.name))}
        />
      </div>

      {/* Plus Button - Bottom Right */}
      <div style={{
        position: 'absolute',
        bottom: '1rem',
        right: '1rem',
        zIndex: 30
      }}>
        <button
          onClick={onBack}
          style={{
            width: '56px',
            height: '56px',
            backgroundColor: '#4b5563',
            borderRadius: '50%',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            transition: 'all 0.3s ease-in-out'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#374151';
            e.currentTarget.style.transform = 'scale(1.05)';
            e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#4b5563';
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
          }}
          title="Back to search"
        >
          <svg 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="white" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        </button>
      </div>

      {/* Sidebar - Slides out from right, only covering map area */}
      {selectedNode && (
        <div 
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            height: '100%',
            width: '50%',
            maxWidth: '600px',
            minWidth: '400px',
            backgroundColor: 'white',
            borderLeft: '1px solid #e5e7eb',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            zIndex: 50,
            transform: 'translateX(0)',
            transition: 'transform 0.3s ease-in-out'
          }}
        >
          <Sidebar node={selectedNode} onClose={() => setSelectedNode(null)} />
        </div>
      )}
    </div>
  );
}
