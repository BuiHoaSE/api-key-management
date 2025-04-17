export interface ApiError {
  code: string;
  message: string;
  details?: string;
}

export interface ApiResponse<T = any> {
  data?: T;
  error?: ApiError;
  meta?: Record<string, any>;
}

export class ApiException extends Error {
  code: string;
  status: number;
  details?: string;

  constructor(code: string, message: string, status: number, details?: string) {
    super(message);
    this.code = code;
    this.status = status;
    this.details = details;
    this.name = 'ApiException';
  }
}

export function createApiResponse<T>(
  data?: T,
  error?: ApiError,
  meta?: Record<string, any>
): ApiResponse<T> {
  return {
    data,
    error,
    meta,
  };
}

export function handleApiError(error: unknown): ApiResponse {
  console.error('API Error:', error);

  if (error instanceof ApiException) {
    return createApiResponse(undefined, {
      code: error.code,
      message: error.message,
      details: error.details,
    });
  }

  return createApiResponse(undefined, {
    code: 'INTERNAL_ERROR',
    message: 'An unexpected error occurred',
    details: error instanceof Error ? error.message : String(error),
  });
} 