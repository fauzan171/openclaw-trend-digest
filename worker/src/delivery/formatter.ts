// ============================================
// OpenClaw Trend Digest — Markdown Formatter (Worker Edition)
// Sama — formatter tidak bergantung runtime
// ============================================

import type { DigestOutput, DigestTopic, Sentiment } from '../types/index.js';

const SENTIMENT_BADGE: Record<Sentiment, string> = {
  Positive: '🟢 Positif',
  Negative: '🔴 Negatif',
  Neutral: '⚪ Netral',
  Mixed: '🟡 Campuran',
};

function formatTopic(topic: DigestTopic, index: number): string {
  const lines: string[] = [];
  lines.push(`${topic.emoji} *${index + 1}. ${topic.headline}*`);
  lines.push(`📂 _${topic.category}_ | ${SENTIMENT_BADGE[topic.sentiment]} | ⭐ ${topic.relevanceScore}/10`);
  lines.push('');
  lines.push(topic.summary);
  lines.push('');
  if (topic.sources.length > 0) {
    lines.push(topic.sources.map((url, i) => `  🔗 [Sumber ${i + 1}](${url})`).join('\n'));
  }
  lines.push('');
  lines.push('─────────────────────');
  return lines.join('\n');
}

export function formatToMarkdown(digest: DigestOutput): string {
  const lines: string[] = [];

  lines.push('☀️ *OPENCLAW TREND DIGEST*');
  lines.push(`📅 ${digest.date}`);
  lines.push('');
  lines.push(`📊 _${digest.totalRawProcessed} artikel dianalisis → ${digest.topics.length} topik terpenting_`);
  lines.push(`🗑️ _${digest.totalDiscarded} artikel noise dibuang oleh AI_`);
  lines.push('');
  lines.push('═══════════════════════');
  lines.push('');

  if (digest.topics.length === 0) {
    lines.push('_Tidak ada berita signifikan hari ini. Nikmati hari yang tenang!_ ☕');
  } else {
    for (let i = 0; i < digest.topics.length; i++) {
      lines.push(formatTopic(digest.topics[i]!, i));
      lines.push('');
    }
  }

  lines.push('═══════════════════════');
  lines.push('');
  lines.push('🤖 _Dikurasi otomatis oleh OpenClaw AI Agent_');
  lines.push('💡 _Hemat waktu, kurangi noise, fokus pada yang penting._');

  return lines.join('\n');
}

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
