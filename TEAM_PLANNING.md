# 📋 SDLC TEAM PLANNING DOCUMENT
## Project: OpenClaw Trend Digest
### Version: 1.0 | Date: 2026-03-01 | Status: 🟡 Planning Phase

---

```
  ____  ____  _     ____   _____ _____    _    __  __
 / ___||  _ \| |   / ___| |_   _| ____|  / \  |  \/  |
 \___ \| | | | |  | |       | | |  _|   / _ \ | |\/| |
  ___) | |_| | |__| |___    | | | |___ / ___ \| |  | |
 |____/|____/|_____\____|   |_| |_____/_/   \_\_|  |_|

```

---

## 🏛️ ORGANISASI TIM & ROLE ASSIGNMENT

### Tim 1: 🔧 Data Engineering Team
**Lead:** Data Engineer
**Tanggung Jawab:** Mengumpulkan data mentah dari berbagai sumber (API, RSS, Web Scraping)
**Deliverables:**
- `src/scrapers/hackernews.ts` — HackerNews API Fetcher
- `src/scrapers/rss-feed.ts` — RSS Feed Parser (multi-source)
- `src/scrapers/reddit.ts` — Reddit API Fetcher
- `src/scrapers/index.ts` — Orchestrator: menjalankan semua scraper secara paralel
- `src/types/index.ts` — Type definitions (shared contracts)
- `src/utils/logger.ts` — Structured logging utility
- `src/utils/config.ts` — Environment config loader & validator

**Tech Stack:** TypeScript, Axios, rss-parser, Node.js APIs
**Estimated Time:** Sprint 1 (hari 1-2)

---

### Tim 2: 🧠 AI Engineering Team
**Lead:** AI/ML Engineer
**Tanggung Jawab:** Integrasi LLM, Prompt Engineering, JSON Mode parsing
**Deliverables:**
- `src/ai/prompts.ts` — System prompts & prompt templates
- `src/ai/summarizer.ts` — Groq API integration + AI curation logic
- `src/ai/parser.ts` — Response validator & JSON parser (Zod schema)

**Tech Stack:** Groq SDK, LLM (llama3-70b / gemma2-9b), Prompt Engineering
**Estimated Time:** Sprint 2 (hari 2-3)
**Dependencies:** Menunggu type definitions dari Tim 1

---

### Tim 3: 📡 Delivery & Integration Team
**Lead:** Backend Engineer
**Tanggung Jawab:** Formatting output, delivery ke Telegram & Discord
**Deliverables:**
- `src/delivery/formatter.ts` — Markdown formatter (beautifier)
- `src/delivery/telegram.ts` — Telegram Bot API sender
- `src/delivery/discord.ts` — Discord Webhook sender
- `src/delivery/index.ts` — Delivery orchestrator (multi-channel)

**Tech Stack:** Axios (HTTP), Telegram Bot API, Discord Webhook API
**Estimated Time:** Sprint 3 (hari 3-4)
**Dependencies:** Menunggu AI output contract dari Tim 2

---

### Tim 4: 🗄️ Database & Archive Team
**Lead:** Database Engineer
**Tanggung Jawab:** Supabase integration, data persistence
**Deliverables:**
- `src/archive/supabase.ts` — Supabase client & CRUD operations
- `src/archive/schema.sql` — SQL migration script (table creation)

**Tech Stack:** Supabase JS SDK, PostgreSQL
**Estimated Time:** Sprint 3-4 (hari 3-4)
**Dependencies:** Menunggu type definitions dari Tim 1

---

### Tim 5: ⚙️ DevOps & Automation Team
**Lead:** DevOps Engineer
**Tanggung Jawab:** CI/CD, Docker, GitHub Actions, Code Quality
**Deliverables:**
- `.github/workflows/daily-digest.yml` — Cron job workflow
- `.github/workflows/ci.yml` — CI pipeline (lint, test, typecheck)
- `Dockerfile` — Production container image
- `docker-compose.yml` — Self-hosting setup
- `.husky/pre-commit` — Pre-commit hooks

**Tech Stack:** GitHub Actions, Docker, Husky, ESLint, Prettier
**Estimated Time:** Sprint 4 (hari 4-5)
**Dependencies:** Semua tim harus selesai

---

### Tim 6: 🎨 Frontend & UI Team
**Lead:** Frontend Engineer
**Tanggung Jawab:** Web Archive showcase (Next.js)
**Deliverables:**
- `frontend/` — Next.js app with Tailwind CSS
- Landing page + digest archive viewer
- Responsive design (Mobile First)

**Tech Stack:** Next.js, React, Tailwind CSS, TypeScript
**Estimated Time:** Sprint 5 (hari 5-6)
**Dependencies:** Menunggu Supabase schema dari Tim 4

---

### Tim 7: 🧪 QA & Testing Team
**Lead:** QA Engineer
**Tanggung Jawab:** Unit tests, integration tests, code review
**Deliverables:**
- `src/__tests__/scrapers.test.ts`
- `src/__tests__/ai.test.ts`
- `src/__tests__/delivery.test.ts`
- `src/__tests__/integration.test.ts`

**Tech Stack:** Vitest, Mock APIs
**Estimated Time:** Paralel dengan setiap sprint
**Dependencies:** Menulis test segera setelah setiap modul selesai

---

### Tim 8: 🏗️ System Architect (Orchestrator)
**Lead:** Fullstack Architect (saya sendiri)
**Tanggung Jawab:** Main orchestrator, entry point, integrasi semua modul
**Deliverables:**
- `src/index.ts` — Main entry point (pipeline orchestrator)

**Tech Stack:** TypeScript
**Estimated Time:** Sprint 4 (setelah semua modul siap)
**Dependencies:** Semua tim

---

## 📊 GANTT CHART — PARALLEL EXECUTION PLAN

```
Day 1-2    ████████████████░░░░░░░░░░░░░░░░░░░░░░░░  Tim 1: Data Engineering
Day 1-2    ████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  Tim 7: QA (Unit Tests - Scrapers)
Day 2-3    ░░░░░░░░████████████████░░░░░░░░░░░░░░░░░  Tim 2: AI Engineering
Day 2-3    ░░░░░░░░████████░░░░░░░░░░░░░░░░░░░░░░░░░  Tim 7: QA (Unit Tests - AI)
Day 3-4    ░░░░░░░░░░░░░░░░████████████████░░░░░░░░░  Tim 3: Delivery Team
Day 3-4    ░░░░░░░░░░░░░░░░████████████████░░░░░░░░░  Tim 4: Database Team (PARALLEL)
Day 3-4    ░░░░░░░░░░░░░░░░████████░░░░░░░░░░░░░░░░░  Tim 7: QA (Unit Tests - Delivery)
Day 4-5    ░░░░░░░░░░░░░░░░░░░░░░░░████████████████░  Tim 5: DevOps (Docker, CI/CD)
Day 4-5    ░░░░░░░░░░░░░░░░░░░░░░░░████████████████░  Tim 8: System Integration
Day 5-6    ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░████████░  Tim 6: Frontend UI
Day 6      ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░████  Tim 7: Integration Tests (FINAL)
```

---

## 🔗 DEPENDENCY GRAPH

```
Tim 1 (Data Eng) ─────┬──────> Tim 2 (AI Eng) ───────> Tim 3 (Delivery)
   │                   │                                      │
   │                   └──────> Tim 4 (DB/Archive) ──────────┤
   │                                                          │
   └──> Tim 7 (QA) ─── runs parallel with each ──────────────┤
                                                              │
                                     Tim 5 (DevOps) <────────┤
                                     Tim 8 (Architect) <──────┘
                                           │
                                           └──────> Tim 6 (Frontend)
```

---

## 📝 DEFINITION OF DONE (DoD) PER TIM

| Tim | Kriteria Selesai |
|-----|-----------------|
| Tim 1 | Semua scraper bisa dipanggil dan return data sesuai `RawArticle[]` type |
| Tim 2 | AI menerima raw data → return JSON terstruktur `DigestOutput` yang valid |
| Tim 3 | Markdown terformat rapi dikirim ke Telegram & Discord tanpa error |
| Tim 4 | Data tersimpan & bisa di-query dari Supabase |
| Tim 5 | GitHub Actions cron berjalan, Docker build success |
| Tim 6 | Web menampilkan digest history, responsive, accessible |
| Tim 7 | Coverage ≥ 80%, semua test pass |
| Tim 8 | `npm run dev` → end-to-end pipeline berjalan sukses |

---

## 🚦 EXECUTION ORDER (COMMAND SEQUENCE)

Saya akan mengeksekusi dalam urutan berikut:

### Phase 1: Foundation (Tim 1 — Data Engineering)
1. ✅ Buat shared types (`src/types/index.ts`)
2. ✅ Buat utility modules (`logger.ts`, `config.ts`)
3. ✅ Implementasi HackerNews scraper
4. ✅ Implementasi RSS Feed scraper
5. ✅ Implementasi Reddit scraper
6. ✅ Buat scraper orchestrator

### Phase 2: Intelligence (Tim 2 — AI Engineering)
7. ✅ Desain System Prompt (prompt engineering)
8. ✅ Implementasi Groq API integration
9. ✅ Buat JSON response parser & validator

### Phase 3: Output (Tim 3 + Tim 4 — Paralel)
10. ✅ Implementasi Markdown formatter
11. ✅ Implementasi Telegram sender
12. ✅ Implementasi Discord sender
13. ✅ Buat Supabase schema & client

### Phase 4: Integration (Tim 8 + Tim 5 — Paralel)
14. ✅ Buat main orchestrator (`index.ts`)
15. ✅ Buat Dockerfile & docker-compose
16. ✅ Buat GitHub Actions workflows

### Phase 5: Quality (Tim 7)
17. ✅ Unit tests untuk setiap modul
18. ✅ Integration test end-to-end

### Phase 6: Showcase (Tim 6)
19. ✅ Setup Next.js + Tailwind
20. ✅ Build digest archive UI

---

**[PLANNING COMPLETE — READY TO EXECUTE]**
**Menunggu konfirmasi untuk memulai Phase 1...**

> 💡 Seluruh tim akan bekerja secara paralel sesuai dependency graph.
> Setiap module menggunakan strict TypeScript typing.
> Setiap deliverable memiliki unit test.
