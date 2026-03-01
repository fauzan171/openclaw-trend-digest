# 🦀 OpenClaw Trend Digest

> **AI-Powered Tech & News Curator — Your Personal Editor-in-Chief**  
> **Powered by Cloudflare Workers + D1**

[![Deploy to Cloudflare](https://github.com/YOUR_USERNAME/openclaw-trend-digest/actions/workflows/deploy-cloudflare.yml/badge.svg)](https://github.com/YOUR_USERNAME/openclaw-trend-digest/actions)
[![CI Pipeline](https://github.com/YOUR_USERNAME/openclaw-trend-digest/actions/workflows/ci.yml/badge.svg)](https://github.com/YOUR_USERNAME/openclaw-trend-digest/actions)

---

## ☀️ Apa Ini?

**OpenClaw Trend Digest** adalah AI Agent otonom yang setiap hari:

1. 📡 **Mengumpulkan** ratusan headline dari HackerNews, RSS Feeds, dan Reddit
2. 🧠 **Menganalisis** menggunakan LLM (Groq Llama-3) — membuang noise, deduplikasi, analisis sentimen
3. 📬 **Mengirimkan** "Morning Briefing" 3 menit ke Telegram & Discord
4. 🗄️ **Mengarsipkan** ke Cloudflare D1 + REST API untuk web

**Hemat waktu. Kurangi noise. Fokus pada yang penting.**

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                    CLOUDFLARE ECOSYSTEM                       │
│                                                              │
│  ┌─────────────┐    ┌──────────────┐    ┌──────────────┐    │
│  │   Workers    │    │     D1       │    │    Pages     │    │
│  │  (Backend)   │◄──►│  (Database)  │◄──►│  (Frontend)  │    │
│  │             │    │   SQLite     │    │   Next.js    │    │
│  └──────┬──────┘    └──────────────┘    └──────────────┘    │
│         │                                                    │
│    Cron Trigger                                              │
│    (06:00 WIB)                                               │
└─────────┼────────────────────────────────────────────────────┘
          │
          ▼
   ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
   │ HackerNews   │    │  Groq AI     │    │  Telegram    │
   │ RSS Feeds    │───►│  (LLM)       │───►│  Discord     │
   │ Reddit       │    │              │    │              │
   └──────────────┘    └──────────────┘    └──────────────┘
    Data Sources         AI Processor        Delivery
```

---

## 🚀 Quick Start

### Option A: Deploy ke Cloudflare (Recommended)

```bash
# 1. Clone
git clone https://github.com/YOUR_USERNAME/openclaw-trend-digest.git
cd openclaw-trend-digest/worker

# 2. Install
npm install

# 3. Setup D1 Database
npx wrangler d1 create openclaw-digest-db
# Copy database_id ke wrangler.toml

# 4. Run migrations
npx wrangler d1 execute openclaw-digest-db --file=./schema.sql

# 5. Set secrets
npx wrangler secret put GROQ_API_KEY
npx wrangler secret put TELEGRAM_BOT_TOKEN
npx wrangler secret put TELEGRAM_CHAT_ID
npx wrangler secret put DISCORD_WEBHOOK_URL

# 6. Deploy!
npx wrangler deploy

# 7. Test manual trigger
curl -X POST https://openclaw-trend-digest.YOUR.workers.dev/api/trigger
```

### Option B: Development Lokal

```bash
cd worker
npm install
npx wrangler d1 execute openclaw-digest-db --local --file=./schema.sql
npx wrangler dev    # http://localhost:8787
```

### Option C: Node.js Standalone (tanpa Cloudflare)

```bash
# Gunakan original src/ folder
npm install
cp .env.example .env   # Isi API keys
npm run dev
```

---

## 📡 API Endpoints

Worker menyediakan REST API yang bisa dikonsumsi frontend:

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Health check |
| `GET` | `/api/digests` | List semua digests |
| `GET` | `/api/digests/:date` | Digest by date (YYYY-MM-DD) |
| `GET` | `/api/topics?category=Technology` | Filter topics |
| `GET` | `/api/stats` | Dashboard statistics |
| `POST` | `/api/trigger` | Manual trigger pipeline |

---

## 🔧 Tech Stack

| Layer | Technology | Kenapa? |
|-------|-----------|---------|
| **Runtime** | Cloudflare Workers | 0ms cold start, 300+ edge locations |
| **Database** | Cloudflare D1 (SQLite) | 5GB free, no maintenance |
| **Frontend** | Next.js + Tailwind | SSG, fast, responsive |
| **AI/LLM** | Groq API (Llama 3.3 70B) | Fastest inference, free tier |
| **Scraping** | Native fetch() | Zero deps, Workers-native |
| **Delivery** | Telegram + Discord | Real-time notifications |
| **CI/CD** | GitHub Actions | Auto deploy on push |

### Kenapa Cloudflare Workers + D1?

| Aspek | GitHub Actions + Supabase | **Cloudflare Workers + D1** |
|-------|--------------------------|---------------------------|
| Cold Start | ~10s (install deps) | **~0ms** (V8 isolate) |
| Cron | ±15min delay | **Exact timing** |
| Database | 500MB free, can pause | **5GB free, always on** |
| API | ❌ None | **✅ Built-in REST** |
| Vendor | 3 services | **1 unified platform** |

---

## 📁 Project Structure

```
openclaw-trend-digest/
├── worker/                    ← ☁️ Cloudflare Worker (Backend)
│   ├── src/
│   │   ├── index.ts           ← Entry: scheduled() + fetch()
│   │   ├── scrapers/          ← HN, RSS, Reddit (native fetch)
│   │   ├── ai/                ← Groq LLM (direct REST)
│   │   ├── delivery/          ← Telegram + Discord senders
│   │   ├── database/          ← D1 CRUD operations
│   │   ├── api/               ← REST API routes
│   │   ├── types/             ← Shared TypeScript types
│   │   └── utils/             ← Logger
│   ├── wrangler.toml          ← Cloudflare config + cron
│   └── schema.sql             ← D1 migration
│
├── frontend/                  ← 🎨 Next.js (Cloudflare Pages)
│   ├── src/app/               ← Pages
│   ├── src/components/        ← UI Components
│   └── src/lib/               ← API client + demo data
│
├── src/                       ← 📦 Node.js standalone (fallback)
│   └── ...                    ← Original implementation
│
└── .github/workflows/         ← CI/CD pipelines
```

---

## 📄 License

MIT — free to use, modify, and distribute.

---

<p align="center">
  Built with ❤️ and ☕ by <strong>OpenClaw</strong><br/>
  <em>☁️ Powered by Cloudflare Workers + D1</em>
</p>
