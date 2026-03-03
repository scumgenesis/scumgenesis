import cors from 'cors';
import express from 'express';
import config from './config/config.js';
import routes from './routes/v1/index.js';
import { errorHandler } from './middlewares/error.middleware.js';

const app = express();

app.use(express.json({ limit: 2 * 1024 * 1024 }));

app.use(cors({ origin: config.corsOrigin, credentials: true }));

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

app.use('/', routes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Recurso não encontrado.', code: 'NOT_FOUND' });
});

app.use(errorHandler);

export default app;
