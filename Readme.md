# AI Gateaway

A small proxy for Ollama that adds basic access control and rate limiting.

I built this because Ollama runs without any auth by default. That’s fine locally, but the moment you expose it to a network or the internet, it becomes a problem. Anyone can hit your endpoints, spam requests, or overload your machine.

This proxy sits in front of Ollama and fixes that.

---

## What this does

- Adds API key authentication
- Supports multiple API keys
- Has a master key with no limits
- Applies per-key rate limiting
- Streams responses correctly (no buffering issues)
- Keeps all native Ollama endpoints unchanged

---

## Why I built this

Ollama doesn’t come with:

- authentication
- rate limiting
- any kind of access control

If you deploy it on a server, you’re basically exposing your models directly.

I needed something simple to:
- restrict access
- avoid abuse
- keep things predictable under load

So I built a thin proxy instead of modifying Ollama or adding heavy infrastructure.

---

## Why not use existing solutions

There are tools that do similar things, but most of them were overkill for this.

Common issues I ran into:
- too many features I didn’t need
- harder to debug
- more moving parts than necessary

This proxy is intentionally simple:
- one service
- no external dependencies
- easy to understand and extend

---

## Features

- Multiple API keys via environment variables
- Master key (no rate limits)
- Simple per-key rate limiting (default: 1 request every 5 seconds)
- Streaming-safe proxying
- Works with all Ollama endpoints:
  - `/api/generate`
  - `/api/chat`
  - `/api/tags`

---

## Setup

### 1. Install

```bash
npm install
```

### 2. Environment variables
```bash
PORT=3000
TARGET_URL=http://localhost:11434
SITE_NAME=AI Gateaway

MASTER_KEY=master-key

API_KEY_1=key-1
API_KEY_1_LIMIT=1

API_KEY_2=key-2
API_KEY_2_LIMIT=1
```

### 3. Run
```bash
npm run dev
```

#### Production:
```bash
npm run build
npm start
```

## Usage
#### Example request
```bash
POST /api/generate
```

#### Headers
```bash
Authorization: Bearer your-api-key
Content-Type: application/json
```

#### Body
```bash
{
  "model": "qwen3.5:9b",
  "prompt": "Hello",
  "stream": true
}
```

## Note

- Rate limiting is in-memory (not distributed)
- Designed for single-instance setups
- No logging or analytics included
- No database required

If you need more advanced control, you can extend it easily.
