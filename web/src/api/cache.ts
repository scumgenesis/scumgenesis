const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutos

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry<unknown>>();
/** Promises em curso por key — evita múltiplas requests enquanto a primeira não termina. */
const inFlight = new Map<string, Promise<unknown>>();

export function getCached<T>(key: string): T | null {
  const entry = cache.get(key) as CacheEntry<T> | undefined;
  if (!entry || Date.now() > entry.expiresAt) return null;
  return entry.data;
}

export function setCached<T>(key: string, data: T, ttlMs = CACHE_TTL_MS): void {
  cache.set(key, { data, expiresAt: Date.now() + ttlMs });
}

/**
 * Executa `fn()` e guarda o resultado em cache. Se já existir valor válido para `key`, retorna-o sem chamar a API.
 * Se já existir um pedido em curso para `key`, reutiliza a mesma Promise (evita múltiplas requests ao trocar de aba durante o carregamento).
 */
export async function withCache<T>(key: string, fn: () => Promise<T>, ttlMs = CACHE_TTL_MS): Promise<T> {
  const cached = getCached<T>(key);
  if (cached !== null) return cached;

  let promise = inFlight.get(key) as Promise<T> | undefined;
  if (!promise) {
    promise = (async () => {
      try {
        const data = await fn();
        setCached(key, data, ttlMs);
        return data;
      } finally {
        inFlight.delete(key);
      }
    })();
    inFlight.set(key, promise);
  }
  return promise;
}
