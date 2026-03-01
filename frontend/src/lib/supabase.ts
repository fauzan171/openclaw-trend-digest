// ============================================
// OpenClaw Trend Digest — Supabase Client (Frontend)
// Tim 6: Frontend & UI Team
// ============================================

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/**
 * Supabase client — hanya dibuat jika URL tersedia.
 * Ini mencegah error saat build tanpa env variables.
 */
export function getSupabaseClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }
  return createClient(supabaseUrl, supabaseAnonKey);
}

// ===== Type definitions for Supabase data =====

export interface DailyDigest {
  id: string;
  publish_date: string;
  raw_markdown: string;
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

// ===== Data Fetching Functions =====

/**
 * Ambil semua digests, urutkan dari terbaru.
 */
export async function getDigests(limit = 30): Promise<DailyDigest[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("daily_digests")
    .select("*")
    .order("publish_date", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Failed to fetch digests:", error.message);
    return [];
  }

  return (data ?? []) as DailyDigest[];
}

/**
 * Ambil digest terbaru.
 */
export async function getLatestDigest(): Promise<DailyDigest | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("daily_digests")
    .select("*")
    .order("publish_date", { ascending: false })
    .limit(1)
    .single();

  if (error) {
    console.error("Failed to fetch latest digest:", error.message);
    return null;
  }

  return data as DailyDigest;
}

/**
 * Ambil digest berdasarkan tanggal.
 */
export async function getDigestByDate(
  date: string
): Promise<DailyDigest | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("daily_digests")
    .select("*")
    .eq("publish_date", date)
    .single();

  if (error) {
    console.error(`Failed to fetch digest for ${date}:`, error.message);
    return null;
  }

  return data as DailyDigest;
}
