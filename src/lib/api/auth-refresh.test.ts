import { it, expect, vi } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../../test/msw';
import { FetchHttpClient } from './fetch-http-client';
import { SingleFlightRefresh } from './refresh-coordinator';
import { ApiError } from './api-error';
it('coalesces concurrent expired requests and retries the original operations once', async () => {
  let ready = false;
  const refresh = vi.fn(async () => {
    await Promise.resolve();
    ready = true;
  });
  const coordinator = new SingleFlightRefresh(refresh);
  server.use(
    http.get('http://localhost:3000/api/v1/users', () =>
      ready
        ? HttpResponse.json({
            success: true,
            data: [],
            meta: { requestId: 'fixture', timestamp: 'now' },
          })
        : HttpResponse.json({ error: { code: 'UNAUTHORIZED' } }, { status: 401 }),
    ),
  );
  const client = new FetchHttpClient('http://localhost:3000', () => 'en', coordinator);
  await Promise.all(Array.from({ length: 20 }, () => client.get('/api/v1/users')));
  expect(refresh).toHaveBeenCalledTimes(1);
});
it('never automatically refreshes auth endpoints and emits expiry only once on failed refresh', async () => {
  const action = vi.fn(() => Promise.reject(new ApiError('SESSION_REVOKED', 401, 'fixture')));
  const coordinator = new SingleFlightRefresh(action);
  const expired = vi.fn();
  coordinator.subscribeExpired(expired);
  server.use(
    http.post('http://localhost:3000/api/v1/auth/login', () =>
      HttpResponse.json({ error: { code: 'INVALID_CREDENTIALS' } }, { status: 401 }),
    ),
  );
  await expect(
    new FetchHttpClient('http://localhost:3000', () => 'en', coordinator).post(
      '/api/v1/auth/login',
      {},
    ),
  ).rejects.toMatchObject({ code: 'INVALID_CREDENTIALS' });
  expect(action).not.toHaveBeenCalled();
  await Promise.allSettled([coordinator.refresh(), coordinator.refresh()]);
  coordinator.expire();
  expect(expired).toHaveBeenCalledTimes(1);
});
it('retries TOKEN_ROTATED once and propagates a second failure', async () => {
  const action = vi
    .fn<() => Promise<void>>()
    .mockRejectedValueOnce(new ApiError('TOKEN_ROTATED', 401, 'fixture'))
    .mockResolvedValueOnce();
  await new SingleFlightRefresh(action).refresh();
  expect(action).toHaveBeenCalledTimes(2);
  const failed = vi.fn(() => Promise.reject(new ApiError('TOKEN_ROTATED', 401, 'fixture')));
  await expect(new SingleFlightRefresh(failed).refresh()).rejects.toMatchObject({
    code: 'TOKEN_ROTATED',
  });
  expect(failed).toHaveBeenCalledTimes(2);
});
