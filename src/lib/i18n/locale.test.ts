import { describe, expect, it } from 'vitest';
import { resolveLocale } from './locale';
describe('locale resolution', () => {
  it('honors priority and safely falls back', () => {
    expect(resolveLocale({ user: 'hi', cookie: 'en' })).toBe('hi');
    expect(resolveLocale({ cookie: 'hi', acceptLanguage: 'en' })).toBe('hi');
    expect(resolveLocale({ acceptLanguage: 'hi-IN', organization: 'en' })).toBe('hi');
    expect(resolveLocale({ organization: 'hi' })).toBe('hi');
    expect(resolveLocale({ cookie: '//evil', acceptLanguage: 'fr' })).toBe('en');
  });
});
