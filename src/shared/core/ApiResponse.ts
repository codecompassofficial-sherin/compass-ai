export interface ApiErrorBody {
  message: string;
  code?: string;
  details?: unknown;
}

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  error: ApiErrorBody;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export function success<T>(data: T): ApiSuccessResponse<T> {
  return { success: true, data };
}

export function errorBody(
  message: string,
  options: Pick<ApiErrorBody, "code" | "details"> = {},
): ApiErrorBody {
  return {
    message,
    ...(options.code !== undefined ? { code: options.code } : {}),
    ...(options.details !== undefined ? { details: options.details } : {}),
  };
}
