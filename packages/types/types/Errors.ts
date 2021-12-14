export interface APIError {
  error: string;
  message: string;
  details?: Record<string, string>[];
}
