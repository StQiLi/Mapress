"use client";


interface SidebarProps {
  node: any;
  onClose?: () => void;
}

export default function Sidebar({ node, onClose }: SidebarProps) {
  const isCategory = node.type === "category";
  const data = node.data;

  return (
    <div className="h-full bg-white flex flex-col font-sans">
      {/* Header */}
      <div className="p-4 relative">
        {onClose && (
          <button
            onClick={onClose}
            className="absolute w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center transition-colors border-0 shadow-sm z-10"
            title="Close sidebar"
            style={{ 
              border: 'none', 
              outline: 'none',
              left: '16px',
              top: '16px'
            }}
          >
            <span className="text-black font-bold text-sm leading-none">×</span>
          </button>
        )}
         <div 
           className="flex flex-col items-center justify-center" 
           style={{ paddingLeft: '64px' }}
         >
           <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
             {data.title}
           </h2>
           {/* Related Topics as colored rectangles */}
           {data.relatedTopics && data.relatedTopics.length > 0 && (
             <div 
               className="flex flex-wrap gap-2 justify-center" 
               style={{ marginBottom: '12px' }}
             >
               {data.relatedTopics.map((topic: string, index: number) => {
                 // Map topics to super category colors
                 const getTopicColor = (topic: string) => {
                   const colorMap: { [key: string]: string } = {
                     "Technology": "#3b82f6",
                     "Politics": "#ef4444", 
                     "Economy": "#10b981",
                     "International": "#8b5cf6",
                     "Society": "#f59e0b",
                     "Science": "#6366f1"
                   };
                   return colorMap[topic] || "#6b7280";
                 };
                 
                 return (
                   <span 
                     key={index} 
                     className="text-white text-xs font-medium shadow-sm"
                     style={{
                       backgroundColor: getTopicColor(topic),
                       padding: '6px 12px',
                       borderRadius: '6px',
                       display: 'inline-block',
                       margin: '2px'
                     }}
                   >
                     {topic}
                   </span>
                 );
               })}
             </div>
           )}
           {/* Today's date */}
           <div 
             className="text-xs text-gray-500 font-medium" 
             style={{ marginBottom: '16px' }}
           >
             {new Date().toLocaleDateString('en-US', { 
               weekday: 'long', 
               year: 'numeric', 
               month: 'long', 
               day: 'numeric' 
             })}
           </div>
         </div>
      </div>

      {/* Tabs - COMMENTED OUT */}
      {/* 
      <div className="bg-white p-2">
        <nav className="flex gap-2 relative" style={{ position: 'relative', minHeight: '50px' }}>
          <div 
            className="absolute bottom-0 transition-all duration-300 ease-in-out"
            style={{
              height: '4px',
              backgroundColor: '#000000',
              width: activeTab === "summary" ? "calc(33.33% - 0.5rem)" :
                     activeTab === "details" ? "calc(33.33% - 0.5rem)" :
                     "calc(33.33% - 0.5rem)",
              left: activeTab === "summary" ? "0" :
                    activeTab === "details" ? "calc(33.33% + 0.5rem)" :
                    "calc(66.66% + 1rem)",
              zIndex: 10
            }}
          />
          
          <button onClick={() => setActiveTab("summary")} className="flex-1 py-3 transition-colors duration-300 ease-in-out" style={{ fontSize: '16px', fontWeight: 'bold', backgroundColor: 'transparent', border: 'none', color: activeTab === "summary" ? '#000000' : '#6b7280', cursor: 'pointer' }}>Summary</button>
          <button onClick={() => setActiveTab("details")} className="flex-1 py-3 transition-colors duration-300 ease-in-out" style={{ fontSize: '16px', fontWeight: 'bold', backgroundColor: 'transparent', border: 'none', color: activeTab === "details" ? '#000000' : '#6b7280', cursor: 'pointer' }}>Details</button>
          <button onClick={() => setActiveTab("sources")} className="flex-1 py-3 transition-colors duration-300 ease-in-out" style={{ fontSize: '16px', fontWeight: 'bold', backgroundColor: 'transparent', border: 'none', color: activeTab === "sources" ? '#000000' : '#6b7280', cursor: 'pointer' }}>Sources</button>
        </nav>
      </div>
      */}

      {/* Content - Combined View */}
      <div 
        className="flex-1 overflow-y-auto space-y-6"
        style={{
          paddingTop: '16px',
          paddingBottom: '16px', 
          paddingRight: '16px',
          paddingLeft: '32px'
        }}
      >
        {/* Summary */}
        <div>
          <p className="text-sm text-gray-600 leading-relaxed">
            {data.summary || (isCategory 
              ? `This category contains ${data.facts?.length || 0} key facts about ${data.title.toLowerCase()}.`
              : `This fact provides specific information about ${data.title.toLowerCase()}.`
            )}
          </p>
        </div>

        {/* Key Points */}
        {((data.keyPoints && data.keyPoints.length > 0) || (!isCategory && data.bullets && data.bullets.length > 0)) && (
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Key Points</h3>
            <ul className="space-y-2">
              {data.keyPoints && data.keyPoints.map((point: string, index: number) => (
                <li key={index} className="text-sm text-gray-600 flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  <span>{point}</span>
                </li>
              ))}
              {!isCategory && data.bullets && data.bullets.map((bullet: string, index: number) => (
                <li key={`bullet-${index}`} className="text-sm text-gray-600 flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Context & Implications */}
        {(data.context || data.implications) && (
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Additional Information</h3>
            {data.context && (
              <div className="mb-3">
                <h4 className="text-sm font-medium text-gray-800 mb-1">Context</h4>
                <p className="text-sm text-gray-600 leading-relaxed">{data.context}</p>
              </div>
            )}
            {data.implications && (
              <div>
                <h4 className="text-sm font-medium text-gray-800 mb-1">Implications</h4>
                <p className="text-sm text-gray-600 leading-relaxed">{data.implications}</p>
              </div>
            )}
          </div>
        )}


        {/* Sources */}
        {data.sources && data.sources.length > 0 && (
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Sources ({data.sources.length})</h3>
            <div className="space-y-4">
              {data.sources.map((source: any, index: number) => (
                <div key={index}>
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
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
