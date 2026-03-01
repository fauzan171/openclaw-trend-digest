// ============================================
// OpenClaw Trend Digest — Delivery Orchestrator
// Tim 3: Delivery & Integration Team
// ============================================

import type { DigestOutput, DeliveryResult, AppConfig } from '../types/index.js';
import { formatToMarkdown, formatToDiscordMarkdown } from './formatter.js';
import { sendToTelegram } from './telegram.js';
import { sendToDiscord } from './discord.js';
import { archiveToSupabase } from '../archive/supabase.js';
import { logger } from '../utils/logger.js';

/**
 * Mengirim digest ke SEMUA channel delivery secara paralel.
 *
 * Philosophy: "Fire and collect" — kirim ke semua channel bersamaan,
 * kumpulkan hasilnya, dan report success/failure per channel.
 * Satu channel gagal TIDAK boleh menggagalkan channel lain.
 */
export async function deliverDigest(
  digest: DigestOutput,
  config: AppConfig
): Promise<DeliveryResult[]> {
  logger.separator('PHASE 3: DELIVERY (Multi-Channel)');

  // Format markdown untuk masing-masing platform
  const telegramMarkdown = formatToMarkdown(digest);
  const discordMarkdown = formatToDiscordMarkdown(digest);

  // Jalankan semua delivery secara paralel
  const deliveryPromises: Array<Promise<DeliveryResult>> = [
    // Telegram
    sendToTelegram(
      telegramMarkdown,
      config.telegramBotToken,
      config.telegramChatId
    ),

    // Discord
    sendToDiscord(discordMarkdown, config.discordWebhookUrl),
  ];

  // Supabase archive (opsional — hanya jika credentials tersedia)
  if (config.supabaseUrl && config.supabaseAnonKey) {
    deliveryPromises.push(
      archiveToSupabase(digest, telegramMarkdown, config)
    );
  } else {
    logger.info('Delivery', 'Supabase not configured, skipping archive');
  }

  // Fire all and collect results
  const settledResults = await Promise.allSettled(deliveryPromises);

  const results: DeliveryResult[] = settledResults.map((settled, index) => {
    if (settled.status === 'fulfilled') {
      return settled.value;
    }

    const channels = ['telegram', 'discord', 'supabase'] as const;
    return {
      channel: channels[index] ?? 'telegram',
      success: false,
      message: `Unexpected error: ${String(settled.reason)}`,
      timestamp: new Date().toISOString(),
    };
  });

  // Summary log
  const successCount = results.filter((r) => r.success).length;
  const failCount = results.filter((r) => !r.success).length;

  logger.info('Delivery', `📊 Delivery Summary: ${successCount} success, ${failCount} failed`, {
    details: results.map((r) => ({
      channel: r.channel,
      success: r.success,
      message: r.message,
    })),
  });

  return results;
}
