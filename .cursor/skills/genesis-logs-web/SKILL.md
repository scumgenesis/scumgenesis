---
name: genesis-logs-web
description: Frontend (Vite + React + TypeScript) for genesis-logs: API client, LogFile type, list and download flow. Use when changing the web app, adding UI features, or aligning frontend with backend API responses.
---

# Genesis Logs – Frontend (web)

## Stack e estrutura

- **web/**: Vite, React, TypeScript. Componentes UI em `web/src/components/ui/` (button, card, table, input).
- API base: `import.meta.env.VITE_API_URL ?? '/logs'` (proxy em dev ou URL do backend).
- Cliente de API em **web/src/api/logs.ts**; App em **web/src/App.tsx**.

## Contrato da API (logs.ts)

- **LogFile**: `{ name: string; size: number; lastModified: string | null; lastAccess: string | null }`. Alinhado com o JSON de `GET /logs/admin`.
- **fetchLogList()**: `GET ${API_BASE}/admin` → retorna `Promise<LogFile[]>`; em erro lança com mensagem do body ou statusText.
- **downloadLog(filename)**: `GET ${API_BASE}/admin/${encodeURIComponent(filename)}`; 404 → mensagem "Arquivo não encontrado."; sucesso → blob, cria link de download e revoga URL. Não retorna o blob; apenas dispara o download no browser.

Ao alterar a resposta do backend (campos ou formato), atualizar a interface `LogFile` e os sítios que usam `lastModified`/`lastAccess` (ex.: formatação em App.tsx).

## App.tsx

- Lista carregada no mount via `fetchLogList()`; estado `files`, `loading`, `error`; cancelamento no cleanup do useEffect.
- Download: `handleDownload(filename)` chama `downloadLog`, estado `downloading` para desabilitar botões e mostrar spinner.
- Formatação: datas em pt-BR (`toLocaleString`); tamanhos em B / KiB / MiB. Valores nulos ou inválidos exibidos como "—".
- Tema: classes `theme-genesis`, `genesis-accent`, `genesis-border`, `genesis-muted`; logo em `/genesis-logo.png`.

## Convenções

- Usar `encodeURIComponent(filename)` ao montar URL de download.
- Tratar 404 no download com mensagem amigável; outros erros genéricos ("Erro ao baixar arquivo." / "Erro ao carregar lista.").
- A lista não usa query `days`; o backend default é 7. Para expor "últimos N dias" na UI, adicionar parâmetro em `fetchLogList(days?)` e passar para a API.
