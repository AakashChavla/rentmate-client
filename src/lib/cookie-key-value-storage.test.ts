import { describe, expect, it } from 'vitest';
import { CookieKeyValueStorage } from './cookie-key-value-storage';
describe('non-sensitive cookie preference adapter', () => {
  it('only persists a supported locale, never arbitrary keys or values', () => {
    const storage = new CookieKeyValueStorage();
    storage.set('NEXT_LOCALE', 'hi');
    expect(storage.get('NEXT_LOCALE')).toBe('hi');
    storage.set('token', 'secret');
    expect(storage.get('token')).toBeUndefined();
    storage.set('NEXT_LOCALE', 'invalid');
    expect(storage.get('NEXT_LOCALE')).toBe('hi');
  });
});
