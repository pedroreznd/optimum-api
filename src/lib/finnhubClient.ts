import { config } from '../config';

/** @file Thin authenticated HTTP client for the Finnhub REST API with centralized auth and error handling. */
/**
 * Builds a Finnhub request URL and injects the API token as the required `token` query parameter.
 *
 * @param path Finnhub REST path relative to the configured base URL.
 * @param params Additional query string parameters to append to the request.
 * @returns A fully qualified request URL for `fetch`.
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

/**
 * Performs an authenticated GET request against Finnhub and parses the JSON response as `T`.
 *
 * @typeParam T Expected JSON response shape returned by the Finnhub endpoint.
 * @param path Finnhub REST path relative to the configured base URL.
 * @param params Query string parameters to include alongside the injected API token.
 * @returns The parsed JSON response body.
 * @throws {Error} If the Finnhub API key is missing or the upstream response is not successful.
 */
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
