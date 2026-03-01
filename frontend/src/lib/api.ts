// ============================================
// OpenClaw Trend Digest — API Client (Frontend)
// Mengambil data dari Cloudflare Worker API
// ============================================
//
// PERUBAHAN DARI SUPABASE:
//   Sebelum: import { createClient } from "@supabase/supabase-js"
//   Sesudah: fetch() ke Worker API endpoint
//
// Keuntungan:
//   - Tidak expose Supabase anon key di frontend
//   - Tidak perlu install @supabase/supabase-js (lighter bundle)
//   - CORS handled oleh Worker
//   - Caching bisa diatur di Worker (Cache API)
// ============================================

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

// ===== Types =====

export interface DailyDigest {
  id: string;
  publish_date: string;
  raw_markdown?: string;
  raw_json: DigestJSON;
  created_at: string;
}

export interface DigestJSON {
  date: string;
  topics: DigestTopicJSON[];
  totalRawProcessed: number;
  totalDiscarded: number;
}

export interface DigestTopicJSON {
  category: string;
  headline: string;
  summary: string;
  sentiment: "Positive" | "Negative" | "Neutral" | "Mixed";
  relevanceScore: number;
  sources: string[];
  emoji: string;
}

export interface APIStats {
  totalDigests: number;
  totalTopics: number;
  categories: Array<{ category: string; count: number }>;
  sentiments: Array<{ sentiment: string; count: number }>;
}

// ===== Fetch helpers =====

async function apiFetch<T>(endpoint: string): Promise<T | null> {
  if (!API_BASE_URL) return null;

  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: { "Content-Type": "application/json" },
      next: { revalidate: 300 }, // Cache 5 menit (Next.js ISR)
    });

    if (!res.ok) {
      console.error(`API ${res.status}: ${endpoint}`);
      return null;
    }

    return (await res.json()) as T;
  } catch (error) {
    console.error(`API fetch failed: ${endpoint}`, error);
    return null;
  }
}

// ===== Data Fetching =====

/**
 * Ambil semua digests.
 */
export async function getDigests(limit = 30): Promise<DailyDigest[]> {
  const result = await apiFetch<{ data: DailyDigest[]; count: number }>(
    `/api/digests?limit=${limit}`
  );
  return result?.data ?? [];
}

/**
 * Ambil digest by date.
 */
export async function getDigestByDate(
  date: string
): Promise<DailyDigest | null> {
  return apiFetch<DailyDigest>(`/api/digests/${date}`);
}

/**
 * Ambil topics by category.
 */
export async function getTopicsByCategory(
  category: string,
  limit = 50
): Promise<DigestTopicJSON[]> {
  const result = await apiFetch<{ data: DigestTopicJSON[]; count: number }>(
    `/api/topics?category=${encodeURIComponent(category)}&limit=${limit}`
  );
  return result?.data ?? [];
}

/**
 * Health check.
 */
export async function healthCheck(): Promise<boolean> {
  const result = await apiFetch<{ status: string }>("/api/health");
  return result?.status === "ok";
}

/**
 * Dashboard stats.
 */
export async function getStats(): Promise<APIStats | null> {
  return apiFetch<APIStats>("/api/stats");
}
