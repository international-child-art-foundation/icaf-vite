import { describe, it, expect } from 'vitest';
import { parseCookies, createCookie, deleteCookie, decodeJwtPayload } from './cookies';

describe('parseCookies', () => {
  it('returns empty object for undefined header', () => {
    expect(parseCookies(undefined)).toEqual({});
  });

  it('parses a single cookie', () => {
    expect(parseCookies('session=abc123')).toEqual({ session: 'abc123' });
  });

  it('parses multiple cookies', () => {
    expect(parseCookies('a=1; b=2; c=3')).toEqual({ a: '1', b: '2', c: '3' });
  });

  it('handles cookie values containing =', () => {
    expect(parseCookies('token=abc=def==')).toEqual({ token: 'abc=def==' });
  });

  it('trims whitespace around names and values', () => {
    expect(parseCookies('  name  =  value  ')).toEqual({ name: 'value' });
  });

  it('ignores cookies with no value', () => {
    const result = parseCookies('empty');
    expect(result['empty']).toBeUndefined();
  });
});

describe('createCookie', () => {
  it('produces the correct cookie string', () => {
    const cookie = createCookie('session', 'abc123', 3600);
    expect(cookie).toBe('session=abc123; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=3600');
  });
});

describe('deleteCookie', () => {
  it('produces a Max-Age=0 cookie string', () => {
    const cookie = deleteCookie('session');
    expect(cookie).toBe('session=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0');
  });
});

describe('decodeJwtPayload', () => {
  it('decodes a valid JWT payload', () => {
    // header.payload.signature — payload is base64({"sub":"user123"})
    const payload = Buffer.from(JSON.stringify({ sub: 'user123', role: 'user' })).toString('base64');
    const token = `header.${payload}.signature`;
    expect(decodeJwtPayload(token)).toEqual({ sub: 'user123', role: 'user' });
  });

  it('returns null for a malformed token', () => {
    expect(decodeJwtPayload('notavalidtoken')).toBeNull();
  });

  it('returns null for an empty string', () => {
    expect(decodeJwtPayload('')).toBeNull();
  });
});
