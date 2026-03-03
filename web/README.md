# Genesis Logs – Frontend (web)

Interface web do **genesis-logs**: listagem e download de logs e visualização de Presets/Override (loot).

## Stack

- **Vite 7** + **React 19** + **TypeScript**
- **Tailwind CSS v4** (`@tailwindcss/vite`)
- **Lucide React** (ícones)
- **class-variance-authority** + **clsx** + **tailwind-merge** (utilidades de classes)

## Estrutura

```
web/
├── src/
│   ├── api/           # Cliente da API
│   │   ├── logs.ts    # Lista e download de logs (GET /logs/admin, GET /logs/admin/:filename)
│   │   ├── loot.ts    # Presets/Override (GET /loot/presets/override)
│   │   ├── cache.ts   # Cache em memória para requests
│   │   └── errors.ts  # Tratamento de erros HTTP
│   ├── components/
│   │   ├── LogView.tsx   # Aba "Log": lista de ficheiros e download
│   │   ├── LootView.tsx  # Aba "Loot": árvore Presets/Override
│   │   └── ui/           # Componentes base (button, card, table, input)
│   ├── lib/
│   │   └── utils.ts   # cn() e helpers
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── public/
│   └── genesis-logo.png
├── vite.config.ts
├── Dockerfile
└── .env.example
```

## Scripts

| Comando     | Descrição                    |
|------------|------------------------------|
| `npm run dev`     | Servidor de desenvolvimento (porta 5173) |
| `npm run build`   | Build de produção (`dist/`)  |
| `npm run preview` | Pré-visualizar build         |
| `npm run lint`    | ESLint                       |

## Variáveis de ambiente

- **`VITE_API_URL`** (opcional): URL base da API. Em desenvolvimento, se não for definida, o front usa `/logs` e `/loot`, e o Vite faz proxy para o backend (ver `vite.config.ts`).
- **`VITE_PROXY_TARGET`**: Alvo do proxy em dev (default: `http://localhost:3000`). Útil em Docker para apontar para o serviço da API.

Ver `.env.example`.

## API

- **Logs**: base `VITE_API_URL ?? '/logs'`
  - `GET .../admin` → lista de ficheiros (`LogFile[]`: `name`, `size`, `lastModified`, `lastAccess`)
  - `GET .../admin/:filename` → download do ficheiro (blob)
- **Loot**: base derivada de `VITE_API_URL` → `.../loot`
  - `GET .../presets/override` → árvore de diretórios e ficheiros (`PresetsOverrideResponse`)

Em dev, o proxy envia `/logs` e `/loot` para o backend; em produção, configurar `VITE_API_URL` no build para o domínio da API.

## Tema e UI

- Tema **Genesis**: classes `theme-genesis`, `genesis-accent`, `genesis-border`, `genesis-muted` em `index.css`.
- Logo em `/genesis-logo.png`.
- Abas: **Log** (lista e download) e **Loot** (Presets/Override).
- Footer com link para o Discord.

## Desenvolvimento com Docker

O `Dockerfile` sobe o frontend em modo dev. Para o proxy acertar na API noutro container, defina no `docker run` ou no compose:

```bash
VITE_PROXY_TARGET=http://api:3000
```

(Substituir `api` pelo nome do serviço da API no teu ambiente.)

## Convenções

- Usar `encodeURIComponent(filename)` em URLs de download.
- Tratar 404 e outros erros com mensagens amigáveis (ver `api/errors.ts`).
- Ao alterar a resposta do backend (campos ou formato), atualizar as interfaces em `api/logs.ts` / `api/loot.ts` e os componentes que as usam.
