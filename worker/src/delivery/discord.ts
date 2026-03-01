// ============================================
// OpenClaw Trend Digest — Discord Sender (Worker Edition)
// Native fetch — tanpa axios
// ============================================

import type { DeliveryResult } from '../types/index.js';
import type { Logger } from '../utils/logger.js';

const MAX_DISCORD_LENGTH = 1900;

function splitMessage(text: string): string[] {
  if (text.length <= MAX_DISCORD_LENGTH) return [text];

  const parts: string[] = [];
  const lines = text.split('\n');
  let current = '';

  for (const line of lines) {
    if ((current + '\n' + line).length > MAX_DISCORD_LENGTH) {
      if (current) parts.push(current.trim());
      current = line;
    } else {
      current += (current ? '\n' : '') + line;
    }
  }
  if (current.trim()) parts.push(current.trim());
  return parts;
}

export async function sendToDiscord(
  markdown: string,
  webhookUrl: string,
  logger: Logger
): Promise<DeliveryResult> {
  const endTimer = logger.startTimer('Discord', 'Sending digest');

  try {
    const parts = splitMessage(markdown);
    logger.info('Discord', `Sending ${parts.length} part(s)`);

    for (let i = 0; i < parts.length; i++) {
      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: parts[i],
          username: 'OpenClaw Trend Digest',
        }),
      });

      if (!res.ok) {
        logger.warn('Discord', `Part ${i + 1} failed: HTTP ${res.status}`);
      }

      if (i < parts.length - 1) {
        await new Promise(r => setTimeout(r, 500));
      }
    }

    endTimer();
    logger.info('Discord', '✅ Sent successfully');
    return { channel: 'discord', success: true, message: `Sent ${parts.length} part(s)`, timestamp: new Date().toISOString() };
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown';
    logger.error('Discord', `Failed: ${msg}`);
    endTimer();
    return { channel: 'discord', success: false, message: msg, timestamp: new Date().toISOString() };
  }
}
