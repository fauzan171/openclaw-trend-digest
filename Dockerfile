# ============================================
# OpenClaw Trend Digest — Dockerfile
# Tim 5: DevOps & Automation Team
# ============================================
#
# Multi-stage build untuk image yang kecil dan aman.
# Stage 1: Build TypeScript → JavaScript
# Stage 2: Hanya copy hasil build + production deps
#
# Usage:
#   docker build -t openclaw-digest .
#   docker run --env-file .env openclaw-digest
# ============================================

# ===== Stage 1: Build =====
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files dulu (untuk cache layer dependencies)
COPY package.json package-lock.json ./

# Install ALL dependencies (termasuk devDeps untuk build)
RUN npm ci

# Copy source code
COPY tsconfig.json ./
COPY src/ ./src/

# Build TypeScript
RUN npm run build

# ===== Stage 2: Production =====
FROM node:20-alpine AS production

# Security: jalankan sebagai non-root user
RUN addgroup -g 1001 -S openclaw && \
    adduser -S openclaw -u 1001

WORKDIR /app

# Copy hanya production dependencies
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy built JavaScript files
COPY --from=builder /app/dist ./dist

# Set ownership
RUN chown -R openclaw:openclaw /app

# Switch ke non-root user
USER openclaw

# Health label
LABEL maintainer="OpenClaw Team"
LABEL description="AI-Powered Tech & News Curator Agent"

# Run the application
CMD ["node", "dist/index.js"]
