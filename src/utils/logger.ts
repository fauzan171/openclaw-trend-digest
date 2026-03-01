// ============================================
// OpenClaw Trend Digest — Logger Utility
// Tim 1: Data Engineering Team
// ============================================

import type { LogLevel } from '../types/index.js';

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const LOG_COLORS: Record<LogLevel, string> = {
  debug: '\x1b[36m',  // Cyan
  info: '\x1b[32m',   // Green
  warn: '\x1b[33m',   // Yellow
  error: '\x1b[31m',  // Red
};

const LOG_ICONS: Record<LogLevel, string> = {
  debug: '🔍',
  info: '✅',
  warn: '⚠️',
  error: '❌',
};

const RESET = '\x1b[0m';

class Logger {
  private level: LogLevel;

  constructor(level: LogLevel = 'info') {
    this.level = level;
  }

  setLevel(level: LogLevel): void {
    this.level = level;
  }

  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] >= LOG_LEVELS[this.level];
  }

  private formatTimestamp(): string {
    return new Date().toISOString();
  }

  private formatMessage(level: LogLevel, context: string, message: string, data?: unknown): void {
    if (!this.shouldLog(level)) return;

    const timestamp = this.formatTimestamp();
    const color = LOG_COLORS[level];
    const icon = LOG_ICONS[level];
    const levelStr = level.toUpperCase().padEnd(5);

    const formatted = `${color}${icon} [${timestamp}] [${levelStr}] [${context}]${RESET} ${message}`;

    if (level === 'error') {
      console.error(formatted);
    } else if (level === 'warn') {
      console.warn(formatted);
    } else {
      console.log(formatted);
    }

    if (data !== undefined) {
      console.log(`   ${color}└─${RESET}`, typeof data === 'string' ? data : JSON.stringify(data, null, 2));
    }
  }

  debug(context: string, message: string, data?: unknown): void {
    this.formatMessage('debug', context, message, data);
  }

  info(context: string, message: string, data?: unknown): void {
    this.formatMessage('info', context, message, data);
  }

  warn(context: string, message: string, data?: unknown): void {
    this.formatMessage('warn', context, message, data);
  }

  error(context: string, message: string, data?: unknown): void {
    this.formatMessage('error', context, message, data);
  }

  /**
   * Log dengan timer — berguna untuk mengukur durasi operasi.
   */
  startTimer(context: string, operation: string): () => void {
    const start = performance.now();
    this.debug(context, `⏱️  Starting: ${operation}`);

    return () => {
      const duration = (performance.now() - start).toFixed(2);
      this.info(context, `⏱️  Completed: ${operation} (${duration}ms)`);
    };
  }

  /**
   * Log separator untuk visual clarity di console.
   */
  separator(title: string): void {
    if (!this.shouldLog('info')) return;
    console.log(`\n${'═'.repeat(60)}`);
    console.log(`  📌 ${title}`);
    console.log(`${'═'.repeat(60)}\n`);
  }
}

// Singleton instance
export const logger = new Logger(
  (process.env['LOG_LEVEL'] as LogLevel) ?? 'info'
);
