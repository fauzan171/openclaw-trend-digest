// ============================================
// OpenClaw Trend Digest — Telegram Bot Sender
// Tim 3: Delivery & Integration Team
// ============================================

import axios from 'axios';
import type { DeliveryResult } from '../types/index.js';
import { logger } from '../utils/logger.js';

const TELEGRAM_API_BASE = 'https://api.telegram.org/bot';

/**
 * Batas karakter per pesan Telegram.
 * Telegram membatasi 4096 chars per message.
 */
const MAX_MESSAGE_LENGTH = 4000;

/**
 * Memecah pesan panjang menjadi beberapa bagian agar tidak exceed limit Telegram.
 */
function splitMessage(text: string): string[] {
  if (text.length <= MAX_MESSAGE_LENGTH) {
    return [text];
  }

  const parts: string[] = [];
  const lines = text.split('\n');
  let currentPart = '';

  for (const line of lines) {
    if ((currentPart + '\n' + line).length > MAX_MESSAGE_LENGTH) {
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
 * Mengirim digest ke Telegram via Bot API.
 *
 * Strategy:
 * 1. Coba kirim dengan MarkdownV2 parsing
 * 2. Jika gagal (biasa karena escape issues), fallback ke plain text
 * 3. Jika pesan terlalu panjang, split menjadi multiple messages
 */
export async function sendToTelegram(
  markdown: string,
  botToken: string,
  chatId: string
): Promise<DeliveryResult> {
  const endTimer = logger.startTimer('Telegram', 'Sending digest');

  try {
    const messageParts = splitMessage(markdown);
    logger.info('Telegram', `Sending ${messageParts.length} message part(s) to chat ${chatId}`);

    for (let i = 0; i < messageParts.length; i++) {
      const part = messageParts[i]!;

      try {
        // Attempt 1: Send with Markdown parsing
        await axios.post(`${TELEGRAM_API_BASE}${botToken}/sendMessage`, {
          chat_id: chatId,
          text: part,
          parse_mode: 'Markdown',
          disable_web_page_preview: true,
        }, {
          timeout: 15000,
        });
      } catch {
        // Attempt 2: Fallback to plain text (tanpa Markdown parsing)
        logger.warn('Telegram', `Markdown failed for part ${i + 1}, falling back to plain text`);

        // Strip markdown formatting characters
        const plainText = part
          .replace(/\*/g, '')
          .replace(/_/g, '')
          .replace(/`/g, '')
          .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1'); // Convert [text](url) → text

        await axios.post(`${TELEGRAM_API_BASE}${botToken}/sendMessage`, {
          chat_id: chatId,
          text: plainText,
          disable_web_page_preview: true,
        }, {
          timeout: 15000,
        });
      }

      // Rate limiting: wait 100ms between messages
      if (i < messageParts.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }

    endTimer();
    logger.info('Telegram', '✅ Digest sent successfully!');

    return {
      channel: 'telegram',
      success: true,
      message: `Sent ${messageParts.length} message(s) to Telegram`,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Telegram', `Failed to send: ${errorMessage}`);
    endTimer();

    return {
      channel: 'telegram',
      success: false,
      message: `Telegram delivery failed: ${errorMessage}`,
      timestamp: new Date().toISOString(),
    };
  }
}
