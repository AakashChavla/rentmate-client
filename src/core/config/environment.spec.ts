import { describe, expect, it } from 'vitest';
import { parseEnvironment } from './environment';

describe('client environment', () => {
  it('accepts an API base URL', () => {
    expect(parseEnvironment({ NEXT_PUBLIC_API_URL: 'http://localhost:3001/api/v1' })).toEqual({
      NEXT_PUBLIC_API_URL: 'http://localhost:3001/api/v1',
    });
  });

  it.each([undefined, '', 'invalid'])('rejects a missing or invalid URL', (url) => {
    expect(() => parseEnvironment({ NEXT_PUBLIC_API_URL: url })).toThrow(
      'Invalid NEXT_PUBLIC_API_URL',
    );
  });
});
