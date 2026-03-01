// ============================================
// OpenClaw Trend Digest — Logger (Worker Edition)
// Lightweight logger for Cloudflare Workers
// ============================================

import type { LogLevel } from '../types/index.js';

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const LOG_ICONS: Record<LogLevel, string> = {
  debug: '🔍',
  info: '✅',
  warn: '⚠️',
  error: '❌',
};

/**
 * Lightweight logger untuk Cloudflare Workers.
 *
 * Workers menggunakan console.log yang otomatis di-stream ke
 * `wrangler tail` dan Cloudflare Dashboard → Workers → Logs.
 * Tidak perlu library logging berat — native console sudah cukup.
 */
export class Logger {
  private level: LogLevel;

  constructor(level: LogLevel = 'info') {
    this.level = level;
  }

  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] >= LOG_LEVELS[this.level];
  }

  private log(level: LogLevel, context: string, message: string, data?: unknown): void {
    if (!this.shouldLog(level)) return;

    const icon = LOG_ICONS[level];
    const timestamp = new Date().toISOString();
    const formatted = `${icon} [${timestamp}] [${context}] ${message}`;

    if (level === 'error') {
      console.error(formatted, data !== undefined ? data : '');
    } else if (level === 'warn') {
      console.warn(formatted, data !== undefined ? data : '');
    } else {
      console.log(formatted, data !== undefined ? data : '');
    }
  }

  debug(context: string, message: string, data?: unknown): void {
    this.log('debug', context, message, data);
  }

  info(context: string, message: string, data?: unknown): void {
    this.log('info', context, message, data);
  }

  warn(context: string, message: string, data?: unknown): void {
    this.log('warn', context, message, data);
  }

  error(context: string, message: string, data?: unknown): void {
    this.log('error', context, message, data);
  }

  separator(title: string): void {
    if (!this.shouldLog('info')) return;
    console.log(`\n${'═'.repeat(50)}\n  📌 ${title}\n${'═'.repeat(50)}`);
  }

  startTimer(context: string, operation: string): () => void {
    const start = Date.now();
    this.debug(context, `⏱️ Starting: ${operation}`);
    return () => {
      const duration = Date.now() - start;
      this.info(context, `⏱️ Completed: ${operation} (${duration}ms)`);
    };
  }
}

/**
 * Factory function — dipanggil dengan env.LOG_LEVEL.
 */
export function createLogger(level?: string): Logger {
  return new Logger((level as LogLevel) ?? 'info');
}
