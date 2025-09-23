"use client";

import { useState } from "react";

interface SidebarProps {
  node: any;
  onClose?: () => void;
}

export default function Sidebar({ node, onClose }: SidebarProps) {
  const isCategory = node.type === "category";
  const data = node.data;
  const [activeTab, setActiveTab] = useState("summary");

  return (
    <div className="h-full bg-white border-l border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-gray-900">
              {isCategory ? "Category" : "Fact"} Details
            </h2>
            <p className="text-sm text-gray-600 mt-1">{data.title}</p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="ml-4 p-1 text-gray-400 hover:text-gray-600 transition-colors"
              title="Close sidebar"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex">
          <button
            onClick={() => setActiveTab("summary")}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "summary"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Summary
          </button>
          <button
            onClick={() => setActiveTab("details")}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "details"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Details
          </button>
          <button
            onClick={() => setActiveTab("sources")}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "sources"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Sources
          </button>
        </nav>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Summary Tab */}
        {activeTab === "summary" && (
          <>
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Summary</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {data.summary || (isCategory 
                  ? `This category contains ${data.facts?.length || 0} key facts about ${data.title.toLowerCase()}.`
                  : `This fact provides specific information about ${data.title.toLowerCase()}.`
                )}
              </p>
            </div>

            {/* Key Points */}
            {data.keyPoints && data.keyPoints.length > 0 && (
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Key Points</h3>
                <ul className="space-y-2">
                  {data.keyPoints.map((point: string, index: number) => (
                    <li key={index} className="text-sm text-gray-600 flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Related Topics */}
            {data.relatedTopics && data.relatedTopics.length > 0 && (
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Related Topics</h3>
                <div className="flex flex-wrap gap-2">
                  {data.relatedTopics.map((topic: string, index: number) => (
                    <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Details Tab */}
        {activeTab === "details" && (
          <>
            {/* Context */}
            {data.context && (
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Context</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{data.context}</p>
              </div>
            )}

            {/* Implications */}
            {data.implications && (
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Implications</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{data.implications}</p>
              </div>
            )}

            {/* Key Facts */}
            {!isCategory && data.bullets && (
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Key Points</h3>
                <ul className="space-y-2">
                  {data.bullets.map((bullet: string, index: number) => (
                    <li key={index} className="text-sm text-gray-600 flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Category Facts */}
            {isCategory && data.facts && (
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Facts in this Category</h3>
                <div className="space-y-2">
                  {data.facts.map((fact: any, index: number) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-3">
                      <div className="font-medium text-sm text-gray-900">{fact.title}</div>
                      <div className="text-xs text-gray-600 mt-1">
                        {fact.bullets?.length || 0} bullet{fact.bullets?.length !== 1 ? "s" : ""}
                        {fact.sources && ` • ${fact.sources.length} source${fact.sources.length !== 1 ? "s" : ""}`}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Sources Tab */}
        {activeTab === "sources" && (
          <>
            {data.sources && data.sources.length > 0 ? (
              <>
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Sources ({data.sources.length})</h3>
                  <div className="space-y-3">
                    {data.sources.map((source: any, index: number) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900">
                              {source.title || source.outlet || "Unknown Source"}
                            </div>
                            <a
                              href={source.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 hover:text-blue-800 break-all"
                            >
                              {source.url}
                            </a>
                            {source.publishedAt && (
                              <div className="mt-1 text-xs text-gray-500">
                                {new Date(source.publishedAt).toLocaleDateString()}
                              </div>
                            )}
                            {source.quote && (
                              <div className="mt-2 text-xs text-gray-600 italic">
                                "{source.quote}"
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <button
                  onClick={() => {
                    data.sources.forEach((source: any) => {
                      window.open(source.url, "_blank");
                    });
                  }}
                  className="mt-3 w-full px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                >
                  Open All Sources
                </button>
              </>
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-500 text-sm">No sources available</div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
