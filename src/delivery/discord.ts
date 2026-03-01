// ============================================
// OpenClaw Trend Digest — Discord Webhook Sender
// Tim 3: Delivery & Integration Team
// ============================================

import axios from 'axios';
import type { DeliveryResult } from '../types/index.js';
import { logger } from '../utils/logger.js';

/**
 * Batas karakter per pesan Discord.
 * Discord webhooks membatasi 2000 chars per message.
 */
const MAX_DISCORD_LENGTH = 1900;

/**
 * Memecah pesan menjadi beberapa bagian untuk Discord.
 */
function splitDiscordMessage(text: string): string[] {
  if (text.length <= MAX_DISCORD_LENGTH) {
    return [text];
  }

  const parts: string[] = [];
  const lines = text.split('\n');
  let currentPart = '';

  for (const line of lines) {
    if ((currentPart + '\n' + line).length > MAX_DISCORD_LENGTH) {
      if (currentPart) {
        parts.push(currentPart.trim());
      }
      currentPart = line;
    } else {
      currentPart += (currentPart ? '\n' : '') + line;
    }
  }

  if (currentPart.trim()) {
    parts.push(currentPart.trim());
  }

  return parts;
}

/**
 * Mengirim digest ke Discord via Webhook.
 *
 * Discord Webhooks lebih sederhana dari Telegram — cukup POST JSON.
 * Webhook URL sudah mencakup auth, tidak perlu token terpisah.
 */
export async function sendToDiscord(
  markdown: string,
  webhookUrl: string
): Promise<DeliveryResult> {
  const endTimer = logger.startTimer('Discord', 'Sending digest');

  try {
    const messageParts = splitDiscordMessage(markdown);
    logger.info('Discord', `Sending ${messageParts.length} message part(s)`);

    for (let i = 0; i < messageParts.length; i++) {
      const part = messageParts[i]!;

      await axios.post(
        webhookUrl,
        {
          content: part,
          username: 'OpenClaw Trend Digest',
          avatar_url: 'https://raw.githubusercontent.com/openclaw/assets/main/logo.png',
        },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 15000,
        }
      );

      // Discord rate limit: wait 500ms between messages
      if (i < messageParts.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }

    endTimer();
    logger.info('Discord', '✅ Digest sent successfully!');

    return {
      channel: 'discord',
      success: true,
      message: `Sent ${messageParts.length} message(s) to Discord`,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Discord', `Failed to send: ${errorMessage}`);
    endTimer();

    return {
      channel: 'discord',
      success: false,
      message: `Discord delivery failed: ${errorMessage}`,
      timestamp: new Date().toISOString(),
    };
  }
}
