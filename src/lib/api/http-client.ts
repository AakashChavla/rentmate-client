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
}
