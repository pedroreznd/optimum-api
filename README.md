# optimum-api

Backend API and WebSocket proxy for [Optimum](https://github.com/pedroreznd/optimum) — a real-time stocks and crypto market dashboard.

Keeps all external API keys server-side and provides a single consistent interface for the frontend regardless of the underlying data provider.

## Architecture
```
optimum (frontend)
    │
    ├── REST  →  /api/stocks/*   →  Finnhub REST API
    ├── REST  →  /api/crypto/*   →  CoinGecko REST API
    └── WS    →  /ws             →  Finnhub WebSocket
```

## Data Sources

| Route | Provider | Auth |
|---|---|---|
| `/api/stocks/quote/:symbol` | Finnhub | API key |
| `/api/stocks/candles/:symbol` | Finnhub | API key |
| `/api/stocks/search?q=` | Finnhub | API key |
| `/api/crypto/quote/:symbol` | CoinGecko | None |
| `/api/crypto/markets` | CoinGecko | None |
| `/ws` | Finnhub WebSocket | API key |

## Tech Stack

- Node.js + Express + TypeScript (strict)
- `ws` — WebSocket server and upstream Finnhub proxy
- CoinGecko free API — no key required
- Deployed on Render

## Getting Started

**Prerequisites:** Node.js 18+
```bash
git clone https://github.com/pedroreznd/optimum-api.git
cd optimum-api
npm install
cp .env.example .env   # add your Finnhub API key
npm run dev
```

Server starts on `http://localhost:3001`.

### Health check
```bash
curl http://localhost:3001/health
```

## Environment Variables

| Variable | Description | Required |
|---|---|---|
| `PORT` | Server port (default: 3001) | No |
| `FINNHUB_API_KEY` | Finnhub API key | Yes |
| `FINNHUB_API_BASE_URL` | Finnhub base URL | No |
| `FINNHUB_WS_URL` | Finnhub WebSocket URL | No |
| `ALLOWED_ORIGIN` | Frontend origin for CORS | Yes |

> A free Finnhub API key is available at [finnhub.io](https://finnhub.io).

## API Reference

### Stocks
```
GET /api/stocks/quote/:symbol
GET /api/stocks/candles/:symbol?timeframe=1W
GET /api/stocks/search?q=apple
```

### Crypto
```
GET /api/crypto/quote/:symbol
GET /api/crypto/markets
```

### WebSocket

Connect to `ws://localhost:3001/ws` and send JSON messages:
```json
{ "type": "subscribe",   "symbol": "AAPL" }
{ "type": "unsubscribe", "symbol": "AAPL" }
```

Incoming messages follow the Finnhub trade format:
```json
{ "type": "trade", "data": [{ "s": "AAPL", "p": 189.43, "t": 1234567890, "v": 100 }] }
```

## Related

- [optimum](https://github.com/pedroreznd/optimum) — frontend
