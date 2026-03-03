# Genesis Logs

Sistema para **listagem e download de logs** e **visualização de Presets/Override (loot)** do servidor Genesis. Inclui uma API HTTP que atua como proxy seguro para um servidor SFTP e uma interface web em React.

## Estrutura do projeto

```
genesis-logs/
├── api/          # Backend: proxy SFTP, listagem de logs, endpoint de loot
├── web/          # Frontend: interface React (listagem/download de logs + árvore Presets/Override)
└── docker-compose.yml
```

| Repositório | Descrição |
|-------------|-----------|
| [api/](api/) | API Express em Node.js. Conecta ao SFTP com credenciais internas, expõe `GET /logs/admin` (listar), `GET /logs/admin/:filename` (download) e `GET /loot/presets/override` (Presets/Override). Rate limit, streaming e validação de nomes de ficheiros. |
| [web/](web/) | Frontend Vite + React + TypeScript. Abas **Log** (lista e download de ficheiros) e **Loot** (árvore Presets/Override). Tema Genesis, proxy em dev para a API. |

## Requisitos

- **Node.js** ≥ 18 (para a API)
- **npm** (ou equivalente) para instalar dependências da API e da web
- Credenciais SFTP e caminhos configurados (ver [api/.env.example](api/.env.example))

## Início rápido

### Opção 1: Local

1. **API**
   ```bash
   cd api
   npm install
   cp .env.example .env
   # Editar .env com FTP_HOST, FTP_USER, FTP_PASSWORD, FTP_DIR, etc.
   npm run dev
   ```
   A API fica em `http://localhost:3000`.

2. **Web** (noutro terminal)
   ```bash
   cd web
   npm install
   npm run dev
   ```
   A interface fica em `http://localhost:5173` e usa o proxy do Vite para a API.

### Opção 2: Docker Compose

Na raiz do repositório:

```bash
# Criar .env na pasta api (obrigatório para a API funcionar)
cp api/.env.example api/.env
# Editar api/.env com credenciais SFTP

docker compose up --build
```

- **API**: http://localhost:3000  
- **Web**: http://localhost:5173 (em modo dev, com proxy para `http://api:3000`)

O `docker-compose.yml` usa `env_file: ./api/.env` para a API; a web recebe `VITE_PROXY_TARGET=http://api:3000` para falar com a API dentro da rede Docker.

## Documentação detalhada

- **[api/README.md](api/README.md)** — Variáveis de ambiente, endpoints, segurança, Docker só da API, health check.
- **[web/README.md](web/README.md)** — Stack do frontend, scripts, variáveis (`VITE_API_URL`, `VITE_PROXY_TARGET`), estrutura de pastas, convenções.

## Resumo dos endpoints (API)

| Método | Caminho | Descrição |
|--------|---------|-----------|
| GET | `/health` | Health check (`{"status":"ok"}`) |
| GET | `/logs/admin` | Lista ficheiros de log (`admin_*.log`) |
| GET | `/logs/admin/:filename` | Download do ficheiro (stream) |
| GET | `/loot/presets/override` | Árvore Presets/Override (JSON) |

## Licença

Uso interno / conforme política do projeto.
