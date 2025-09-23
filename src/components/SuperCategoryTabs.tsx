"use client";

import { SuperCategory } from "@/lib/super-categories";

interface SuperCategoryTabsProps {
  categories: SuperCategory[];
  activeCategoryId?: string;
  onCategorySelect: (categoryId: string | null) => void;
  onClose: () => void;
}

export default function SuperCategoryTabs({ 
  categories, 
  activeCategoryId, 
  onCategorySelect, 
  onClose 
}: SuperCategoryTabsProps) {
  if (categories.length === 0) return null;

  return (
    <div className="absolute top-4 left-4 z-20 bg-white border border-gray-200 rounded-lg shadow-lg max-w-md">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-900">Super Categories</h3>
        <button
          onClick={onClose}
          className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
          title="Close categories"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Tab Bar */}
      <div className="p-3">
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {/* All Categories Tab */}
          <button
            onClick={() => onCategorySelect(null)}
            className={`flex-shrink-0 px-3 py-2 text-xs font-medium rounded-md transition-colors ${
              !activeCategoryId
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All ({categories.reduce((sum, cat) => sum + cat.nodeIds.length, 0)})
          </button>

          {/* Category Tabs */}
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => onCategorySelect(category.id)}
              className={`flex-shrink-0 px-3 py-2 text-xs font-medium rounded-md transition-colors ${
                activeCategoryId === category.id
                  ? `${category.color} border-2`
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <div className="flex items-center space-x-2">
                <span>{category.name}</span>
                <span className="text-xs opacity-75">({category.nodeIds.length})</span>
              </div>
            </button>
          ))}
        </div>

        {/* Category Description */}
        {activeCategoryId && (
          <div className="mt-3 p-2 bg-gray-50 rounded text-xs text-gray-600">
            {categories.find(cat => cat.id === activeCategoryId)?.description}
          </div>
        )}
      </div>
    </div>
  );
}
