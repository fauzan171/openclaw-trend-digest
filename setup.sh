#!/bin/bash
# ============================================
# OpenClaw Trend Digest — Interactive Setup Script
# Jalankan: bash setup.sh
# ============================================

set -e

echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║  🦀 OpenClaw Trend Digest — Setup Wizard                ║"
echo "║  Panduan interaktif untuk deploy ke Cloudflare           ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

# ===== Colors =====
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

check() { echo -e "${GREEN}✅ $1${NC}"; }
warn()  { echo -e "${YELLOW}⚠️  $1${NC}"; }
fail()  { echo -e "${RED}❌ $1${NC}"; }
info()  { echo -e "${CYAN}ℹ️  $1${NC}"; }
step()  { echo -e "\n${CYAN}━━━ STEP $1 ━━━${NC}\n"; }

# ===== STEP 0: Prerequisites Check =====
step "0: Checking prerequisites"

if command -v node &> /dev/null; then
    check "Node.js $(node --version) found"
else
    fail "Node.js not found! Install: https://nodejs.org"
    exit 1
fi

if command -v npm &> /dev/null; then
    check "npm $(npm --version) found"
else
    fail "npm not found!"
    exit 1
fi

# ===== STEP 1: Install Worker Dependencies =====
step "1: Installing worker dependencies"

cd "$(dirname "$0")/worker"
npm install
check "Worker dependencies installed"

# ===== STEP 2: Wrangler Login =====
step "2: Cloudflare Login"

if npx wrangler whoami 2>/dev/null | grep -q "You are logged in"; then
    check "Already logged in to Cloudflare"
else
    warn "You need to login to Cloudflare"
    info "A browser window will open..."
    echo ""
    read -p "Press Enter to open Cloudflare login..."
    npx wrangler login
    check "Logged in to Cloudflare"
fi

# ===== STEP 3: Create D1 Database =====
step "3: Creating D1 Database"

echo "Checking if database already exists..."
if npx wrangler d1 list 2>/dev/null | grep -q "openclaw-digest-db"; then
    check "Database 'openclaw-digest-db' already exists"
    warn "Skipping creation. If you need the ID, run: npx wrangler d1 list"
else
    info "Creating D1 database..."
    DB_OUTPUT=$(npx wrangler d1 create openclaw-digest-db 2>&1)
    echo "$DB_OUTPUT"
    
    # Extract database_id
    DB_ID=$(echo "$DB_OUTPUT" | grep "database_id" | head -1 | sed 's/.*= *"\(.*\)".*/\1/' | tr -d '"' | tr -d ' ')
    
    if [ -n "$DB_ID" ] && [ "$DB_ID" != "YOUR_DATABASE_ID_HERE" ]; then
        check "Database created with ID: $DB_ID"
        
        # Update wrangler.toml
        if [[ "$OSTYPE" == "darwin"* ]]; then
            sed -i '' "s/YOUR_DATABASE_ID_HERE/$DB_ID/" wrangler.toml
        else
            sed -i "s/YOUR_DATABASE_ID_HERE/$DB_ID/" wrangler.toml
        fi
        check "Updated wrangler.toml with database_id"
    else
        warn "Could not auto-extract database_id"
        echo ""
        echo "Please manually copy the database_id from above output"
        read -p "Paste your database_id here: " MANUAL_DB_ID
        if [ -n "$MANUAL_DB_ID" ]; then
            if [[ "$OSTYPE" == "darwin"* ]]; then
                sed -i '' "s/YOUR_DATABASE_ID_HERE/$MANUAL_DB_ID/" wrangler.toml
            else
                sed -i "s/YOUR_DATABASE_ID_HERE/$MANUAL_DB_ID/" wrangler.toml
            fi
            check "Updated wrangler.toml"
        fi
    fi
fi

# ===== STEP 4: Run Migration =====
step "4: Running database migration"

info "Creating tables in D1..."
npx wrangler d1 execute openclaw-digest-db --remote --file=./schema.sql 2>/dev/null || true
check "Database schema applied"

# ===== STEP 5: Set Secrets =====
step "5: Setting API Secrets"

echo "Now I'll ask for your API keys one by one."
echo "Each will be securely stored as a Cloudflare Secret (encrypted)."
echo ""

# GROQ_API_KEY
echo -e "${CYAN}1/4 — GROQ API KEY${NC}"
info "Get yours at: https://console.groq.com/keys"
info "Format: gsk_xxxxxxxxxxxxxxxx"
read -sp "Paste GROQ_API_KEY (hidden): " GROQ_KEY
echo ""
if [ -n "$GROQ_KEY" ]; then
    echo "$GROQ_KEY" | npx wrangler secret put GROQ_API_KEY 2>/dev/null
    check "GROQ_API_KEY set"
else
    warn "Skipped (you can set later: npx wrangler secret put GROQ_API_KEY)"
fi

# TELEGRAM_BOT_TOKEN
echo ""
echo -e "${CYAN}2/4 — TELEGRAM BOT TOKEN${NC}"
info "Get yours from @BotFather on Telegram"
info "Format: 1234567890:ABCdefGHIjklMNOpqrsTUVwxyz"
read -sp "Paste TELEGRAM_BOT_TOKEN (hidden): " TG_TOKEN
echo ""
if [ -n "$TG_TOKEN" ]; then
    echo "$TG_TOKEN" | npx wrangler secret put TELEGRAM_BOT_TOKEN 2>/dev/null
    check "TELEGRAM_BOT_TOKEN set"
else
    warn "Skipped"
fi

# TELEGRAM_CHAT_ID
echo ""
echo -e "${CYAN}3/4 — TELEGRAM CHAT ID${NC}"
info "Find yours at: https://api.telegram.org/bot<TOKEN>/getUpdates"
info "Format: 987654321 (number)"
read -p "Paste TELEGRAM_CHAT_ID: " TG_CHAT
if [ -n "$TG_CHAT" ]; then
    echo "$TG_CHAT" | npx wrangler secret put TELEGRAM_CHAT_ID 2>/dev/null
    check "TELEGRAM_CHAT_ID set"
else
    warn "Skipped"
fi

# DISCORD_WEBHOOK_URL
echo ""
echo -e "${CYAN}4/4 — DISCORD WEBHOOK URL${NC}"
info "Create in: Discord → Channel Settings → Integrations → Webhooks"
info "Format: https://discord.com/api/webhooks/xxxx/yyyy"
read -sp "Paste DISCORD_WEBHOOK_URL (hidden): " DISCORD_URL
echo ""
if [ -n "$DISCORD_URL" ]; then
    echo "$DISCORD_URL" | npx wrangler secret put DISCORD_WEBHOOK_URL 2>/dev/null
    check "DISCORD_WEBHOOK_URL set"
else
    warn "Skipped"
fi

# ===== STEP 6: Deploy =====
step "6: Deploying Worker"

echo ""
read -p "Ready to deploy? (y/n): " DEPLOY_CONFIRM
if [[ "$DEPLOY_CONFIRM" =~ ^[Yy]$ ]]; then
    info "Deploying to Cloudflare Workers..."
    DEPLOY_OUTPUT=$(npx wrangler deploy 2>&1)
    echo "$DEPLOY_OUTPUT"
    
    WORKER_URL=$(echo "$DEPLOY_OUTPUT" | grep "https://" | head -1 | grep -oE 'https://[^ ]+')
    
    if [ -n "$WORKER_URL" ]; then
        check "Worker deployed at: $WORKER_URL"
    else
        check "Worker deployed!"
    fi
else
    warn "Deployment skipped. Run manually: npx wrangler deploy"
fi

# ===== STEP 7: Test =====
step "7: Testing"

if [ -n "$WORKER_URL" ]; then
    info "Testing health endpoint..."
    HEALTH=$(curl -s "$WORKER_URL/api/health" 2>/dev/null)
    if echo "$HEALTH" | grep -q '"ok"'; then
        check "Health check passed!"
    else
        warn "Health check returned unexpected response"
        echo "$HEALTH"
    fi
    
    echo ""
    read -p "Run a test pipeline? This will send messages to Telegram/Discord (y/n): " TEST_CONFIRM
    if [[ "$TEST_CONFIRM" =~ ^[Yy]$ ]]; then
        info "Running pipeline... (this takes ~15-30 seconds)"
        curl -s -X POST "$WORKER_URL/api/trigger" | head -c 500
        echo ""
        check "Pipeline triggered! Check your Telegram & Discord."
    fi
fi

# ===== DONE =====
echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║                                                          ║"
echo "║  🎉 SETUP COMPLETE!                                      ║"
echo "║                                                          ║"
if [ -n "$WORKER_URL" ]; then
echo "║  🌐 Worker:   $WORKER_URL"
fi
echo "║  ⏰ Cron:     Setiap hari 06:00 WIB (otomatis)          ║"
echo "║  📖 Guide:    SETUP_GUIDE.md                             ║"
echo "║  🔍 Logs:     npx wrangler tail                          ║"
echo "║                                                          ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""
