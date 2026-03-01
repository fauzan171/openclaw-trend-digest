# ☁️ MIGRATION PLAN: Supabase → Cloudflare Workers + D1
## Project: OpenClaw Trend Digest
### Date: 2026-03-01 | Status: 🟡 In Progress

---

## 📊 PERBANDINGAN ARSITEKTUR

```
                    SEBELUM (Current)              SESUDAH (Cloudflare)
                ┌─────────────────────┐        ┌─────────────────────────┐
  Cron Job      │  GitHub Actions     │   →    │  CF Workers Cron Trigger│
  Runtime       │  Node.js (VM)       │   →    │  CF Workers (V8 Isolate)│
  Database      │  Supabase (PgSQL)   │   →    │  Cloudflare D1 (SQLite) │
  Frontend      │  Vercel / Manual    │   →    │  Cloudflare Pages       │
  API Layer     │  Tidak ada          │   →    │  CF Workers (REST API)  │
                └─────────────────────┘        └─────────────────────────┘
```

---

## ✅ KENAPA CLOUDFLARE LEBIH BAIK UNTUK PROJECT INI

| Aspek | GitHub Actions + Supabase | Cloudflare Workers + D1 |
|-------|--------------------------|------------------------|
| **Cold Start** | ~10s (install deps) | ~0ms (V8 isolate) |
| **Pricing** | Free tier terbatas | Free tier sangat generous |
| **Cron** | GitHub cron (delay ±15min) | CF Cron Trigger (presisi) |
| **Database** | Supabase free = 500MB, bisa pause | D1 free = 5GB, always on |
| **Frontend** | Perlu deploy terpisah | CF Pages built-in |
| **API** | Tidak ada REST API | Workers = instant API |
| **Edge** | Region tunggal | 300+ edge locations |
| **Satu Ekosistem** | ❌ 3 vendor terpisah | ✅ Semua di Cloudflare |
| **Biaya** | Free (tapi fragmented) | Free (unified) |

---

## ⚠️ PERUBAHAN TEKNIS YANG DIPERLUKAN

### 1. Database Schema: PostgreSQL → SQLite (D1)
- ❌ `UUID` → ✅ `TEXT` dengan UUID generate manual
- ❌ `JSONB` → ✅ `TEXT` (JSON string)
- ❌ `TIMESTAMPTZ` → ✅ `TEXT` (ISO 8601 string)
- ❌ `CREATE EXTENSION` → ✅ Tidak perlu
- ❌ `ARRAY_AGG` → ✅ `GROUP_CONCAT`
- ❌ `GIN index` → ✅ Regular index
- ❌ RLS Policy → ✅ Workers handles auth

### 2. Backend: Node.js Script → Cloudflare Worker
- ❌ `process.env` → ✅ `env` binding (Worker context)
- ❌ `axios` → ✅ Native `fetch` (Workers sudah punya)
- ❌ `rss-parser` (XML parser) → ✅ Lightweight XML parser
- ❌ `@supabase/supabase-js` → ✅ D1 binding langsung
- ❌ `dotenv` → ✅ `wrangler.toml` + secrets
- ❌ `groq-sdk` → ✅ Direct fetch ke Groq REST API
- ✅ `Promise.all` → tetap sama (Workers support async)

### 3. Frontend: Next.js → Next.js on Cloudflare Pages
- ❌ Supabase client → ✅ Fetch dari Workers API
- ✅ Next.js + Tailwind tetap sama
- ✅ Components tetap sama

### 4. Cron: GitHub Actions → Cloudflare Cron Trigger
- ❌ `.github/workflows/daily-digest.yml` → ✅ `scheduled()` handler
- Lebih presisi dan reliable

---

## 📁 STRUKTUR FILE BARU

```
openclaw-trend-digest/
├── worker/                    ← NEW: Cloudflare Worker (Backend)
│   ├── src/
│   │   ├── index.ts           ← Worker entry point (scheduled + fetch)
│   │   ├── scrapers/          ← Scrapers (refactored to use fetch)
│   │   ├── ai/                ← AI module (direct Groq REST)
│   │   ├── delivery/          ← Telegram + Discord senders
│   │   ├── database/          ← D1 operations
│   │   ├── api/               ← REST API routes for frontend
│   │   ├── types/             ← Shared types
│   │   └── utils/             ← Logger, helpers
│   ├── wrangler.toml          ← Cloudflare config + cron schedule
│   ├── schema.sql             ← D1 migration
│   ├── package.json
│   └── tsconfig.json
├── frontend/                  ← Cloudflare Pages (unchanged structure)
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   └── lib/
│   └── ...
└── README.md
```

---

**[PLANNING COMPLETE — EXECUTING MIGRATION]**
