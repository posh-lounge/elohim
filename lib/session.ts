import 'server-only';
import { cookies } from 'next/headers';

export const SESSION_COOKIE = 'elohim_session';

/** Reads the signed token issued by the PHP backend out of the httpOnly cookie. */
export function getSessionToken(): string | null {
  return cookies().get(SESSION_COOKIE)?.value ?? null;
}
