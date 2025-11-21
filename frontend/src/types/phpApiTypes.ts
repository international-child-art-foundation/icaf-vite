export type ApiSuccess = { ok: true };
export type ApiError = { error: string };
export type ApiResponse = ApiSuccess | ApiError;
