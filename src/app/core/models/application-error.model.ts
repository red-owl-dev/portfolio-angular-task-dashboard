export interface ApplicationError {
  message: string;
  status?: number;
  originalError?: unknown;
}
