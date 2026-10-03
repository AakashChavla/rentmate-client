export interface FieldError {
  field: string;
  code: string;
  message: string;
}
export class ApiError extends Error {
  public constructor(
    public readonly code: string,
    public readonly status: number,
    public readonly requestId: string | null,
    public readonly serverMessage?: string,
    private readonly fields: FieldError[] = [],
    public readonly retryAfterSeconds: number | null = null,
  ) {
    super(code);
    this.name = ApiError.name;
  }
  public fieldErrors(): ReadonlyArray<FieldError> {
    return this.fields;
  }
}
