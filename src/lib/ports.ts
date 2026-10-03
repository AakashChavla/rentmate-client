export interface Clock {
  now(): Date;
}
export interface KeyValueStorage {
  get(key: string): string | undefined;
  set(key: string, value: string): void;
}
