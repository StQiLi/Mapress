"use client";

import { useState, useEffect } from "react";

interface LoadingScreenProps {
  status: string;
  onComplete?: () => void;
}

const loadingMessages = {
  search: [
    "🔍 Searching the latest news...",
    "📰 Scanning thousands of articles...",
    "🌐 Connecting to news sources...",
    "⚡ Finding relevant stories...",
    "🎯 Targeting your topic..."
  ],
  fetch: [
    "📥 Downloading article content...",
    "🔗 Extracting key information...",
    "📊 Processing news data...",
    "🧠 Analyzing content patterns...",
    "📈 Gathering insights..."
  ],
  cluster: [
    "🔗 Identifying story connections...",
    "🎭 Grouping related topics...",
    "🌟 Finding key themes...",
    "🔄 Organizing information...",
    "🎨 Creating topic clusters..."
  ],
  layout: [
    "🎯 Positioning elements...",
    "🔮 Crafting your mind map...",
    "✨ Adding final touches...",
    "🎪 Bringing it all together...",
    "🚀 Almost ready..."
  ]
};

export default function LoadingScreen({ status, onComplete }: LoadingScreenProps) {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  // Get current messages based on status
  const currentMessages = loadingMessages[status as keyof typeof loadingMessages] || loadingMessages.search;

  // Cycle through messages
  useEffect(() => {
    const messageInterval = setInterval(() => {
      setCurrentMessageIndex(prev => (prev + 1) % currentMessages.length);
    }, 1500); // Change message every 1.5 seconds

    return () => clearInterval(messageInterval);
  }, [currentMessages.length, status]);

  // Update progress based on status
  useEffect(() => {
    let targetProgress = 0;
    switch (status) {
      case "search":
        targetProgress = 25;
        break;
      case "fetch":
        targetProgress = 50;
        break;
      case "cluster":
        targetProgress = 75;
        break;
      case "layout":
        targetProgress = 95;
        break;
      case "done":
        targetProgress = 100;
        break;
      default:
        targetProgress = 10;
    }

    // Animate progress bar
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= targetProgress) {
          clearInterval(progressInterval);
          return targetProgress;
        }
        return prev + 1;
      });
    }, 50);

    return () => clearInterval(progressInterval);
  }, [status]);

  // Auto-complete when done
  useEffect(() => {
    if (status === "done" && progress >= 100) {
      const timer = setTimeout(() => {
        onComplete?.();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [status, progress, onComplete]);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 flex items-center justify-center z-50">
      {/* Animated background particles */}
      <div className="absolute inset-0">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white/20 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 text-center max-w-md w-full px-6">
        {/* Logo/Icon */}
        <div className="mb-8">
          <div className="bg-gradient-to-br from-blue-400 to-indigo-500 rounded-3xl mx-auto mb-4 flex items-center justify-center animate-pulse" style={{ width: '64px', height: '64px' }}>
            <svg 
              className="text-white"
              style={{ width: '32px', height: '32px' }} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" 
              />
            </svg>
          </div>
        </div>

        {/* Current Message */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">
            Generating Your Mind Map
          </h2>
          <p 
            className="text-lg text-blue-100 transition-all duration-500 ease-in-out min-h-[1.75rem]"
            key={`${status}-${currentMessageIndex}`}
          >
            {currentMessages[currentMessageIndex]}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-blue-200 mb-2">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full transition-all duration-300 ease-out relative"
              style={{ width: `${progress}%` }}
            >
              {/* Shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
            </div>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="flex justify-center space-x-4">
          {[
            { key: "search", label: "Search", icon: "🔍" },
            { key: "fetch", label: "Fetch", icon: "📥" },
            { key: "cluster", label: "Cluster", icon: "🔗" },
            { key: "layout", label: "Layout", icon: "🎯" }
          ].map((step, index) => {
            const isActive = status === step.key;
            const isCompleted = ["search", "fetch", "cluster", "layout"].indexOf(status) > index;
            
            return (
              <div 
                key={step.key}
                className={`flex flex-col items-center space-y-1 transition-all duration-300 ${
                  isActive ? "scale-110" : "scale-100"
                }`}
              >
                <div 
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm transition-all duration-300 ${
                    isCompleted || isActive
                      ? "bg-green-500 text-white" 
                      : "bg-white/20 text-blue-200"
                  } ${isActive ? "ring-4 ring-white/50 animate-pulse" : ""}`}
                >
                  {isCompleted ? "✓" : step.icon}
                </div>
                <span 
                  className={`text-xs transition-colors duration-300 ${
                    isActive ? "text-white font-medium" : "text-blue-200"
                  }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Fun fact */}
        <div className="mt-8 text-xs text-blue-300/80">
          <p>✨ Did you know? We analyze thousands of articles in real-time!</p>
        </div>
      </div>
    </div>
  );
}
