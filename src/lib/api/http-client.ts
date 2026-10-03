export interface HttpResult<T> {
  data: T;
  requestId: string | null;
}
export interface HttpClient {
  get<T>(path: string, signal?: AbortSignal): Promise<HttpResult<T>>;
}
