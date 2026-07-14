import 'server-only';

// Falls back to your working URL if PHP_API_URL isn't set, but stays
// overridable per-environment (local dev, staging, production) via env var
// rather than hardcoded — the same file works everywhere without editing.
const PHP_API_URL = process.env.PHP_API_URL ?? 'https://elohim.giafirst.com/backend/public';

const DEBUG = process.env.DEBUG_PHP_API !== '0'; // on by default; set DEBUG_PHP_API=0 to silence

export class PhpApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

/**
 * Calls the pure-PHP backend from the server side only. Never used from a
 * client component — that's the whole point of routing everything through
 * app/api/*\/route.ts first: the PHP host and the auth token never reach
 * the browser directly.
 */
export async function callPhpApi<T>(
  path: string,
  options: { method?: string; body?: unknown; token?: string | null; searchParams?: Record<string, string> } = {}
): Promise<T> {
  const { method = 'GET', body, token, searchParams } = options;

  // Deliberately NOT `new URL(path, PHP_API_URL)` — when PHP_API_URL has its
  // own path (e.g. https://host/backend/public, as on shared hosting where
  // the whole backend/ folder ends up under the web root), the URL spec
  // treats any path starting with "/" as absolute and silently drops the
  // base's path entirely. Normalizing slashes and concatenating avoids that.
  const base = PHP_API_URL.replace(/\/+$/, '');
  const normalizedPath = path.replace(/^\/+/, '');
  let url = `${base}/${normalizedPath}`;
  if (searchParams && Object.keys(searchParams).length > 0) {
    url += `?${new URLSearchParams(searchParams).toString()}`;
  }

  if (DEBUG) {
    // Prints to the terminal running `next dev`/`next start` — this is a
    // server-side route handler, so it never reaches the browser console.
    console.log(`\n[PHP API →] ${method} ${url}`, token ? '(with token)' : '(no token)', body ?? '');
  }

  let res: Response;
  try {
    res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      cache: 'no-store',
    });
  } catch (networkErr) {
    // fetch() itself threw — DNS failure, connection refused, TLS/cert
    // error, etc. This never produces an HTTP status at all, so without
    // this it would otherwise surface as a bare, unhelpful 500.
    const detail = networkErr instanceof Error ? networkErr.message : String(networkErr);
    if (DEBUG) console.log(`[PHP API ✕] fetch threw before any response: ${detail}`);
    throw new PhpApiError(502, `Could not reach the PHP backend: ${detail}`);
  }

  const raw = await res.text();
  let data: any = null;
  if (raw) {
    try {
      data = JSON.parse(raw);
    } catch {
      if (DEBUG) console.log(`[PHP API ←] ${res.status} — non-JSON response:\n${raw.slice(0, 500)}`);
    }
  }

  if (DEBUG) {
    console.log(
      `[PHP API ←] ${res.status} ${res.redirected ? `(redirected → ${res.url}) ` : ''}` +
        `content-type=${res.headers.get('content-type') ?? 'none'} body=${JSON.stringify(data)}`
    );
  }

  if (!res.ok) {
    // A non-GET request that got redirected almost always means PHP_API_URL
    // uses http:// on a host that force-redirects to https:// — redirects
    // turn POST into GET per the fetch spec, dropping the body, which then
    // 404s against a route that only accepts POST. Surface that directly
    // instead of a bare "Not found" that gives no hint why.
    if (res.redirected && method !== 'GET') {
      throw new PhpApiError(
        res.status,
        `Request was redirected (now at ${res.url}) and ${method} requests can't survive a redirect intact. ` +
          `Set PHP_API_URL to the exact scheme (https://) your host actually serves, so no redirect happens.`
      );
    }
    if (data === null && raw) {
      throw new PhpApiError(res.status, `Backend returned non-JSON response: ${raw.slice(0, 300)}`);
    }
    throw new PhpApiError(res.status, (data && (data.error || data.message)) || `PHP API request failed (${res.status})`);
  }

  return data as T;
}
