import { type Server } from 'http';
import { WebSocket, WebSocketServer, type RawData } from 'ws';
import { config } from '../config';
import { hasFinnhubApiKey } from '../lib/finnhubClient';

type ClientMessage = {
  symbol: string;
  type: 'subscribe' | 'unsubscribe';
};

/**
 * WebSocket fan-out proxy for Finnhub trade data.
 * A single upstream Finnhub connection is shared across all connected frontend clients, and incoming
 * trade messages are broadcast to every local client listening on `/ws`.
 *
 * Reconnect behavior is centralized: if the upstream socket closes while frontend clients are still connected,
 * the proxy schedules one reconnect attempt after a short delay and reuses the same shared connection.
 *
 * Subscription behavior is merged across clients: requested symbols are stored in one deduplicated set and
 * replayed to Finnhub after reconnect so the upstream socket tracks the union of all active frontend interest.
 */
export const createWsProxy = (server: Server): void => {
  const wss = new WebSocketServer({ server, path: '/ws' });
  const clients = new Set<WebSocket>();
  const subscriptions = new Set<string>();

  let upstream: WebSocket | null = null;
  let reconnectTimer: NodeJS.Timeout | null = null;
  let isConnecting = false;

  const clearReconnectTimer = (): void => {
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
  };

  const broadcast = (message: string): void => {
    clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  };

  const scheduleReconnect = (): void => {
    if (clients.size === 0 || reconnectTimer) {
      return;
    }

    reconnectTimer = setTimeout(() => {
      reconnectTimer = null;
      connectUpstream();
    }, 2000);
  };

  const connectUpstream = (): void => {
    if (isConnecting || (upstream && upstream.readyState === WebSocket.OPEN) || clients.size === 0) {
      return;
    }

    if (!hasFinnhubApiKey()) {
      broadcast(JSON.stringify({ error: 'Finnhub API key is not configured' }));
      return;
    }

    clearReconnectTimer();
    isConnecting = true;
    upstream = new WebSocket(`${config.finnhub.wsUrl}?token=${config.finnhub.apiKey}`);

    upstream.on('open', () => {
      isConnecting = false;

      subscriptions.forEach((symbol) => {
        upstream?.send(JSON.stringify({ type: 'subscribe', symbol }));
      });
    });

    upstream.on('message', (data: RawData) => {
      broadcast(data.toString());
    });

    upstream.on('close', () => {
      upstream = null;
      isConnecting = false;
      scheduleReconnect();
    });

    upstream.on('error', () => {
      upstream?.terminate();
    });
  };

  wss.on('connection', (client: WebSocket) => {
    clients.add(client);
    connectUpstream();

    client.on('message', (data: RawData) => {
      try {
        const message = JSON.parse(data.toString()) as ClientMessage;

        if (!message.symbol) {
          return;
        }

        const symbol = message.symbol.toUpperCase();

        if (message.type === 'subscribe') {
          subscriptions.add(symbol);

          if (upstream?.readyState === WebSocket.OPEN) {
            upstream.send(JSON.stringify({ type: 'subscribe', symbol }));
          }
        }

        if (message.type === 'unsubscribe') {
          subscriptions.delete(symbol);

          if (upstream?.readyState === WebSocket.OPEN) {
            upstream.send(JSON.stringify({ type: 'unsubscribe', symbol }));
          }
        }
      } catch {
        client.send(JSON.stringify({ error: 'Malformed WebSocket message' }));
      }
    });

    client.on('close', () => {
      clients.delete(client);

      if (clients.size === 0) {
        clearReconnectTimer();
        subscriptions.clear();
        upstream?.close();
        upstream = null;
        isConnecting = false;
      }
    });
  });
};
