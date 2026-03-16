import cors from 'cors';
import express from 'express';
import http from 'http';
import { config } from './config';
import cryptoRouter from './routes/crypto';
import stocksRouter from './routes/stocks';
import { createWsProxy } from './ws/finnhubProxy';

const app = express();

app.use(cors({ origin: config.allowedOrigin }));
app.use(express.json());

/** Health check — used by Render to confirm the service is running. */
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/stocks', stocksRouter);
/** API reference: /api/crypto/markets, /api/crypto/quote/:symbol */
app.use('/api/crypto', cryptoRouter);

const server = http.createServer(app);

createWsProxy(server);

server.listen(config.port, () => {
  console.log(`optimum-api running on port ${config.port}`);
});
