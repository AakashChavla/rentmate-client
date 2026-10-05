import { ApiError } from './api-error';
import { AUTH_ERROR, AUTH_LIMITS } from '../../config/auth.constants';
export interface RefreshCoordinator {
  enabled: boolean;
  refresh(): Promise<void>;
  subscribeExpired(listener: () => void): () => void;
  expire(): void;
  activate(): void;
}
export class SingleFlightRefresh implements RefreshCoordinator {
  public readonly enabled = true;
  private readonly listeners = new Set<() => void>();
  private expired = false;
  private pending: Promise<void> | undefined;
  public constructor(private readonly action: () => Promise<void>) {}
  public refresh(): Promise<void> {
    this.pending ??= this.attempt()
      .catch((error: unknown) => {
        this.expire();
        throw error;
      })
      .finally(() => {
        this.pending = undefined;
      });
    return this.pending;
  }
  private async attempt(): Promise<void> {
    try {
      await this.action();
    } catch (error) {
      if (!(error instanceof ApiError) || error.code !== AUTH_ERROR.ROTATED) throw error;
      await new Promise<void>((resolve) => setTimeout(resolve, AUTH_LIMITS.ROTATION_RETRY));
      await this.action();
    }
    this.activate();
  }
  public subscribeExpired(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
  public expire(): void {
    if (this.expired) return;
    this.expired = true;
    for (const listener of this.listeners) listener();
  }
  public activate(): void {
    this.expired = false;
  }
}
