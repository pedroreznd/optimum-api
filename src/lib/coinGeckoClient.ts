/**
 * CoinGecko REST client for the free Demo tier.
 * No API key is required, but requests should stay within the public 30 calls/minute rate limit.
 * Base URL: https://api.coingecko.com/api/v3
 */
const COINGECKO_BASE_URL = 'https://api.coingecko.com/api/v3';

/**
 * Performs a GET request against the CoinGecko REST API and parses the JSON response.
 *
 * @typeParam T Expected JSON response shape returned by the CoinGecko endpoint.
 * @param path CoinGecko REST path relative to the base URL.
 * @param params Query string parameters to include in the request.
 * @returns The parsed JSON response body.
 * @throws {Error} If CoinGecko responds with a non-2xx status code.
 */
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
