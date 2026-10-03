export class ApiError extends Error {
  public constructor(
    public readonly code: string,
    public readonly status: number,
    public readonly requestId: string | null,
  ) {
    super(code);
    this.name = ApiError.name;
  }
}
