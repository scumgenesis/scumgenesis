---
name: genesis-logs-log-proxy
description: Log proxy layer: cache TTL, SFTP/FTP clients, list and download flow, admin log filename pattern. Use when changing cache behavior, adding log types, or modifying FTP/SFTP listing or download logic.
---

# Genesis Logs – Proxy de logs (cache + SFTP)

## Camadas

| Camada  | Ficheiro                               | Responsabilidade                                     |
| ------- | -------------------------------------- | ---------------------------------------------------- |
| Rotas   | routes/v1/logs.route.js                 | HTTP, query params, stream response, códigos 403/404 |
| Serviço | services/log.service.js                | Orquestração: cache primeiro, depois fonte           |
| Cache   | models/log-cache.model.js               | TTL em memória para listagem e buffers               |
| Fonte   | models/log-source.model.js             | I/O SFTP: listagem e download (sem cache)            |
| Cliente | clients/sftp-client.js                 | Conexão, list, get (buffer); credenciais do .env      |

Fluxo: rota → log.service → cache hit? retorna : log-source (SFTP) → preenche cache → retorna.

## Cache (log-cache.model.js)

- **Listagem**: TTL 10 min; chave = `days` (1–365).
- **Arquivo mais recente**: TTL 10 min (decidido por `getNewestFilenameFromListing(days)`).
- **Arquivos mais antigos**: TTL 1 hora.
- Funções: `getCachedListing(days)`, `setListing(days, data)`, `getCachedFile(filename, isNewest)`, `setFile(filename, buffer, isNewest)`, `getNewestFilenameFromListing(days)`.

Ao alterar TTL ou estrutura do cache, manter consistência entre listagem e “arquivo mais recente” (primeiro da lista ordenada por data).

## Serviço (log.service.js)

- **listAdminLogs(days)**: cache → se miss, `fetchAdminLogListing(days)` → `setListing` → retorna.
- **getAdminLogStream(filename)**: valida com `isValidAdminLogFilename`; se inválido, lança `err.code = 'INVALID_FILENAME'`. Depois: cache → se miss, `fetchAdminLogFile(filename)` → `setFile` → retorna stream (Readable.from(buffer)); `client` sempre `null` (conexão já fechada na fonte).

Nome do arquivo deve ser validado antes de chamar o serviço (a rota usa validation e repassa 403).

## Fonte (log-source.model.js)

- **fetchAdminLogListing(days)**: cria cliente SFTP, lista diretório (`FTP_DIR` ou `/`), filtra por `isValidAdminLogFilename` e por `modifyTime` nos últimos `days` dias, ordena mais recente primeiro, converte para `{ name, size, lastModified, lastAccess }` (ISO). Fecha cliente em `finally`.
- **fetchAdminLogFile(filename)**: cria cliente, lista para verificar existência e obter `newestFilename`; se não existir, `client.end()` e lança `err.code = 'NOT_FOUND'`. Lê ficheiro para buffer (stream consumido em loop), fecha cliente, retorna `{ buffer, newestFilename }`.

Não expor credenciais em erros; timeout via `FTP_TIMEOUT` (env) nos clientes.

## Padrão de nomes de log admin

Regex em **utils/validation.js**: `^admin_.*\.log$`. Usar sempre `isValidAdminLogFilename(filename)` antes de listar/baixar; inclui proteção contra `..`, `/` e `\`.

## Clientes SFTP

- **sftp-client.js**: `FTP_HOST` (ou `host:port`), `FTP_USER`, `FTP_PASSWORD`, `FTP_PORT` (se não em host), `FTP_TIMEOUT`; `createSftpClient()`, `listFiles(client)`, `listDir(client, path)`, `getFile(client, filename)`.
- Conexão: criar por operação; fechar (`client.end()`) após uso, inclusive em erro.
- Variáveis obrigatórias: FTP_HOST, FTP_USER, FTP_PASSWORD; opcionais: FTP_DIR, FTP_PORT, FTP_TIMEOUT.

Ao adicionar novo tipo de log (ex.: outro prefixo além de `admin_`): estender validation, filtros em log-source e log.service, e rotas correspondentes.
