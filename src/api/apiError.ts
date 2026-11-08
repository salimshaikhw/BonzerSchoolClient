import axios from 'axios';

/** The error body the API's GlobalExceptionHandler writes (PascalCase), plus plain-string 400/401 bodies. */
interface ApiErrorBody {
  UserMessage?: string;
  ValidationMessage?: string;
  ReferenceId?: string;
  ErrorCode?: string;
  Errors?: Record<string, string[]> | null;
  message?: string;
}

/** The single error type the UI ever sees. Components never inspect AxiosError. */
export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly fieldErrors: Record<string, string[]> = {},
    readonly reference?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;

  if (axios.isAxiosError(error)) {
    if (!error.response) return new ApiError('Cannot reach the server. Check your connection.', 0);

    const { status, data } = error.response;
    if (typeof data === 'string' && data.trim()) return new ApiError(data, status);

    const body = (data ?? {}) as ApiErrorBody;
    const message = body.ValidationMessage ?? body.UserMessage ?? body.message ?? defaultMessage(status);
    return new ApiError(message, status, body.Errors ?? {}, body.ReferenceId);
  }

  return new ApiError(error instanceof Error ? error.message : 'Unexpected error.', 0);
}

function defaultMessage(status: number): string {
  if (status === 401) return 'Your session has expired. Please sign in again.';
  if (status === 403) return 'You do not have permission to do this.';
  if (status === 404) return 'Not found.';
  if (status >= 500) return 'The server had a problem. Try again later.';
  return 'The request failed.';
}
