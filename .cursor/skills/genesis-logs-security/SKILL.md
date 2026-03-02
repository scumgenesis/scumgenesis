---
name: genesis-logs-security
description: Security rules for genesis-logs: no credentials in errors or responses, filename validation and path traversal prevention, centralized error handling. Use when touching authentication, input validation, error messages, or env/secrets.
---

# Genesis Logs – Segurança

## Credenciais

- **Só em .env**: FTP_HOST, FTP_USER, FTP_PASSWORD (e opcionais FTP_DIR, FTP_PORT, FTP_TIMEOUT, CORS_ORIGIN). Nunca no código nem em respostas.
- Em erros ou logs: nunca incluir senha, token ou valor de env sensível. Mensagens genéricas para o utilizador (ex.: "Serviço temporariamente indisponível", "Erro interno do servidor").
- O handler em **middlewares/error.middleware.js** faz `console.error('[error]', err.message)`; garantir que `err.message` não contém credenciais.

## Validação de nomes de ficheiro

- **utils/validation.js**: `ADMIN_LOG_REGEX = /^admin_.*\.log$/`; `isValidAdminLogFilename(filename)` verifica tipo string, não vazio, e rejeita `..`, `/`, `\`.
- Usar sempre esta função antes de passar o nome para log.service ou log-source. Rotas devem validar e responder **403** com `err.code = 'INVALID_FILENAME'` quando inválido.
- Não confiar em parâmetros de URL sem validação; evita path traversal e acesso a ficheiros fora do padrão permitido.

## Tratamento de erros

- **error.middleware.js**: único ponto que envia resposta de erro ao cliente. Nunca expor stack trace nem detalhes internos.
- Mapeamento: ETIMEDOUT/ECONNREFUSED → 502; códigos INVALID_FILENAME e NOT_FOUND tratados nas rotas (403/404); resto → 500 com mensagem genérica.
- Em qualquer camada: ao lançar erro para o utilizador, usar `err.code` para o handler ou rota decidir o status; mensagens devem ser seguras para exibir.

## Boas práticas

- Timeout nas conexões FTP/SFTP (FTP_TIMEOUT) para evitar bloqueios.
- Fechar sempre o cliente FTP/SFTP após uso (incluindo em catch/finally) para não deixar conexões abertas.
- API sem autenticação (acesso público); se no futuro houver auth, credenciais e tokens apenas em env ou mecanismo seguro, nunca em URLs ou respostas em texto plano.
