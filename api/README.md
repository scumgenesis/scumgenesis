# Genesis Logs – Proxy de download FTP

API HTTP segura que atua como **proxy de download** para um servidor FTP. Os usuários nunca acessam o FTP diretamente; a API usa credenciais internas e expõe apenas arquivos permitidos.

## Stack

- **Node.js** (ES Modules)
- **Express**
- **basic-ftp**
- Streaming (arquivos não são salvos em disco)
- Pronto para **Docker**

## Variáveis de ambiente

Copie o exemplo e ajuste:

```bash
cp .env.example .env
```

| Variável                       | Obrigatório | Descrição                                                                                    |
| ------------------------------ | ----------- | -------------------------------------------------------------------------------------------- |
| `FTP_HOST`                     | Sim         | Host do servidor FTP                                                                         |
| `FTP_USER`                     | Sim         | Usuário FTP                                                                                  |
| `FTP_PASSWORD`                 | Sim         | Senha FTP                                                                                    |
| `FTP_DIR`                      | Sim\*       | Pasta no FTP onde estão os logs                                                              |
| `PORT`                         | Não         | Porta HTTP (padrão: 3000)                                                                    |
| `FTP_TIMEOUT`                  | Não         | Timeout da conexão FTP em ms (padrão: 30000)                                                 |
| `SFTP_CONCURRENCY`             | Não         | Máx. operações SFTP simultâneas (padrão: 3)                                                  |
| `RATE_LIMIT_MAX_REQUESTS`      | Não         | Máx. requisições por IP em download de log (padrão: 2)                                       |
| `RATE_LIMIT_LIST_MAX_REQUESTS` | Não         | Máx. requisições por IP em listagens por minuto (padrão: 30)                                 |
| `RATE_LIMIT_WINDOW_SECONDS`    | Não         | Janela do rate limit em segundos (padrão: 60)                                                |
| `LOG_MAX_FILE_SIZE_MB`         | Não         | Tamanho máximo de arquivo de log para download, em MB (padrão: 5). Acima disso responde 413. |

\* Se não informado, usa `/`.

## Endpoints

### 1. Listar arquivos – `GET /logs/admin`

- Conecta no FTP e lista a pasta configurada em `FTP_DIR`.
- Retorna apenas arquivos que batem com o regex: `^admin_.*\.log$`.
- Ordenação: mais recente primeiro (por data de modificação).
- Resposta: JSON array de nomes de arquivo.

**Exemplo:**

```bash
curl http://localhost:3000/logs/admin
```

**Resposta:**

```json
["admin_2025-03-01.log", "admin_2025-02-28.log"]
```

### 2. Download – `GET /logs/admin/:file`

- Valida o nome do arquivo com o mesmo regex (`^admin_.*\.log$`).
- Proteção contra path traversal (e.g. `..`, `/`).
- Download em **stream** do FTP para a resposta (não carrega o arquivo em memória).
- Header: `Content-Disposition: attachment; filename="..."`.
- **403** se o nome for inválido.
- **404** se o arquivo não existir no FTP.
- **413** se o arquivo for maior que o limite (padrão 5 MB).

**Exemplo:**

```bash
curl -O -J "http://localhost:3000/logs/admin/admin_2025-03-01.log"
```

## Segurança

- Credenciais apenas em `.env` (nunca no código nem em respostas).
- Path traversal bloqueado na validação do nome do arquivo.
- Timeout na conexão FTP.
- Conexão FTP sempre fechada após uso.
- Erros não expõem stack trace ao usuário.
- **Rate limit** em `/logs`: por padrão 2 requisições por IP por minuto (429 ao exceder).
- **Concorrência SFTP** limitada (padrão 3 operações simultâneas); requisições idênticas ao mesmo tempo (mesmo arquivo ou mesma listagem) compartilham uma única operação (single-flight).

## Qualidade

- Código em camadas: `log-source.model.js` (listagem/download SFTP), `log-cache.model.js` (cache em memória), `log.service.js` (orquestração cache + fonte), `sftp-client.js`, rotas, `index.js` (+ `validation.js`, `error.middleware.js`).
- Tratamento de erros centralizado em `errorHandler.js`.
- Logs claros no console.
- Uso de async/await em todo o fluxo assíncrono.

## Executando localmente

```bash
npm install
cp .env.example .env
# Edite .env com credenciais FTP
npm start
```

Modo desenvolvimento (reinício automático):

```bash
npm run dev
```

## Docker

Build:

```bash
docker build -t genesis-logs .
```

Execução (variáveis no comando):

```bash
docker run -p 3000:3000 \
  -e FTP_HOST=ftp.exemplo.com \
  -e FTP_USER=user \
  -e FTP_PASSWORD=secret \
  -e FTP_DIR=/logs \
  genesis-logs
```

Ou com arquivo `.env` (não versionado):

```bash
docker run -p 3000:3000 --env-file .env genesis-logs
```

## Health check

Endpoint para load balancer/orquestração:

```http
GET /health
```

Resposta: `{"status":"ok"}`.

## Arquivos grandes

O download é feito por **streaming**: os dados vêm do FTP e são enviados direto para o cliente, sem gravar em disco e sem carregar o arquivo inteiro em memória. Adequado para arquivos grandes.

## Licença

Uso interno / conforme política do projeto.
