import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { ApplicationError } from '../models/application-error.model';

export const httpErrorInterceptor: HttpInterceptorFn = (request, next) => {
  return next(request).pipe(catchError((error: unknown) => throwError(() => toApplicationError(error))));
};

export function toApplicationError(error: unknown): ApplicationError {
  if (!(error instanceof HttpErrorResponse)) {
    return {
      message: 'Unable to complete the request.',
      originalError: error,
    };
  }

  return {
    message: getHttpErrorMessage(error),
    status: error.status,
    originalError: error,
  };
}

function getHttpErrorMessage(error: HttpErrorResponse): string {
  if (error.status === 0) {
    return 'Unable to connect to the server.';
  }

  if (error.status === 400) {
    return getApiMessage(error) ?? 'Invalid request.';
  }

  if (error.status === 401) {
    return 'You are not authorized to perform this action.';
  }

  if (error.status === 403) {
    return 'Access denied.';
  }

  if (error.status === 404) {
    return 'The requested resource was not found.';
  }

  if (error.status === 409) {
    return 'The request conflicts with the current resource state.';
  }

  if (error.status >= 500) {
    return 'An unexpected server error occurred.';
  }

  return 'Unable to complete the request.';
}

function getApiMessage(error: HttpErrorResponse): string | null {
  if (typeof error.error === 'string' && error.error.trim()) {
    return error.error;
  }

  if (typeof error.error === 'object' && error.error !== null && 'message' in error.error) {
    const message = (error.error as { message?: unknown }).message;
    return typeof message === 'string' && message.trim() ? message : null;
  }

  return null;
}
