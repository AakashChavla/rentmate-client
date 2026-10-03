import { describe, expect, it } from 'vitest';
import { createCsp } from './csp.constants';
describe('nonce CSP', () => {
  it('requires a script nonce and permits eval only in development', () => {
    expect(createCsp('sample', false)).toContain("'nonce-sample' 'strict-dynamic'");
    expect(createCsp('sample', false)).not.toContain("'unsafe-eval'");
    expect(createCsp('sample', true)).toContain("'unsafe-eval'");
    expect(createCsp('sample', false)).toContain("frame-ancestors 'none'");
  });
});
