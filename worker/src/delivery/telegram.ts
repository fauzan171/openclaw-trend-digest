// ============================================
// OpenClaw Trend Digest — Telegram Sender (Worker Edition)
// Native fetch — tanpa axios
// ============================================

import type { DeliveryResult } from '../types/index.js';
import type { Logger } from '../utils/logger.js';

const TELEGRAM_API = 'https://api.telegram.org/bot';
const MAX_MSG_LENGTH = 4000;

function splitMessage(text: string): string[] {
  if (text.length <= MAX_MSG_LENGTH) return [text];

  const parts: string[] = [];
  const lines = text.split('\n');
  let current = '';

  for (const line of lines) {
    if ((current + '\n' + line).length > MAX_MSG_LENGTH) {
      if (current) parts.push(current.trim());
      current = line;
    } else {
      current += (current ? '\n' : '') + line;
    }
  }
  if (current.trim()) parts.push(current.trim());
  return parts;
}

export async function sendToTelegram(
  markdown: string,
  botToken: string,
  chatId: string,
  logger: Logger
): Promise<DeliveryResult> {
  const endTimer = logger.startTimer('Telegram', 'Sending digest');

  try {
    const parts = splitMessage(markdown);
    logger.info('Telegram', `Sending ${parts.length} part(s) to ${chatId}`);

    for (let i = 0; i < parts.length; i++) {
      try {
        // Attempt: Markdown mode
        const res = await fetch(`${TELEGRAM_API}${botToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: parts[i],
            parse_mode: 'Markdown',
            disable_web_page_preview: true,
          }),
        });

        if (!res.ok) {
          // Fallback: plain text
          logger.warn('Telegram', `Markdown failed part ${i + 1}, fallback plain`);
          const plain = parts[i]!
            .replace(/\*/g, '').replace(/_/g, '')
            .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

          await fetch(`${TELEGRAM_API}${botToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: chatId,
              text: plain,
              disable_web_page_preview: true,
            }),
          });
        }
      } catch (err) {
        logger.warn('Telegram', `Part ${i + 1} failed: ${err}`);
      }

      // Rate limit delay
      if (i < parts.length - 1) {
        await new Promise(r => setTimeout(r, 100));
      }
    }

    endTimer();
    logger.info('Telegram', '✅ Sent successfully');
    return { channel: 'telegram', success: true, message: `Sent ${parts.length} part(s)`, timestamp: new Date().toISOString() };
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown';
    logger.error('Telegram', `Failed: ${msg}`);
    endTimer();
    return { channel: 'telegram', success: false, message: msg, timestamp: new Date().toISOString() };
  }
}
