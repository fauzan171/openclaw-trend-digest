# 📖 PANDUAN SETUP LENGKAP — Dari Nol Sampai Live
## OpenClaw Trend Digest
### Tanggal: 1 Maret 2026 | Estimasi waktu: 30-45 menit

---

```
  ___  ___ _____ _   _ ___    ____  _   _ ___ ____  _____
 / __|/ _ \_   _| | | | _ \  / ___|| | | |_ _|  _ \| ____|
 \__ \  __/ | | | |_| |  _/ | |  _ | | | || || | | |  _|
 |___/\___| |_|  \___/|_|   | |_| || |_| || || |_| | |___
                              \____| \___/|___|____/|_____|
```

---

## 📋 DAFTAR ISI

1. [Persiapan Awal](#1-persiapan-awal)
2. [Mendapatkan Groq API Key (AI/LLM)](#2-mendapatkan-groq-api-key)
3. [Membuat Telegram Bot](#3-membuat-telegram-bot)
4. [Membuat Discord Webhook](#4-membuat-discord-webhook)
5. [Setup Cloudflare Account](#5-setup-cloudflare-account)
6. [Install Wrangler CLI](#6-install-wrangler-cli)
7. [Setup Cloudflare D1 Database](#7-setup-cloudflare-d1-database)
8. [Set Secrets & Deploy Worker](#8-set-secrets--deploy-worker)
9. [Deploy Frontend ke Cloudflare Pages](#9-deploy-frontend-ke-cloudflare-pages)
10. [Testing & Verifikasi](#10-testing--verifikasi)
11. [Troubleshooting](#11-troubleshooting)

---

## 1. PERSIAPAN AWAL

### Yang Anda Butuhkan:
- ✅ **Node.js 20+** → Cek: `node --version`
- ✅ **npm** → Cek: `npm --version`
- ✅ **Git** → Cek: `git --version`
- ✅ **Browser** → Untuk registrasi akun
- ✅ **HP** → Untuk setup Telegram

### Install Node.js (jika belum):
```bash
# macOS (via Homebrew)
brew install node

# Atau download dari https://nodejs.org/en/download
```

### Clone Project:
```bash
cd ~/Projects   # atau folder mana saja
git clone <URL_REPO_ANDA>
cd openclaw-trend-digest
```

---

## 2. MENDAPATKAN GROQ API KEY

Groq adalah penyedia AI/LLM yang **GRATIS** dan **super cepat** (inference tercepat di dunia).

### Langkah-langkah:

```
┌─────────────────────────────────────────────────────┐
│  STEP 1: Buka browser, pergi ke:                    │
│  🌐 https://console.groq.com                        │
└─────────────────────────────────────────────────────┘
```

**Step 1:** Buka **https://console.groq.com**

**Step 2:** Klik **"Sign Up"** (bisa pakai Google/GitHub account)
```
   ┌──────────────────────────────┐
   │      Welcome to Groq         │
   │                              │
   │   [Sign up with Google]      │  ← Klik ini (paling mudah)
   │   [Sign up with GitHub]      │
   │   [Sign up with Email]       │
   │                              │
   └──────────────────────────────┘
```

**Step 3:** Setelah login, klik **"API Keys"** di sidebar kiri

**Step 4:** Klik **"Create API Key"**
```
   ┌──────────────────────────────────────┐
   │  Create API Key                       │
   │                                       │
   │  Name: [openclaw-digest]              │  ← Isi nama
   │                                       │
   │  [Create API Key]                     │  ← Klik
   └──────────────────────────────────────┘
```

**Step 5:** **SALIN API Key yang muncul!** (hanya muncul SEKALI!)
```
   ┌──────────────────────────────────────────────┐
   │  ✅ API Key Created!                          │
   │                                               │
   │  gsk_aBcDeFgHiJkLmNoPqRsTuVwXyZ1234567890   │
   │                                               │
   │  ⚠️ Copy sekarang! Tidak bisa dilihat lagi!   │
   └──────────────────────────────────────────────┘
```

**Step 6:** Simpan key di tempat aman (notepad/1Password)
```
📝 CATAT:
GROQ_API_KEY = gsk_aBcDeFgHiJkLmNoPqRsTuVwXyZ1234567890
```

### 💰 Pricing Groq:
- **Free Tier:** 14.400 requests/hari, 6.000 tokens/menit → CUKUP BANGET
- Untuk project ini, kita hanya pakai **1 request/hari**

---

## 3. MEMBUAT TELEGRAM BOT

Kita butuh 2 hal: **Bot Token** dan **Chat ID**.

### 3A. Membuat Bot & Mendapatkan Token

```
┌─────────────────────────────────────────────────────┐
│  STEP 1: Buka Telegram, cari @BotFather             │
│  🌐 https://t.me/BotFather                          │
└─────────────────────────────────────────────────────┘
```

**Step 1:** Buka Telegram di HP/Desktop

**Step 2:** Cari **@BotFather** (ada tanda centang biru ✓)
```
   🔍 Search: BotFather
   
   ┌──────────────────────────────┐
   │  🤖 BotFather  ✓             │
   │  The official bot manager    │
   └──────────────────────────────┘
```

**Step 3:** Kirim pesan: `/newbot`
```
   Anda:     /newbot
   
   BotFather: Alright, a new bot. How are we going to call it?
              Please choose a name for your bot.
```

**Step 4:** Kirim nama bot: `OpenClaw Trend Digest`
```
   Anda:     OpenClaw Trend Digest
   
   BotFather: Good. Now let's choose a username for your bot.
              It must end in 'bot'. Like this: TetrisBot
```

**Step 5:** Kirim username bot: `openclaw_digest_bot` (harus unik & akhiran `bot`)
```
   Anda:     openclaw_digest_bot
   
   BotFather: Done! Congratulations on your new bot.
              
              Use this token to access the HTTP API:
              1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
              
              ⚠️ Keep your token secure!
```

**Step 6:** **SALIN Token yang muncul!**
```
📝 CATAT:
TELEGRAM_BOT_TOKEN = 1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
```

### 3B. Mendapatkan Chat ID

Chat ID = "alamat" ke mana bot mengirim pesan.

**Step 1:** Buka bot Anda di Telegram, klik **"Start"**
```
   ┌──────────────────────────────┐
   │  🤖 OpenClaw Trend Digest    │
   │                              │
   │      [▶ START]               │  ← Klik ini!
   │                              │
   └──────────────────────────────┘
```

**Step 2:** Kirim pesan apa saja ke bot (misal: `hello`)

**Step 3:** Buka browser, akses URL berikut (ganti TOKEN dengan token Anda):
```
https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/getUpdates

Contoh:
https://api.telegram.org/bot1234567890:ABCdefGHIjklMNOpqrsTUVwxyz/getUpdates
```

**Step 4:** Anda akan melihat JSON response seperti ini:
```json
{
  "ok": true,
  "result": [
    {
      "message": {
        "chat": {
          "id": 987654321,        ← INI CHAT ID ANDA!
          "first_name": "Mekari",
          "type": "private"
        }
      }
    }
  ]
}
```

**Step 5:** **SALIN Chat ID!**
```
📝 CATAT:
TELEGRAM_CHAT_ID = 987654321
```

### 💡 Tips: Untuk Group Chat
Jika ingin bot mengirim ke Group:
1. Tambahkan bot ke group
2. Kirim pesan di group
3. Akses `/getUpdates` lagi
4. Chat ID group biasanya negatif: `-1001234567890`

---

## 4. MEMBUAT DISCORD WEBHOOK

### Langkah-langkah:

```
┌─────────────────────────────────────────────────────┐
│  Buka Discord → Server Anda → Channel Settings      │
└─────────────────────────────────────────────────────┘
```

**Step 1:** Buka **Discord** (Desktop/Browser)

**Step 2:** Pergi ke **Server** di mana Anda ingin menerima digest

**Step 3:** Klik kanan pada **Channel** yang dituju → **"Edit Channel"**
```
   ┌──────────────────────────────┐
   │  #industry-updates           │
   │  ─────────────────           │
   │  📌 Pin Message              │
   │  🔔 Notification Settings    │
   │  ✏️  Edit Channel            │  ← Klik ini
   └──────────────────────────────┘
```

**Step 4:** Klik tab **"Integrations"** di sidebar kiri

**Step 5:** Klik **"Webhooks"** → **"New Webhook"**
```
   ┌──────────────────────────────────────┐
   │  Integrations                         │
   │                                       │
   │  Webhooks                             │
   │  ┌──────────────────────────────┐    │
   │  │  🤖 OpenClaw Digest          │    │
   │  │  Posts to: #industry-updates  │    │
   │  │                              │    │
   │  │  [Copy Webhook URL]          │    │  ← Klik ini!
   │  └──────────────────────────────┘    │
   │                                       │
   │  [+ New Webhook]                      │
   └──────────────────────────────────────┘
```

**Step 6:** (Opsional) Ganti nama webhook menjadi **"OpenClaw Digest"**

**Step 7:** Klik **"Copy Webhook URL"**

**Step 8:** **SALIN URL!**
```
📝 CATAT:
DISCORD_WEBHOOK_URL = https://discord.com/api/webhooks/1234567890/aBcDeFgHiJkLmNoPqRsTuVwXyZ
```

### ⚠️ Jika Belum Punya Server Discord:
1. Buka Discord → Klik `+` di sidebar kiri → "Create My Own"
2. Pilih "For me and my friends"
3. Beri nama server, misal "Tech Updates"
4. Buat channel `#digest`, lalu ikuti langkah di atas

---

## 5. SETUP CLOUDFLARE ACCOUNT

```
┌─────────────────────────────────────────────────────┐
│  🌐 https://dash.cloudflare.com/sign-up             │
└─────────────────────────────────────────────────────┘
```

**Step 1:** Buka **https://dash.cloudflare.com/sign-up**

**Step 2:** Daftar dengan Email & Password
```
   ┌──────────────────────────────────────┐
   │       Create a Cloudflare Account     │
   │                                       │
   │  Email:    [anda@email.com]           │
   │  Password: [**************]           │
   │                                       │
   │  [Sign Up]                            │
   └──────────────────────────────────────┘
```

**Step 3:** Verifikasi email (cek inbox)

**Step 4:** Login ke dashboard → **Anda sudah di Free Plan** (cukup untuk project ini!)

### 💰 Cloudflare Free Tier:
| Service | Free Limit | Kebutuhan Kita |
|---------|-----------|----------------|
| Workers | 100.000 requests/hari | ~1 request/hari |
| D1 | 5GB storage, 5M rows read/hari | ~7 rows/hari |
| Pages | Unlimited sites | 1 site |
| Cron | Unlimited triggers | 1 trigger/hari |

**Kesimpulan: 100% GRATIS selamanya untuk project ini.**

---

## 6. INSTALL WRANGLER CLI

Wrangler = CLI tool untuk deploy ke Cloudflare.

### Step 1: Install Wrangler
```bash
# Dari folder project
cd ~/openclaw-trend-digest/worker
npm install    # ini sudah install wrangler sebagai devDependency
```

### Step 2: Login ke Cloudflare
```bash
npx wrangler login
```

Ini akan membuka browser:
```
   ┌──────────────────────────────────────────┐
   │  Wrangler wants to access your           │
   │  Cloudflare account                       │
   │                                           │
   │  [Allow]          [Deny]                  │
   │                                           │
   └──────────────────────────────────────────┘
   
   Klik [Allow] → Browser akan menampilkan:
   "Successfully configured Wrangler"
```

### Step 3: Verifikasi Login
```bash
npx wrangler whoami

# Output yang benar:
# ⛅️ wrangler 4.x.x
# Getting User settings...
# 👋 You are logged in with an OAuth Token, associated with the email anda@email.com!
```

---

## 7. SETUP CLOUDFLARE D1 DATABASE

### Step 1: Buat Database
```bash
cd ~/openclaw-trend-digest/worker

npx wrangler d1 create openclaw-digest-db
```

Output:
```
✅ Successfully created DB 'openclaw-digest-db' in region APAC

[[d1_databases]]
binding = "DB"
database_name = "openclaw-digest-db"
database_id = "xxxx-yyyy-zzzz-1234-abcdef567890"   ← SALIN INI!
```

### Step 2: Update wrangler.toml dengan database_id
```bash
# Buka file wrangler.toml dan ganti YOUR_DATABASE_ID_HERE
# dengan database_id dari output di atas
```

Atau jalankan command ini (ganti ID-nya):
```bash
# Contoh — ganti xxxx-yyyy-zzzz dengan ID asli Anda:
sed -i '' 's/YOUR_DATABASE_ID_HERE/xxxx-yyyy-zzzz-1234-abcdef567890/' wrangler.toml
```

### Step 3: Jalankan Migration (Buat tabel)

```bash
# Lokal dulu (untuk testing)
npx wrangler d1 execute openclaw-digest-db --local --file=./schema.sql

# Production (di Cloudflare)
npx wrangler d1 execute openclaw-digest-db --remote --file=./schema.sql
```

Output yang benar:
```
🌀 Executing on remote database openclaw-digest-db (xxxx-yyyy-zzzz):
🌀 To execute on your local development database, remove the --remote flag.
✅ OK (3 tables created, 5 indexes created)
```

### Step 4: Verifikasi Tabel
```bash
npx wrangler d1 execute openclaw-digest-db --remote --command="SELECT name FROM sqlite_master WHERE type='table'"
```

Output:
```
┌────────────────┐
│ name           │
├────────────────┤
│ daily_digests  │
│ digest_topics  │
└────────────────┘
```

---

## 8. SET SECRETS & DEPLOY WORKER

### Step 1: Masukkan Semua API Keys sebagai Secrets

Secrets = environment variables yang **terenkripsi** di Cloudflare. Tidak bisa dibaca siapapun.

```bash
cd ~/openclaw-trend-digest/worker

# 1. Groq API Key
npx wrangler secret put GROQ_API_KEY
# → Paste: gsk_aBcDeFgHiJkLmNoPqRsTuVwXyZ1234567890
# → Enter

# 2. Telegram Bot Token
npx wrangler secret put TELEGRAM_BOT_TOKEN
# → Paste: 1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
# → Enter

# 3. Telegram Chat ID
npx wrangler secret put TELEGRAM_CHAT_ID
# → Paste: 987654321
# → Enter

# 4. Discord Webhook URL
npx wrangler secret put DISCORD_WEBHOOK_URL
# → Paste: https://discord.com/api/webhooks/xxxx/yyyy
# → Enter
```

Setiap command akan menampilkan:
```
🌀 Creating the secret for the Worker "openclaw-trend-digest"
✅ Success! Uploaded secret GROQ_API_KEY
```

### Step 2: Test Lokal Dulu (Opsional tapi Recommended)
```bash
# Buat file .dev.vars untuk development lokal
cat > .dev.vars << 'EOF'
GROQ_API_KEY=gsk_YOUR_KEY_HERE
TELEGRAM_BOT_TOKEN=YOUR_BOT_TOKEN
TELEGRAM_CHAT_ID=YOUR_CHAT_ID
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/YOUR_WEBHOOK
EOF

# Jalankan lokal
npx wrangler dev
```

Buka browser → **http://localhost:8787** → Anda akan melihat:
```json
{
  "name": "OpenClaw Trend Digest",
  "version": "2.0.0",
  "endpoints": {
    "health": "/api/health",
    "trigger": "POST /api/trigger"
  }
}
```

Test manual trigger:
```bash
curl -X POST http://localhost:8787/api/trigger
```

### Step 3: DEPLOY! 🚀
```bash
npx wrangler deploy
```

Output:
```
⛅️ wrangler 4.x.x
Total Upload: 45.2 KiB / gzip: 12.8 KiB
Uploaded openclaw-trend-digest (2.5 sec)
Published openclaw-trend-digest (0.3 sec)
  https://openclaw-trend-digest.YOUR_SUBDOMAIN.workers.dev
  schedule: 0 23 * * *
Current Deployment ID: abc-123-def-456

✅ Worker deployed successfully!
```

**SALIN URL Worker yang muncul!**
```
📝 CATAT:
WORKER_URL = https://openclaw-trend-digest.YOUR_SUBDOMAIN.workers.dev
```

---

## 9. DEPLOY FRONTEND KE CLOUDFLARE PAGES

### Step 1: Build Frontend
```bash
cd ~/openclaw-trend-digest/frontend

npm install

# Set API URL (ganti dengan Worker URL Anda)
export NEXT_PUBLIC_API_URL=https://openclaw-trend-digest.YOUR_SUBDOMAIN.workers.dev

npm run build
```

### Step 2: Deploy ke Cloudflare Pages
```bash
npx wrangler pages deploy out --project-name=openclaw-digest
```

Pertama kali akan membuat project baru:
```
✅ Successfully created the 'openclaw-digest' project.
🌎 Deploying...
✅ Deployment complete!

🔗 https://openclaw-digest.pages.dev         ← URL Frontend Anda!
```

### 💡 Alternatif: Connect GitHub (Auto Deploy)

1. Buka **https://dash.cloudflare.com** → **Workers & Pages** → **Create**
2. Pilih tab **"Pages"** → **"Connect to Git"**
3. Pilih repo GitHub Anda
4. Setting:
   ```
   Framework preset: Next.js
   Build command:    npm run build
   Build directory:  out
   Root directory:   frontend
   
   Environment Variables:
   NEXT_PUBLIC_API_URL = https://openclaw-trend-digest.YOUR.workers.dev
   ```
5. Klik **"Save and Deploy"**
6. Setiap push ke `main` → auto deploy!

---

## 10. TESTING & VERIFIKASI

### ✅ Test 1: Health Check
```bash
curl https://openclaw-trend-digest.YOUR_SUBDOMAIN.workers.dev/api/health
```
Expected:
```json
{"status":"ok","service":"OpenClaw Trend Digest","runtime":"Cloudflare Workers"}
```

### ✅ Test 2: Manual Trigger (Jalankan Pipeline!)
```bash
curl -X POST https://openclaw-trend-digest.YOUR_SUBDOMAIN.workers.dev/api/trigger
```
Tunggu ~15-30 detik. Expected:
```json
{
  "startedAt": "2026-03-01T...",
  "success": true,
  "scraping": { "totalArticles": 150 },
  "digest": { "topics": [ ... ] },
  "deliveries": [
    { "channel": "telegram", "success": true },
    { "channel": "discord", "success": true },
    { "channel": "d1", "success": true }
  ]
}
```

### ✅ Test 3: Cek Telegram
Buka Telegram → Bot Anda → Seharusnya ada pesan Morning Briefing!
```
   ┌──────────────────────────────────────┐
   │  🤖 OpenClaw Trend Digest Bot        │
   │                                       │
   │  ☀️ *OPENCLAW TREND DIGEST*           │
   │  📅 1 Maret 2026                      │
   │                                       │
   │  📊 150 artikel → 7 topik             │
   │                                       │
   │  ⚛️ 1. React 20 Beta Dirilis...       │
   │  🔒 2. Kerentanan di OpenSSL...       │
   │  🤖 3. Google Gemini 3.0...           │
   │  ...                                  │
   └──────────────────────────────────────┘
```

### ✅ Test 4: Cek Discord
Buka Discord → Channel Anda → Ada embed digest!

### ✅ Test 5: Cek Database
```bash
cd ~/openclaw-trend-digest/worker

npx wrangler d1 execute openclaw-digest-db --remote \
  --command="SELECT id, publish_date, created_at FROM daily_digests ORDER BY created_at DESC LIMIT 5"
```

### ✅ Test 6: Cek API Endpoint
```bash
curl https://openclaw-trend-digest.YOUR_SUBDOMAIN.workers.dev/api/digests
```

### ✅ Test 7: Buka Frontend
Buka browser → **https://openclaw-digest.pages.dev**

### ✅ Test 8: Verifikasi Cron Schedule
```bash
# Lihat cron trigger yang terdaftar
npx wrangler deployments list
```

Atau cek di Dashboard:
1. Buka **https://dash.cloudflare.com**
2. **Workers & Pages** → **openclaw-trend-digest**
3. Tab **"Triggers"** → Anda akan melihat:
```
   Cron Triggers:
   ┌────────────────────┬──────────────────────┐
   │ Cron Expression    │ Description          │
   ├────────────────────┼──────────────────────┤
   │ 0 23 * * *         │ Every day at 23:00   │
   │                    │ UTC (06:00 WIB)      │
   └────────────────────┴──────────────────────┘
```

---

## 11. TROUBLESHOOTING

### ❌ "Error: Missing required secret GROQ_API_KEY"
```bash
# Re-set secret
npx wrangler secret put GROQ_API_KEY
# Paste key → Enter
```

### ❌ "Groq API 401: Invalid API Key"
- Pastikan key dimulai dengan `gsk_`
- Buat key baru di https://console.groq.com/keys

### ❌ "Telegram 401: Unauthorized"  
- Token salah. Buat bot baru di @BotFather
- Pastikan format: `1234567890:ABCxxxxxxxxx`

### ❌ "Telegram 400: Chat not found"
- Pastikan Anda sudah klik **"Start"** di bot
- Cek Chat ID di: `https://api.telegram.org/bot<TOKEN>/getUpdates`

### ❌ "D1 Error: no such table: daily_digests"
```bash
# Jalankan migration ulang
npx wrangler d1 execute openclaw-digest-db --remote --file=./schema.sql
```

### ❌ "wrangler: command not found"
```bash
# Gunakan npx
npx wrangler deploy

# Atau install global
npm install -g wrangler
```

### ❌ Frontend tidak menampilkan data
- Pastikan `NEXT_PUBLIC_API_URL` diset saat build
- Cek CORS: Worker sudah handle `Access-Control-Allow-Origin: *`

### 📊 Melihat Logs Worker (Debugging)
```bash
# Live logs (real-time)
npx wrangler tail

# Atau di Dashboard:
# Workers & Pages → openclaw-trend-digest → Logs
```

---

## 📝 RINGKASAN SEMUA CREDENTIALS

Simpan di tempat aman (1Password, Bitwarden, atau file encrypted):

```
╔══════════════════════════════════════════════════════════════╗
║  🔐 OPENCLAW TREND DIGEST — CREDENTIALS                     ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  GROQ_API_KEY        = gsk_xxxxxxxxxxxxxx                    ║
║  TELEGRAM_BOT_TOKEN  = 1234567890:ABCxxxxx                   ║
║  TELEGRAM_CHAT_ID    = 987654321                             ║
║  DISCORD_WEBHOOK_URL = https://discord.com/api/webhooks/...  ║
║                                                              ║
║  D1_DATABASE_ID      = xxxx-yyyy-zzzz-1234                   ║
║  WORKER_URL          = https://openclaw-trend-digest.xxx.dev ║
║  FRONTEND_URL        = https://openclaw-digest.pages.dev     ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
```

---

## 🎯 CHECKLIST FINAL

Sebelum menganggap setup selesai, pastikan semua ✅:

- [ ] Groq API Key didapat dan bisa generate teks
- [ ] Telegram Bot dibuat, token disalin, Chat ID ditemukan
- [ ] Discord Webhook dibuat dan URL disalin
- [ ] Cloudflare account aktif
- [ ] `wrangler login` berhasil
- [ ] D1 Database dibuat, `database_id` diisi di `wrangler.toml`
- [ ] Schema SQL dijalankan (tabel `daily_digests` & `digest_topics` ada)
- [ ] 4 secrets di-set via `wrangler secret put`
- [ ] Worker deployed (`npx wrangler deploy` sukses)
- [ ] `/api/health` return `"status": "ok"`
- [ ] Manual trigger (`POST /api/trigger`) berhasil
- [ ] Pesan muncul di Telegram
- [ ] Pesan muncul di Discord
- [ ] Data masuk ke D1 database
- [ ] Frontend deployed & bisa diakses
- [ ] Cron trigger terdaftar di Dashboard (06:00 WIB)

**Jika semua ✅ → Selamat! 🎉 Bot AI Anda akan berjalan setiap pagi secara otomatis!**

---

## ⏰ FLOW HARIAN (Setelah Setup)

```
23:00 UTC (06:00 WIB)
    │
    ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  CF Cron     │───►│  Scrape     │───►│  AI Groq    │
│  Trigger     │    │  HN+RSS+RD  │    │  Curate     │
└─────────────┘    └─────────────┘    └──────┬──────┘
                                              │
                        ┌─────────────────────┼─────────────┐
                        ▼                     ▼             ▼
                  ┌──────────┐         ┌──────────┐   ┌──────────┐
                  │ Telegram │         │ Discord  │   │    D1    │
                  │ 📱 Bot   │         │ 💬 Hook  │   │ 🗄️ Save  │
                  └──────────┘         └──────────┘   └──────────┘

07:00 WIB — Anda bangun, baca briefing 3 menit sambil ☕
```

---

**[END OF SETUP GUIDE]**

> 💡 **Pertanyaan?** Saya siap membantu troubleshoot apapun!
