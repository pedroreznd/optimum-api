# optimum-api

Backend API and WebSocket proxy for [Optimum](https://github.com/your-username/optimum) — a real-time stocks and crypto market dashboard.

## What it does

- Proxies Finnhub REST API for stock and crypto quotes, candles, and search
- Proxies Finnhub WebSocket for real-time trade data
- Keeps the Finnhub API key off the client

## Stack

- Node.js + Express + TypeScript (strict)
- ws — WebSocket server and upstream proxy
- Deployed on Render

## Getting Started

### Prerequisites: Node.js 18+

```bash
npm install
cp .env.example .env   # add your Finnhub API key
npm run dev
```

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| GET | /health | Health check |
| GET | /api/stocks/quote/:symbol | Stock quote |
| GET | /api/stocks/candles/:symbol?timeframe=1W | Stock candles |
| GET | /api/stocks/search?q=apple | Symbol search |
| GET | /api/crypto/quote/:symbol | Crypto quote |
| GET | /api/crypto/candles/:symbol?timeframe=1W | Crypto candles |
| WS | /ws | WebSocket trade proxy |

## Related

- [optimum](https://github.com/your-username/optimum) — frontend
