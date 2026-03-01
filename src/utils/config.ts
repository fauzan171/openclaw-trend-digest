// ============================================
// OpenClaw Trend Digest — Config Loader & Validator
// Tim 1: Data Engineering Team
// ============================================

import dotenv from 'dotenv';
import type { AppConfig, LogLevel } from '../types/index.js';
import { logger } from './logger.js';

// Load .env file
dotenv.config();

/**
 * Mengambil environment variable, throw error jika required tapi tidak ada.
 */
function getEnv(key: string, required: true): string;
function getEnv(key: string, required: false): string | undefined;
function getEnv(key: string, required: boolean): string | undefined {
  const value = process.env[key];
  if (required && (!value || value.trim() === '')) {
    throw new Error(
      `❌ Missing required environment variable: ${key}\n` +
      `   → Pastikan file .env sudah ada dan berisi nilai untuk ${key}\n` +
      `   → Lihat .env.example sebagai referensi`
    );
  }
  return value?.trim();
}

/**
 * Memvalidasi dan mengembalikan konfigurasi aplikasi yang sudah bersih.
 */
export function loadConfig(): AppConfig {
  logger.info('Config', 'Loading environment configuration...');

  const config: AppConfig = {
    // AI / LLM
    groqApiKey: getEnv('GROQ_API_KEY', true),

    // Telegram
    telegramBotToken: getEnv('TELEGRAM_BOT_TOKEN', true),
    telegramChatId: getEnv('TELEGRAM_CHAT_ID', true),

    // Discord
    discordWebhookUrl: getEnv('DISCORD_WEBHOOK_URL', true),

    // Supabase (optional)
    supabaseUrl: getEnv('SUPABASE_URL', false),
    supabaseAnonKey: getEnv('SUPABASE_ANON_KEY', false),

    // App Configuration
    maxTopics: parseInt(getEnv('MAX_TOPICS', false) ?? '7', 10),
    minRelevanceScore: parseInt(getEnv('MIN_RELEVANCE_SCORE', false) ?? '5', 10),
    logLevel: (getEnv('LOG_LEVEL', false) as LogLevel) ?? 'info',
  };

  // Validate numeric ranges
  if (config.maxTopics < 1 || config.maxTopics > 20) {
    throw new Error('MAX_TOPICS must be between 1 and 20');
  }
  if (config.minRelevanceScore < 1 || config.minRelevanceScore > 10) {
    throw new Error('MIN_RELEVANCE_SCORE must be between 1 and 10');
  }

  // Update logger level
  logger.setLevel(config.logLevel);

  logger.info('Config', '✅ Configuration loaded successfully', {
    maxTopics: config.maxTopics,
    minRelevanceScore: config.minRelevanceScore,
    logLevel: config.logLevel,
    hasSupabase: !!(config.supabaseUrl && config.supabaseAnonKey),
  });

  return config;
}
