import { config } from '../config';

/**
 * Thin HTTP client for the Finnhub REST API.
 * All requests are authenticated via the API key query param.
 */
const buildUrl = (path: string, params: Record<string, string> = {}): string => {
  const url = new URL(`${config.finnhub.apiBaseUrl}${path}`);
  url.searchParams.set('token', config.finnhub.apiKey);

  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });

  return url.toString();
};

export const hasFinnhubApiKey = (): boolean =>
  Boolean(config.finnhub.apiKey && config.finnhub.apiKey !== 'your_finnhub_api_key_here');

export const finnhubGet = async <T>(
  path: string,
  params: Record<string, string> = {},
): Promise<T> => {
  if (!hasFinnhubApiKey()) {
    throw new Error('Finnhub API key is not configured');
  }

  const url = buildUrl(path, params);
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Finnhub API error: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<T>;
};
