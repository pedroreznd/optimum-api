import dotenv from 'dotenv';

dotenv.config();

/**
 * Centralized environment configuration.
 * All process.env access is contained here; never read process.env directly elsewhere.
 */
export const config = {
  port: Number(process.env.PORT ?? 3001),
  finnhub: {
    apiKey: process.env.FINNHUB_API_KEY ?? '',
    apiBaseUrl: process.env.FINNHUB_API_BASE_URL ?? 'https://finnhub.io/api/v1',
    wsUrl: process.env.FINNHUB_WS_URL ?? 'wss://ws.finnhub.io',
  },
  allowedOrigin: process.env.ALLOWED_ORIGIN ?? 'http://localhost:5173',
} as const;
