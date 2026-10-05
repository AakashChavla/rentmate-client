export interface HttpMeta {
  requestId: string;
  timestamp: string;
  page?: { limit: number; hasNext: boolean; nextCursor: string | null };
}
export interface HttpResult<T> {
  data: T;
  requestId: string | null;
  meta?: HttpMeta;
}
export interface HttpClient {
  get<T>(path: string, signal?: AbortSignal): Promise<HttpResult<T>>;
  post<T>(path: string, body?: unknown): Promise<HttpResult<T>>;
  patch<T>(path: string, body: unknown): Promise<HttpResult<T>>;
  delete<T>(path: string): Promise<HttpResult<T>>;
}
