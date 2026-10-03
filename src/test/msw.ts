import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
export const server = setupServer(
  http.get('http://localhost:3000/health/ready', () =>
    HttpResponse.json({ status: 'ok', postgres: true, redis: true }),
  ),
);
