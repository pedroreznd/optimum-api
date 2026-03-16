import { Router, type Request, type Response } from 'express';
import { coinGeckoGet } from '../lib/coinGeckoClient';

/**
 * Crypto routes powered by CoinGecko free API.
 * /markets  — bulk price + market data for all tracked coins (single call)
 * /quote/:symbol — Finnhub-compatible quote shape derived from markets data
 * Candles remain unavailable on the free tier and are handled by mock on the frontend.
 */
const router = Router();

/**
 * CoinGecko uses full coin IDs, not ticker symbols.
 * This map translates our app symbols to CoinGecko IDs.
 */
const SYMBOL_TO_COINGECKO_ID: Record<string, string> = {
  BTC: 'bitcoin',
  ETH: 'ethereum',
  BNB: 'binancecoin',
  SOL: 'solana',
  XRP: 'ripple',
  ADA: 'cardano',
  DOGE: 'dogecoin',
  AVAX: 'avalanche-2',
  DOT: 'polkadot',
  MATIC: 'matic-network',
  LINK: 'chainlink',
  UNI: 'uniswap',
  LTC: 'litecoin',
  ATOM: 'cosmos',
  XLM: 'stellar',
};

const ALL_COINGECKO_IDS = Object.values(SYMBOL_TO_COINGECKO_ID).join(',');

interface CoinGeckoMarket {
  id: string;
  symbol: string;
  current_price: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  high_24h: number;
  low_24h: number;
  total_volume: number;
  market_cap: number;
  last_updated: string;
}

/** GET /api/crypto/markets — bulk market data for all coins */
router.get('/markets', async (_req: Request, res: Response): Promise<void> => {
  try {
    const data = await coinGeckoGet<CoinGeckoMarket[]>('/coins/markets', {
      vs_currency: 'usd',
      ids: ALL_COINGECKO_IDS,
      order: 'market_cap_desc',
      per_page: '20',
      page: '1',
      sparkline: 'false',
      price_change_percentage: '24h',
    });

    const idToSymbol = Object.fromEntries(
      Object.entries(SYMBOL_TO_COINGECKO_ID).map(([sym, id]) => [id, sym]),
    );

    const result = data.reduce<Record<string, CoinGeckoMarket>>((acc, coin) => {
      const symbol = idToSymbol[coin.id];
      if (symbol) acc[symbol] = coin;
      return acc;
    }, {});

    res.json(result);
  } catch (err) {
    res
      .status(502)
      .json({ error: err instanceof Error ? err.message : 'Failed to fetch crypto markets' });
  }
});

/** GET /api/crypto/quote/:symbol — Finnhub-compatible quote shape */
router.get('/quote/:symbol', async (req: Request, res: Response): Promise<void> => {
  try {
    const { symbol } = req.params;
    const coinId = SYMBOL_TO_COINGECKO_ID[symbol.toUpperCase()];

    if (!coinId) {
      res.status(404).json({ error: `Unknown symbol: ${symbol}` });
      return;
    }

    const data = await coinGeckoGet<CoinGeckoMarket[]>('/coins/markets', {
      vs_currency: 'usd',
      ids: coinId,
      sparkline: 'false',
      price_change_percentage: '24h',
    });

    if (!data.length) {
      res.status(404).json({ error: 'No data returned for symbol' });
      return;
    }

    const coin = data[0];

    res.json({
      c: coin.current_price,
      d: coin.price_change_24h,
      dp: coin.price_change_percentage_24h,
      h: coin.high_24h,
      l: coin.low_24h,
      o: coin.current_price - coin.price_change_24h,
      pc: coin.current_price - coin.price_change_24h,
      t: Math.floor(new Date(coin.last_updated).getTime() / 1000),
      v: coin.total_volume,
      marketCap: coin.market_cap,
    });
  } catch (err) {
    res
      .status(502)
      .json({ error: err instanceof Error ? err.message : 'Failed to fetch crypto quote' });
  }
});

export default router;
