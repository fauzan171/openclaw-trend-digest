"use client";

import type { DigestJSON } from "@/lib/api";

interface DigestHeaderProps {
  digest: DigestJSON;
  publishDate: string;
}

export function DigestHeader({ digest, publishDate }: DigestHeaderProps) {
  const formattedDate = new Date(publishDate).toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <header className="text-center mb-10">
      {/* Logo / Title */}
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium mb-6">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
        </span>
        AI-Powered Digest
      </div>

      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-2">
        ☀️ Morning Briefing
      </h1>
      <p className="text-[#888] text-sm mb-6">{formattedDate}</p>

      {/* Stats Bar */}
      <div className="flex flex-wrap justify-center gap-4 sm:gap-8">
        <StatItem
          icon="📰"
          value={digest.totalRawProcessed}
          label="Artikel Dianalisis"
        />
        <StatItem
          icon="🧠"
          value={digest.topics.length}
          label="Topik Terkurasi"
        />
        <StatItem
          icon="🗑️"
          value={digest.totalDiscarded}
          label="Noise Dibuang"
        />
        <StatItem
          icon="⏱️"
          value="~3 min"
          label="Waktu Baca"
          isString
        />
      </div>
    </header>
  );
}

function StatItem({
  icon,
  value,
  label,
  isString = false,
}: {
  icon: string;
  value: number | string;
  label: string;
  isString?: boolean;
}) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-lg" aria-hidden="true">{icon}</span>
      <span className="text-xl font-bold text-white">
        {isString ? value : value.toLocaleString("id-ID")}
      </span>
      <span className="text-xs text-[#888]">{label}</span>
    </div>
  );
}
