/**
 * Formato de erro da API: { error: string; code?: string; detail?: string }
 * Usado para extrair a mensagem amigável e exibir no frontend.
 */

export interface ApiErrorBody {
  error: string;
  code?: string;
  detail?: string;
}

function isApiErrorBody(value: unknown): value is ApiErrorBody {
  return (
    typeof value === 'object' &&
    value !== null &&
    'error' in value &&
    typeof (value as ApiErrorBody).error === 'string'
  );
}

/**
 * Lê o body da Response como JSON e retorna a mensagem da API (campo `error`).
 * Se o body não for o formato esperado ou a leitura falhar, retorna fallback.
 */
export async function getErrorMessage(res: Response, fallback: string): Promise<string> {
  const text = await res.text().catch(() => '');
  if (!text) return fallback;
  try {
    const body = JSON.parse(text) as unknown;
    if (isApiErrorBody(body) && body.error) return body.error;
  } catch {
    // body não é JSON ou não tem o formato esperado
  }
  return fallback;
}
