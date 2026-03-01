"use client";

import { useState } from "react";
import type { DigestTopicJSON } from "@/lib/api";

const SENTIMENT_CONFIG: Record<
  string,
  { badge: string; color: string; bg: string }
> = {
  Positive: {
    badge: "🟢 Positif",
    color: "text-green-400",
    bg: "bg-green-500/10 border-green-500/20",
  },
  Negative: {
    badge: "🔴 Negatif",
    color: "text-red-400",
    bg: "bg-red-500/10 border-red-500/20",
  },
  Neutral: {
    badge: "⚪ Netral",
    color: "text-gray-400",
    bg: "bg-gray-500/10 border-gray-500/20",
  },
  Mixed: {
    badge: "🟡 Campuran",
    color: "text-yellow-400",
    bg: "bg-yellow-500/10 border-yellow-500/20",
  },
};

const CATEGORY_COLORS: Record<string, string> = {
  Technology: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  Business: "bg-purple-500/15 text-purple-400 border-purple-500/30",
  Science: "bg-teal-500/15 text-teal-400 border-teal-500/30",
  National: "bg-red-500/15 text-red-400 border-red-500/30",
  Global: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  Security: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  "AI & Machine Learning": "bg-pink-500/15 text-pink-400 border-pink-500/30",
};

function RelevanceBar({ score }: { score: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-0.5">
        {Array.from({ length: 10 }, (_, i) => (
          <div
            key={i}
            className={`w-2 h-4 rounded-sm transition-colors ${
              i < score ? "bg-blue-500" : "bg-[#2a2a2a]"
            }`}
          />
        ))}
      </div>
      <span className="text-xs text-[#888]">{score}/10</span>
    </div>
  );
}

export function TopicCard({
  topic,
  index,
}: {
  topic: DigestTopicJSON;
  index: number;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const sentimentCfg = SENTIMENT_CONFIG[topic.sentiment] ?? SENTIMENT_CONFIG["Neutral"]!;
  const categoryColor =
    CATEGORY_COLORS[topic.category] ??
    "bg-gray-500/15 text-gray-400 border-gray-500/30";

  return (
    <article
      className="group relative bg-[#141414] border border-[#2a2a2a] rounded-xl p-5 sm:p-6 hover:border-[#3a3a3a] transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/5"
      role="article"
      aria-label={`Topic ${index + 1}: ${topic.headline}`}
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <span className="text-2xl flex-shrink-0 mt-0.5" aria-hidden="true">
          {topic.emoji}
        </span>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold leading-snug text-white group-hover:text-blue-400 transition-colors">
            {topic.headline}
          </h3>
        </div>
      </div>

      {/* Meta badges */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${categoryColor}`}
        >
          {topic.category}
        </span>
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${sentimentCfg.bg}`}
        >
          {sentimentCfg.badge}
        </span>
      </div>

      {/* Relevance */}
      <div className="mb-4">
        <RelevanceBar score={topic.relevanceScore} />
      </div>

      {/* Summary */}
      <p className="text-sm text-[#ccc] leading-relaxed mb-4">
        {topic.summary}
      </p>

      {/* Sources */}
      {topic.sources.length > 0 && (
        <div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
            aria-expanded={isExpanded}
          >
            🔗 {topic.sources.length} sumber
            <svg
              className={`w-3 h-3 transition-transform ${
                isExpanded ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
          {isExpanded && (
            <div className="mt-2 space-y-1">
              {topic.sources.map((url, i) => (
                <a
                  key={i}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-xs text-[#888] hover:text-blue-400 truncate transition-colors"
                >
                  ↗ {url}
                </a>
              ))}
            </div>
          )}
        </div>
      )}
    </article>
  );
}
