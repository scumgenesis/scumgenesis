/**
 * Express app - configuração e rotas.
 * Estrutura inspirada em node-express-boilerplate.
 */

import cors from 'cors';
import express from 'express';
import config from './config/config.js';
import routes from './routes/v1/index.js';
import { errorHandler } from './middlewares/error.middleware.js';

const app = express();

// parse json request body (max 2MB para reduzir risco de DoS)
app.use(express.json({ limit: 2 * 1024 * 1024 }));

// enable cors
app.use(cors({ origin: config.corsOrigin, credentials: true }));

// request logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// v1 api routes
app.use('/', routes);

// health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Recurso não encontrado.', code: 'NOT_FOUND' });
});

// error handler
app.use(errorHandler);

export default app;
