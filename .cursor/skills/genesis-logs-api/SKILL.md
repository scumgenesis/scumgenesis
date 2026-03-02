---
name: genesis-logs-api
description: Express API structure, routes, and error handling for genesis-logs. Use when adding or changing API routes, middleware, error responses, or server configuration.
---

# Genesis Logs – API e rotas

## Estrutura da aplicação

- **index.js**: inicia o servidor; usa `dotenv`, porta de `process.env.PORT` ou 3000.
- **app.js**: monta o Express (CORS, `express.json`, rotas, 404, errorHandler).
- Rotas de logs em **routes/v1/logs.route.js** montadas em `/logs`; loot em **routes/v1/loot.route.js** em `/loot`.
- Tratamento de erros centralizado em **middlewares/error.middleware.js**; nunca expõe stack ao cliente.

## Rotas existentes

| Método | Path                       | Descrição                                                      |
| ------ | -------------------------- | -------------------------------------------------------------- |
| GET    | `/health`                  | `{ "status": "ok" }`                                           |
| GET    | `/logs/admin`              | Lista arquivos admin (query `days`, default 7, min 1, max 365)  |
| GET    | `/logs/admin/:file`        | Download em stream; validar nome antes                         |
| GET    | `/loot/presets/override`   | Lista diretórios e arquivos em Presets/Override no SFTP        |

Rotas **log** em `/logs`, rotas **loot** em `/loot`. Rate limit: download (`GET /logs/admin/:file`) e listagens (`GET /logs/admin`, `GET /loot/presets/override`) via **middlewares/rate-limit.middleware.js**.

Novas rotas: criar em `api/routes/v1/` e registrar no agregador `api/routes/v1/index.js`; a app monta com `app.use('/', routes)`.

## Códigos de erro

Usar `err.code` para o handler mapear:

| Código                     | HTTP | Quando usar                                |
| -------------------------- | ---- | ------------------------------------------ |
| `INVALID_FILENAME`         | 403  | Nome de arquivo não permitido (validation) |
| `NOT_FOUND`                | 404  | Recurso/arquivo não encontrado             |
| (ETIMEDOUT / ECONNREFUSED) | 502  | Timeout ou conexão recusada (FTP/SFTP)     |
| (outros)                   | 500  | Erro interno (mensagem genérica)           |

Na rota: `next(err)` após definir `err.code` quando aplicável. O `errorHandler` não envia stack nem detalhes internos.

## Request/response

- CORS: `origin` de `process.env.CORS_ORIGIN` ou `http://localhost:5173`, `credentials: true`.
- Body: `express.json({ limit: 2 * 1024 * 1024 })` (máx. 2 MB).
- Log de requisição: `[ISO] METHOD /path` no console antes das rotas.

## Convenções

- Parâmetros de rota (ex.: `:file`) devem ser validados antes de usar (ex.: `isValidAdminLogFilename`).
- Streams: fechar cliente SFTP/FTP em `res.on('finish')` e `res.on('error')` ao fazer pipe para `res`.
- Usar async/await; erros encaminhados com `next(err)`.
