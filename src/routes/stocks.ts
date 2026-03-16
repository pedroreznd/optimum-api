import { Router, type Request, type Response } from 'express';
import { finnhubGet } from '../lib/finnhubClient';
import { getTimeframeParams } from '../lib/timeframes';

/**
 * Stock market routes — quote, candles, and symbol search.
 * All routes proxy directly to Finnhub REST API.
 */
const router = Router();

/** GET /api/stocks/quote/:symbol */
router.get('/quote/:symbol', async (req: Request, res: Response): Promise<void> => {
  try {
    const data = await finnhubGet('/quote', { symbol: req.params.symbol.toUpperCase() });
    res.json(data);
  } catch (err) {
    res.status(502).json({ error: err instanceof Error ? err.message : 'Failed to fetch quote' });
  }
});

/** GET /api/stocks/candles/:symbol?timeframe=1W */
router.get('/candles/:symbol', async (req: Request, res: Response): Promise<void> => {
  try {
    const { symbol } = req.params;
    const timeframe = (req.query.timeframe as string) ?? '1W';
    const { resolution, from, to } = getTimeframeParams(timeframe);

    const data = await finnhubGet('/stock/candle', {
      symbol: symbol.toUpperCase(),
      resolution,
      from: String(from),
      to: String(to),
    });

    res.json(data);
  } catch (err) {
    res
      .status(502)
      .json({ error: err instanceof Error ? err.message : 'Failed to fetch candles' });
  }
});

/** GET /api/stocks/search?q=apple */
router.get('/search', async (req: Request, res: Response): Promise<void> => {
  try {
    const q = (req.query.q as string) ?? '';

    if (!q.trim()) {
      res.json({ count: 0, result: [] });
      return;
    }

    const data = await finnhubGet('/search', { q: q.trim() });
    res.json(data);
  } catch (err) {
    res.status(502).json({ error: err instanceof Error ? err.message : 'Failed to search' });
  }
});

export default router;
