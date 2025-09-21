"use client";

import { useCallback } from "react";
import html2canvas from "html2canvas";

interface ExportButtonsProps {
  nodes: any[];
  edges: any[];
}

export default function ExportButtons({ nodes, edges }: ExportButtonsProps) {
  const exportJSON = useCallback(() => {
    const data = {
      nodes,
      edges,
      exportedAt: new Date().toISOString(),
      version: "1.0",
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mapress-export-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [nodes, edges]);

  const exportPNG = useCallback(async () => {
    try {
      const canvas = document.querySelector(".react-flow");
      if (!canvas) {
        alert("Map canvas not found");
        return;
      }

      const canvasElement = await html2canvas(canvas as HTMLElement, {
        backgroundColor: "#ffffff",
        scale: 2,
        useCORS: true,
        allowTaint: true,
      });
      
      const link = document.createElement("a");
      link.download = `mapress-export-${new Date().toISOString().split("T")[0]}.png`;
      link.href = canvasElement.toDataURL();
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Export failed:", error);
      alert("Failed to export PNG. Please try again.");
    }
  }, []);

  return (
    <div className="flex items-center space-x-4">
      <span className="text-sm text-gray-600">Export:</span>
      <button
        onClick={exportJSON}
        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium"
      >
        📄 JSON
      </button>
      <button
        onClick={exportPNG}
        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium"
      >
        🖼️ PNG
      </button>
    </div>
  );
}
