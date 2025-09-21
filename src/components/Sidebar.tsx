"use client";

interface SidebarProps {
  node: any;
}

export default function Sidebar({ node }: SidebarProps) {
  const isCategory = node.type === "category";
  const data = node.data;

  return (
    <div className="h-full bg-white border-l border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">
          {isCategory ? "Category" : "Fact"} Details
        </h2>
        <p className="text-sm text-gray-600 mt-1">{data.title}</p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Summary */}
        <div>
          <h3 className="font-medium text-gray-900 mb-2">Summary</h3>
          <p className="text-sm text-gray-600">
            {isCategory 
              ? `This category contains ${data.facts?.length || 0} key facts about ${data.title.toLowerCase()}.`
              : `This fact provides specific information about ${data.title.toLowerCase()}.`
            }
          </p>
        </div>

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

        {/* Sources */}
        {data.sources && data.sources.length > 0 && (
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Sources</h3>
            <div className="space-y-3">
              {data.sources.map((source: any, index: number) => (
                <div key={index} className="border border-gray-200 rounded-lg p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">
                        {source.outlet || "Unknown Source"}
                      </div>
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:text-blue-800 break-all"
                      >
                        {source.url}
                      </a>
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
      </div>
    </div>
  );
}
