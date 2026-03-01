"use client";

import { useState, useEffect } from "react";
import { DigestHeader } from "@/components/DigestHeader";
import { TopicCard } from "@/components/TopicCard";
import { DateSelector } from "@/components/DateSelector";
import { getDigests, type DailyDigest } from "@/lib/api";
import { DEMO_DIGESTS } from "@/lib/demo-data";

export default function HomePage() {
  const [digests, setDigests] = useState<
    Array<{
      id: string;
      publish_date: string;
      raw_json: DailyDigest["raw_json"];
      created_at: string;
    }>
  >([]);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    async function loadDigests() {
      setIsLoading(true);

      // Try API first
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (apiUrl) {
        const data = await getDigests(30);
        if (data.length > 0) {
          setDigests(data);
          setSelectedDate(data[0]!.publish_date);
          setIsLoading(false);
          return;
        }
      }

      // Fallback to demo data
      setDigests(DEMO_DIGESTS);
      setSelectedDate(DEMO_DIGESTS[0]!.publish_date);
      setIsDemo(true);
      setIsLoading(false);
    }

    loadDigests();
  }, []);

  const selectedDigest = digests.find((d) => d.publish_date === selectedDate);
  const dates = digests.map((d) => d.publish_date);

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Top bar */}
      <div className="border-b border-[#2a2a2a]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🦀</span>
            <span className="font-bold text-white text-sm">
              OpenClaw Trend Digest
            </span>
          </div>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-[#888] hover:text-white transition-colors flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            Source Code
          </a>
        </div>
      </div>

      {/* Demo Banner */}
      {isDemo && (
        <div className="bg-yellow-500/10 border-b border-yellow-500/20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-2 text-center">
            <p className="text-xs text-yellow-400">
              🎭 Mode Demo — Menampilkan data contoh. Hubungkan Supabase untuk
              data live.
            </p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {isLoading ? (
          <LoadingSkeleton />
        ) : selectedDigest ? (
          <>
            {/* Date Selector */}
            <DateSelector
              dates={dates}
              selectedDate={selectedDate}
              onSelect={setSelectedDate}
            />

            {/* Digest Header */}
            <DigestHeader
              digest={selectedDigest.raw_json}
              publishDate={selectedDigest.publish_date}
            />

            {/* Topic Cards */}
            <div className="space-y-4">
              {selectedDigest.raw_json.topics.map((topic, index) => (
                <TopicCard key={index} topic={topic} index={index} />
              ))}
            </div>
          </>
        ) : (
          <EmptyState />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#2a2a2a] mt-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 text-center">
          <p className="text-xs text-[#666]">
            🤖 Dikurasi otomatis oleh AI · Dibangun dengan TypeScript, Groq LLM,
            Next.js & Tailwind CSS
          </p>
          <p className="text-xs text-[#444] mt-1">
            © 2026 OpenClaw Trend Digest — Open Source Project
          </p>
        </div>
      </footer>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-8 bg-[#1e1e1e] rounded-lg w-3/4 mx-auto" />
      <div className="h-4 bg-[#1e1e1e] rounded w-1/2 mx-auto" />
      <div className="flex justify-center gap-8 my-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-16 w-20 bg-[#1e1e1e] rounded-lg" />
        ))}
      </div>
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-48 bg-[#141414] border border-[#2a2a2a] rounded-xl" />
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-20">
      <span className="text-6xl block mb-4">☕</span>
      <h2 className="text-xl font-semibold text-white mb-2">
        Belum Ada Digest
      </h2>
      <p className="text-sm text-[#888] max-w-md mx-auto">
        Digest pertama akan muncul setelah pipeline AI berjalan. Jalankan{" "}
        <code className="bg-[#1e1e1e] px-2 py-0.5 rounded text-blue-400 text-xs">
          npm run dev
        </code>{" "}
        pada backend untuk memulai.
      </p>
    </div>
  );
}
