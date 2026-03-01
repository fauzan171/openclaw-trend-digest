// ============================================
// OpenClaw Trend Digest — Markdown Formatter
// Tim 3: Delivery & Integration Team
// ============================================

import type { DigestOutput, DigestTopic, Sentiment } from '../types/index.js';
import { logger } from '../utils/logger.js';

/**
 * Sentiment badge visual.
 */
const SENTIMENT_BADGE: Record<Sentiment, string> = {
  Positive: '🟢 Positif',
  Negative: '🔴 Negatif',
  Neutral: '⚪ Netral',
  Mixed: '🟡 Campuran',
};

/**
 * Memformat satu topik menjadi blok Markdown yang indah.
 */
function formatTopic(topic: DigestTopic, index: number): string {
  const lines: string[] = [];

  // Header
  lines.push(`${topic.emoji} *${index + 1}. ${topic.headline}*`);
  lines.push(`📂 _${topic.category}_ | ${SENTIMENT_BADGE[topic.sentiment]} | ⭐ ${topic.relevanceScore}/10`);
  lines.push('');

  // Summary
  lines.push(topic.summary);
  lines.push('');

  // Source links
  if (topic.sources.length > 0) {
    const sourceLinks = topic.sources
      .map((url, i) => `  🔗 [Sumber ${i + 1}](${url})`)
      .join('\n');
    lines.push(sourceLinks);
  }

  lines.push('');
  lines.push('─────────────────────');

  return lines.join('\n');
}

/**
 * Memformat seluruh DigestOutput menjadi string Markdown yang siap kirim.
 *
 * Format ini dioptimalkan untuk:
 * - Telegram (MarkdownV2-compatible structure)
 * - Discord (standard Markdown)
 * - Mudah dibaca di mobile (3 menit baca)
 */
export function formatToMarkdown(digest: DigestOutput): string {
  logger.info('Formatter', `Formatting ${digest.topics.length} topics to Markdown`);

  const lines: string[] = [];

  // ===== HEADER =====
  lines.push('☀️ *OPENCLAW TREND DIGEST*');
  lines.push(`📅 ${digest.date}`);
  lines.push('');
  lines.push(`📊 _${digest.totalRawProcessed} artikel dianalisis → ${digest.topics.length} topik terpenting_`);
  lines.push(`🗑️ _${digest.totalDiscarded} artikel noise dibuang oleh AI_`);
  lines.push('');
  lines.push('═══════════════════════');
  lines.push('');

  // ===== TOPICS =====
  if (digest.topics.length === 0) {
    lines.push('_Tidak ada berita signifikan hari ini. Nikmati hari yang tenang!_ ☕');
  } else {
    for (let i = 0; i < digest.topics.length; i++) {
      lines.push(formatTopic(digest.topics[i]!, i));
      lines.push('');
    }
  }

  // ===== FOOTER =====
  lines.push('═══════════════════════');
  lines.push('');
  lines.push('🤖 _Dikurasi otomatis oleh OpenClaw AI Agent_');
  lines.push('💡 _Hemat waktu, kurangi noise, fokus pada yang penting._');
  lines.push(`⏰ _Digest dibuat: ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}_`);

  const markdown = lines.join('\n');
  logger.info('Formatter', `✅ Formatted markdown: ${markdown.length} chars`);

  return markdown;
}

/**
 * Format khusus untuk Discord yang menggunakan embed-style Markdown.
 * Discord mendukung **bold**, *italic*, dan > blockquote.
 */
export function formatToDiscordMarkdown(digest: DigestOutput): string {
  const lines: string[] = [];

  lines.push('# ☀️ OPENCLAW TREND DIGEST');
  lines.push(`> 📅 **${digest.date}**`);
  lines.push(`> 📊 ${digest.totalRawProcessed} artikel → ${digest.topics.length} topik | 🗑️ ${digest.totalDiscarded} noise`);
  lines.push('');

  for (let i = 0; i < digest.topics.length; i++) {
    const topic = digest.topics[i]!;
    lines.push(`### ${topic.emoji} ${i + 1}. ${topic.headline}`);
    lines.push(`*${topic.category}* | ${SENTIMENT_BADGE[topic.sentiment]} | ⭐ ${topic.relevanceScore}/10`);
    lines.push('');
    lines.push(topic.summary);
    lines.push('');

    if (topic.sources.length > 0) {
      lines.push(topic.sources.map((url, j) => `🔗 [Sumber ${j + 1}](${url})`).join(' | '));
    }

    lines.push('');
    lines.push('---');
    lines.push('');
  }

  lines.push('*🤖 Dikurasi oleh OpenClaw AI Agent*');
  return lines.join('\n');
}
