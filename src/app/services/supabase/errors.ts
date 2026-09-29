export class SupabaseServiceError extends Error {
  readonly code: string;
  readonly status?: number;

  constructor(message: string, code = "SERVICE_ERROR", status?: number) {
    super(message);
    this.name = "SupabaseServiceError";
    this.code = code;
    this.status = status;
  }
}

export function normalizeSupabaseError(
  value: unknown,
  fallback = "Something went wrong."
): SupabaseServiceError {
  if (value instanceof SupabaseServiceError) return value;
  if (value && typeof value === "object") {
    const record = value as { message?: unknown; code?: unknown; status?: unknown };
    return new SupabaseServiceError(
      typeof record.message === "string" && record.message ? record.message : fallback,
      typeof record.code === "string" ? record.code : "SERVICE_ERROR",
      typeof record.status === "number" ? record.status : undefined
    );
  }
  return new SupabaseServiceError(value instanceof Error ? value.message : fallback);
}

export function isSupabaseAuthError(value: unknown): boolean {
  const error = normalizeSupabaseError(value);
  return ["PGRST301", "42501"].includes(error.code) || error.status === 401;
}
