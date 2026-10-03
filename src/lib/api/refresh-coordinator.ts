export interface RefreshCoordinator {
  enabled: boolean;
  refresh(): Promise<void>;
}
export class SingleFlightRefresh implements RefreshCoordinator {
  public readonly enabled = false;
  private pending: Promise<void> | undefined;
  public constructor(private readonly action: () => Promise<void>) {}
  public refresh(): Promise<void> {
    this.pending ??= this.action().finally(() => {
      this.pending = undefined;
    });
    return this.pending;
  }
}
