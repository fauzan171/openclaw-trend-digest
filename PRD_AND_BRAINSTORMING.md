# 🚀 Comprehensive Product Requirements Document (PRD) & System Architecture
## Project Name: OpenClaw Trend Digest (AI-Powered Tech & News Curator)
**Document Status:** 🟢 Approved for Development | **Version:** 2.0 | **Author:** Ultimate Fullstack Architect

---

## 📑 Daftar Isi
1. [Executive Summary](#1-executive-summary)
2. [Problem Statement & The "Why"](#2-problem-statement--the-why)
3. [User Personas & Use Cases](#3-user-personas--use-cases)
4. [Core Features (Epics & User Stories)](#4-core-features-epics--user-stories)
5. [System Architecture & Data Flow](#5-system-architecture--data-flow)
6. [Database Schema Design](#6-database-schema-design)
7. [API & Integration Contracts](#7-api--integration-contracts)
8. [DevOps, CI/CD, & Automation Strategy](#8-devops-cicd--automation-strategy)
9. [The LinkedIn Pitch (Why Recruiters Will Love This)](#9-the-linkedin-pitch-why-recruiters-will-love-this)
10. [Phased Execution Plan (Sprint Roadmap)](#10-phased-execution-plan-sprint-roadmap)

---

## 1. Executive Summary
**OpenClaw Trend Digest** adalah sebuah sistem *AI Agent* otonom yang bertindak sebagai "Pemimpin Redaksi Pribadi". Sistem ini secara otomatis mengumpulkan ribuan *headline* berita dan tren media sosial setiap malam, menggunakan LLM (Large Language Model) untuk menyaring *noise* (clickbait, gosip), menggabungkan topik yang sama, menganalisis sentimen publik, dan mengirimkan "Morning Briefing" berdurasi 3 menit baca langsung ke Telegram/Discord pengguna atau channel tim pada jam 07:00 pagi.

**Goal Portofolio:** Menunjukkan kemampuan *Fullstack Engineering* tingkat lanjut yang mencakup integrasi AI (Agentic Workflow), Web Scraping, Data Engineering, API Integrations, dan *DevOps Automation* (CI/CD Cron Jobs).

---

## 2. Problem Statement & The "Why"
**Masalah Utama (Pain Points):**
1. **Information Overload & FOMO:** Profesional IT dan mahasiswa sering merasa tertinggal informasi (kudet), tetapi menghabiskan waktu berjam-jam di X/Twitter, Reddit, atau Portal Berita justru membuang waktu produktif dan merusak kesehatan mental (*doomscrolling*).
2. **Low-Quality Content:** 80% konten yang trending di media sosial adalah *noise* (gosip artis, drama politik tak berujung, clickbait). Hanya 20% yang benar-benar bernilai untuk karir dan wawasan (Tech, Ekonomi, Kebijakan Publik).
3. **Siloed Team Knowledge:** Dalam sebuah tim developer/startup, anggota tim sering kali tidak memiliki konteks industri yang sama karena sumber bacaan mereka berbeda-beda.

**Solusi (The "Aha!" Moment):**
Mengotomatisasi proses konsumsi informasi. Biarkan mesin/AI yang melakukan pekerjaan kotor (membaca ribuan *junk news*), sementara manusia hanya menikmati hasil kurasi (*insight*) tingkat tinggi yang sudah disintesis dengan indah.

---

## 3. User Personas & Use Cases

### Persona 1: "The Focused Engineer" (Personal Use)
- **Profil:** Software Engineer yang sedang melakukan *Digital Detox* (menghapus aplikasi sosmed dari HP).
- **Kebutuhan:** Ingin tahu jika ada framework baru yang rilis (misal: React 19), kerentanan keamanan global (CrowdStrike down), atau berita makro ekonomi tanpa harus melihat komentar *toxic* netizen.
- **Use Case:** Setiap pagi sambil ngopi, ia membaca 5 *bullet points* di Telegram pribadinya hasil kurasi AI.

### Persona 2: "The Agile Team Lead" (Teamwork/Collaboration Use)
- **Profil:** Tech Lead atau Product Manager di sebuah startup.
- **Kebutuhan:** Memastikan seluruh anggota tim (Frontend, Backend, UI/UX) memiliki wawasan industri yang seirama sebelum memulai *Daily Standup*.
- **Use Case:** Ia mengundang Bot OpenClaw ke dalam channel Slack/Discord `#industry-updates`. Bot mengirimkan rangkuman berita Tech & Bisnis setiap hari Senin dan Kamis pagi, memicu diskusi sehat antar anggota tim di kolom komentar channel.

---

## 4. Core Features (Epics & User Stories)

### Epic 1: Multi-Source Data Ingestion (The Scraper)
- **Story 1.1:** Sistem dapat mengambil top 50 post dari HackerNews API setiap 12 jam.
- **Story 1.2:** Sistem dapat membaca RSS Feed dari portal berita lokal terpercaya (TechInAsia ID, Kompas Tekno, dll).
- **Story 1.3:** Sistem dapat mengambil *trending topics* harian dari platform seperti X/Twitter atau Reddit (r/indonesia, r/programming).

### Epic 2: AI-Powered Curation & Synthesis (The Brain)
- **Story 2.1 (Deduplication):** AI dapat mengenali bahwa 5 artikel berbeda dari portal berita yang berbeda sebenarnya membahas 1 topik yang sama (misal: "Apple Rilis iPhone 16"), dan menggabungkannya menjadi 1 *item*.
- **Story 2.2 (Noise Filtering):** AI secara otomatis memberikan skor relevansi (1-10) pada setiap berita berdasarkan kriteria: Fokus pada Tech, Sains, Bisnis, Nasional. Berita gosip selebriti langsung di- *drop*.
- **Story 2.3 (Summarization & Sentiment):** Untuk setiap topik yang lolos filter, AI menulis 1 paragraf ringkasan objektif dan menyertakan "Sentimen Publik" (Positif/Negatif/Netral) berdasarkan komentar/judul.

### Epic 3: Automated Delivery (The Mouth)
- **Story 3.1:** Sistem dapat memformat hasil kurasi AI menjadi Markdown yang sangat rapi dan mudah dibaca (menggunakan Emoji, Bullet Points, dan Bold Text).
- **Story 3.2:** Sistem mengirimkan hasil tersebut melalui Telegram Bot API ke Chat ID spesifik.
- **Story 3.3:** Sistem mengirimkan hasil ke Discord Webhook channel tim.

### Epic 4: The Web Archive (The Showcase) - *Optional for Portfolio MVP*
- **Story 4.1:** Sebuah web Next.js minimalis (hanya 1 halaman) yang menampilkan sejarah "Morning Briefing" dari hari ke hari agar recruiter bisa melihat UI-nya tanpa menginstal Telegram/Discord.

---

## 5. System Architecture & Data Flow

Sistem ini didesain sebagai **Serverless Cron-Driven Architecture**. Tidak perlu menyewa VPS mahal yang menyala 24/7. Kita memanfaatkan GitHub Actions sebagai *orchestrator*.

```text
[Data Sources]        [Execution Engine]             [AI Processor]          [Delivery]
HackerNews API  -->                                                   --> Telegram Bot
RSS Feeds       -->   GitHub Actions (Cron)   <--->  Groq API (LLM)   --> Discord Webhook
Reddit/X API    -->   (Runs Node.js/TS Script)                        --> Supabase (DB Archive)
```

**Alur Eksekusi (Data Flow):**
1. **Trigger:** GitHub Actions *Cron Job* berjalan pada pukul 06:00 WIB (23:00 UTC).
2. **Extract:** Script Node.js (TypeScript) mengambil data mentah secara paralel (`Promise.all`) dari berbagai sumber API dan RSS.
3. **Transform (Pre-processing):** Script membersihkan HTML tags dan mengambil teks esensial saja untuk menghemat *token* AI.
4. **Load (To AI):** Data mentah dikirim ke API Groq (Model: `llama3-70b-8192` atau `gemma2-9b-it`) beserta *System Prompt* yang sangat spesifik sebagai "Editor in Chief".
5. **Parse:** AI mengembalikan respons dalam format JSON terstruktur (menggunakan "JSON Mode" pada LLM).
6. **Distribute:** Script Node.js mem- *parsing* JSON keluaran AI, merakitnya menjadi string Markdown yang indah, lalu memanggil *HTTP POST* ke Telegram API dan Discord Webhook.
7. **Archive:** (Opsional) Data JSON yang sudah rapi disimpan ke Supabase Database untuk ditampilkan di Web Next.js.

---

## 6. Database Schema Design (Supabase / PostgreSQL)

Jika kita ingin membuat fitur *Web Archive* (Epic 4), berikut adalah skema tabelnya:

**Table: `daily_digests`**
Menyimpan rangkuman harian secara utuh.
| Column Name    | Type         | Description                                      |
|----------------|--------------|--------------------------------------------------|
| `id`           | UUID (PK)    | Primary Key.                                     |
| `publish_date` | Date         | Tanggal briefing (e.g., 2026-08-12).             |
| `raw_markdown` | Text         | Hasil teks Markdown utuh yang dikirim ke Telegram|
| `created_at`   | Timestamp    | Waktu *record* dibuat.                           |

**Table: `digest_topics`** (Relasi 1-to-Many dari `daily_digests`)
Menyimpan *item* berita spesifik agar web bisa difilter (misal: "Tampilkan semua berita AI bulan ini").
| Column Name    | Type         | Description                                      |
|----------------|--------------|--------------------------------------------------|
| `id`           | UUID (PK)    | Primary Key.                                     |
| `digest_id`    | UUID (FK)    | Reference ke `daily_digests.id`.                 |
| `category`     | String       | "Tech", "Business", "National", "Science".       |
| `title`        | String       | Judul topik yang dibuat AI.                      |
| `summary`      | Text         | Paragraf ringkasan.                              |
| `sentiment`    | String       | "Positive", "Negative", "Neutral", "Mixed".      |
| `source_links` | JSONB        | Array URL sumber asli berita tersebut.           |

---

## 7. API & Integration Contracts

### A. Groq API (LLM) Payload Contract
Kita akan memaksa LLM mengembalikan format JSON yang pasti, bukan teks bebas.

**System Prompt (Draft):**
*"Anda adalah Editor-in-Chief senior untuk buletin teknologi dan bisnis. Tugas Anda adalah membaca raw data berikut, membuang berita gosip/clickbait, menggabungkan berita yang sama, dan mengembalikan 5 Topik Terpenting dalam format JSON."*

**Expected Output JSON dari AI:**
```json
{
  "date": "12 Agustus 2026",
  "topics": [
    {
      "category": "Technology",
      "headline": "Next.js 16 Rilis dengan Turbopack Final",
      "summary": "Vercel merilis versi stabil Turbopack, komunitas melaporkan waktu build turun drastis hingga 40%.",
      "sentiment": "Positive",
      "sources": ["https://news.ycombinator.com/item?id=..."]
    }
  ]
}
```

### B. Telegram Bot API Payload
`POST https://api.telegram.org/bot<TOKEN>/sendMessage`
```json
{
  "chat_id": "123456789",
  "text": "🔥 *Next.js 16 Rilis dengan Turbopack Final*\n_Sentimen: Positif_\nVercel merilis versi stabil...\n\n🔗 [Baca di HackerNews](https://...)",
  "parse_mode": "MarkdownV2"
}
```

---

## 8. DevOps, CI/CD, & Automation Strategy

Ini adalah bagian di mana kita "pamer" kemampuan *DevOps* dan *Teamwork infrastructure*:

1. **GitHub Actions for Cron:**
   File `.github/workflows/daily-run.yml` akan mengatur eksekusi otomatis.
   - Schedule: `cron: '0 23 * * *'` (Berjalan setiap jam 23:00 UTC / 06:00 WIB).
   - Environment Variables (Secrets): Menyimpan `GROQ_API_KEY`, `TELEGRAM_BOT_TOKEN`, `DISCORD_WEBHOOK_URL` secara aman di GitHub Secrets, bukan di hardcode.
2. **Dockerization:**
   Kita akan menyertakan `Dockerfile` tipe `Node:20-alpine` dan `docker-compose.yml`. Mengapa?
   - Agar *engineer* lain di tim (atau *recruiter*) yang ingin men- *deploy* bot ini di VPS lokal mereka (self-hosted) bisa melakukannya hanya dengan command `docker compose up -d`. Ini adalah *golden standard* dalam *Open Source Teamwork*.
3. **Linting & Formatting:**
   Menggunakan `ESLint`, `Prettier`, dan `Husky` (Pre-commit hooks) di *repository* agar kode TypeScript tetap bersih, standar yang wajib di *Enterprise Teamwork*.

---

## 9. The LinkedIn Pitch (Why Recruiters Will Love This)

*Copywriting* yang bisa Anda gunakan di LinkedIn saat proyek ini selesai:

> **"Digital Detox tanpa tertinggal zaman? Saya membangun AI-Powered Trend Digest Agent."** 🚀
> 
> "Bulan ini saya merasa *Information Overload* karena harus membaca Twitter, Reddit, dan Tech News tiap hari untuk *keep up* dengan industri. Solusinya? Daripada saya yang bekerja, saya membuat **AI Agent (terinspirasi dari konsep OpenClaw)** untuk bekerja untuk saya.
>
> Menggunakan arsitektur **Serverless (GitHub Actions)** dan **LLM (Groq Llama-3)**, Agent ini berjalan otonom setiap jam 1 pagi. Ia men- *scrape* ribuan API HackerNews dan RSS, membuang berita 'sampah/gosip', menganalisis sentimen, dan mengirimkan "Morning Briefing" 3 Menit ke Telegram/Discord pribadi saya jam 7 pagi.
>
> 💡 **The Best Part? (Teamwork Angle)**
> Tool ini sekarang saya desain agar mudah diintegrasikan ke channel Slack/Discord tim developer (lewat Docker/Webhook). Memastikan seluruh anggota tim memiliki *industry context* yang sama setiap pagi sebelum *Daily Standup*, tanpa ada satupun yang harus membuang waktu *scrolling* sosial media!
> 
> Tech Stack: TypeScript, Node.js, Groq API (LLM JSON Mode), GitHub Actions (Cron), Docker.
> Link Repo: [GitHub Link]

---

## 10. Phased Execution Plan (Sprint Roadmap)

Sebagai Fullstack Architect Anda, saya akan mengeksekusi ini dalam urutan logis berikut:

- [ ] **Sprint 1: The Engine & Scraper (Backend Core)**
  - Setup Node.js + TypeScript codebase (`npm init`, `tsc --init`).
  - Install dependencies: `axios`, `rss-parser`, `dotenv`.
  - Buat fungsi `fetchHackerNews()` dan `fetchRSS(url)`.
- [ ] **Sprint 2: The AI Brain (LLM Integration)**
  - Daftar dan dapatkan API Key dari Groq Console.
  - Buat file `ai-summarizer.ts` yang memanggil API Groq.
  - Kembangkan (Prompt Engineering) *System Prompt* agar outputnya stabil dalam bentuk JSON.
- [ ] **Sprint 3: The Delivery (Telegram & Discord)**
  - Setup Bot Telegram di BotFather, catat *Token* dan *Chat ID*.
  - Buat fungsi `formatToMarkdown(json)` dan `sendToTelegram(markdown)`.
  - Buat fungsi `sendToDiscord(markdown)`.
- [ ] **Sprint 4: DevOps & Automation (The Autopilot)**
  - Buat `Dockerfile` untuk opsi *self-hosting*.
  - Tulis `.github/workflows/run-agent.yml` agar *script* berjalan otomatis di server GitHub secara gratis selamanya.
- [ ] **Sprint 5: The Showcase UI (Opsional)**
  - Inisialisasi `npx create-next-app@latest frontend`.
  - Desain UI minimalis (mirip koran digital) menggunakan TailwindCSS.

---
**[END OF PRD]** - *Architect is ready to execute Sprint 1 upon your command.*
