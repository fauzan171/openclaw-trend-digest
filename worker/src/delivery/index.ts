// ============================================
// OpenClaw Trend Digest — Delivery Orchestrator (Worker Edition)
// ============================================

import type { DigestOutput, DeliveryResult, Env } from '../types/index.js';
import type { Logger } from '../utils/logger.js';
import { formatToMarkdown, formatToDiscordMarkdown } from './formatter.js';
import { sendToTelegram } from './telegram.js';
import { sendToDiscord } from './discord.js';
import { archiveToD1 } from '../database/d1.js';

/**
 * Kirim digest ke semua channel secara paralel.
 */
export async function deliverDigest(
  digest: DigestOutput,
  env: Env,
  logger: Logger
): Promise<DeliveryResult[]> {
  logger.separator('PHASE 3: DELIVERY');

  const telegramMd = formatToMarkdown(digest);
  const discordMd = formatToDiscordMarkdown(digest);

  const deliveries: Array<Promise<DeliveryResult>> = [
    sendToTelegram(telegramMd, env.TELEGRAM_BOT_TOKEN, env.TELEGRAM_CHAT_ID, logger),
    sendToDiscord(discordMd, env.DISCORD_WEBHOOK_URL, logger),
    archiveToD1(digest, telegramMd, env.DB, logger),
  ];

  const settled = await Promise.allSettled(deliveries);

  const channels = ['telegram', 'discord', 'd1'] as const;
  const results: DeliveryResult[] = settled.map((s, i) => {
    if (s.status === 'fulfilled') return s.value;
    return {
      channel: channels[i]!,
      success: false,
      message: `Error: ${String(s.reason)}`,
      timestamp: new Date().toISOString(),
    };
  });

  const ok = results.filter(r => r.success).length;
  const fail = results.filter(r => !r.success).length;
  logger.info('Delivery', `📊 Summary: ${ok} success, ${fail} failed`);

  return results;
}
