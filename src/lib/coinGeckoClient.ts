/**
 * CoinGecko REST client for the free Demo tier.
 * No API key required. Rate limit: 30 calls/min.
 * Base URL: https://api.coingecko.com/api/v3
 */
const COINGECKO_BASE_URL = 'https://api.coingecko.com/api/v3';

export const coinGeckoGet = async <T>(
  path: string,
  params: Record<string, string> = {},
): Promise<T> => {
  const url = new URL(`${COINGECKO_BASE_URL}${path}`);
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));

  const response = await fetch(url.toString(), {
    headers: { accept: 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`CoinGecko API error: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<T>;
};
