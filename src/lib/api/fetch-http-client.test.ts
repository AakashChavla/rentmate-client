import { describe, it, expect, vi } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../../test/msw';
import { FetchHttpClient } from './fetch-http-client';
import { ApiError } from './api-error';
import { SingleFlightRefresh } from './refresh-coordinator';
describe('HTTP transport contract', () => {
  it('unwraps envelopes, sends locale and request id, and includes credentials', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    server.use(
      http.get('http://localhost:3000/health/ready', ({ request }) => {
        expect(request.headers.get('accept-language')).toBe('hi');
        expect(request.headers.get('X-Request-ID')).toBeTruthy();
        return HttpResponse.json(
          {
            success: true,
            data: { status: 'ok' },
            meta: {
              requestId: 'server-id',
              timestamp: 'now',
              page: { limit: 20, hasNext: true, nextCursor: 'cursor' },
            },
          },
          { headers: { 'X-Request-ID': 'server-id' } },
        );
      }),
    );
    const result = await new FetchHttpClient('http://localhost:3000', () => 'hi').get<{
      status: string;
    }>('/health/ready');
    expect(result.data).toEqual({ status: 'ok' });
    expect(fetchSpy).toHaveBeenCalledWith(
      expect.any(URL),
      expect.objectContaining({ credentials: 'include' }),
    );
    expect(result.requestId).toBe('server-id');
    expect(result.meta?.page).toEqual({ limit: 20, hasNext: true, nextCursor: 'cursor' });
  });
});
describe('HTTP errors and refresh', () => {
  it('exposes field errors and retry delay', async () => {
    server.use(
      http.get('http://localhost:3000/health/ready', () =>
        HttpResponse.json(
          {
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Invalid',
              details: [{ field: 'email', code: 'VALIDATION_ERROR', message: 'Invalid email' }],
            },
          },
          { status: 400, headers: { 'Retry-After': '3' } },
        ),
      ),
    );
    try {
      await new FetchHttpClient('http://localhost:3000').get('/health/ready');
      throw new Error('Expected transport error');
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError);
      const failure = error as ApiError;
      expect(failure.fieldErrors()[0]?.field).toBe('email');
      expect(failure.retryAfterSeconds).toBe(3);
    }
  });
  it('coalesces enabled refresh work', async () => {
    let calls = 0;
    const coordinator = new SingleFlightRefresh(async () => {
      calls += 1;
      await Promise.resolve();
    });
    await Promise.all([coordinator.refresh(), coordinator.refresh()]);
    expect(calls).toBe(1);
    expect(coordinator.enabled).toBe(true);
  });
});
