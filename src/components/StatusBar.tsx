"use client";

interface StatusBarProps {
  status: string;
  isLoading: boolean;
  sources: string[];
}

export default function StatusBar({ status, isLoading, sources }: StatusBarProps) {
  const steps = [
    { key: "search", label: "Searching", icon: "🔍" },
    { key: "fetch", label: "Fetching", icon: "📄" },
    { key: "cluster", label: "Clustering", icon: "🧠" },
    { key: "layout", label: "Mapping", icon: "🗺️" },
    { key: "done", label: "Done", icon: "✅" },
  ];

  const currentStepIndex = steps.findIndex(step => step.key === status);
  const isActive = (stepIndex: number) => {
    if (!isLoading) return false;
    return stepIndex <= currentStepIndex;
  };

  const isCompleted = (stepIndex: number) => {
    return currentStepIndex > stepIndex;
  };

  return (
    <div className="bg-white border-b border-gray-200 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Progress Steps */}
        <div className="flex items-center justify-center space-x-8">
          {steps.map((step, index) => (
            <div key={step.key} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  isCompleted(index)
                    ? "bg-green-100 text-green-600"
                    : isActive(index)
                    ? "bg-blue-100 text-blue-600"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                {isCompleted(index) ? "✓" : step.icon}
              </div>
              <span
                className={`ml-2 text-sm ${
                  isActive(index) || isCompleted(index)
                    ? "text-gray-900"
                    : "text-gray-400"
                }`}
              >
                {step.label}
              </span>
              {index < steps.length - 1 && (
                <div
                  className={`w-8 h-0.5 ml-4 ${
                    isCompleted(index) ? "bg-green-300" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Status Text */}
        {status && (
          <div className="mt-3 text-center">
            <p className="text-sm text-gray-600">
              {status === "search" && "Searching for relevant news articles..."}
              {status === "fetch" && "Fetching article content..."}
              {status === "cluster" && "Analyzing and clustering information..."}
              {status === "layout" && "Generating mind map layout..."}
              {status === "done" && "Mind map generated successfully!"}
            </p>
          </div>
        )}

        {/* Sources Count */}
        {sources.length > 0 && (
          <div className="mt-2 text-center">
            <p className="text-xs text-gray-500">
              Found {sources.length} source{sources.length !== 1 ? "s" : ""}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
