import { HttpErrorResponse } from '@angular/common/http';
import { toApplicationError } from './http-error.interceptor';

describe('httpErrorInterceptor', () => {
  it('should return connection message for status 0', () => {
    const error = toApplicationError(new HttpErrorResponse({ status: 0 }));

    expect(error.message).toBe('Unable to connect to the server.');
    expect(error.status).toBe(0);
  });

  it('should use API message for status 400 when available', () => {
    const error = toApplicationError(
      new HttpErrorResponse({
        status: 400,
        error: { message: 'Title is required.' },
      }),
    );

    expect(error.message).toBe('Title is required.');
  });

  it('should return invalid request message for status 400 without API message', () => {
    const error = toApplicationError(new HttpErrorResponse({ status: 400 }));

    expect(error.message).toBe('Invalid request.');
  });

  it('should return authorization message for status 401', () => {
    const error = toApplicationError(new HttpErrorResponse({ status: 401 }));

    expect(error.message).toBe('You are not authorized to perform this action.');
  });

  it('should return access denied message for status 403', () => {
    const error = toApplicationError(new HttpErrorResponse({ status: 403 }));

    expect(error.message).toBe('Access denied.');
  });

  it('should return not found message for status 404', () => {
    const error = toApplicationError(new HttpErrorResponse({ status: 404 }));

    expect(error.message).toBe('The requested resource was not found.');
  });

  it('should return conflict message for status 409', () => {
    const error = toApplicationError(new HttpErrorResponse({ status: 409 }));

    expect(error.message).toBe('The request conflicts with the current resource state.');
  });

  it('should return unexpected server error message for status 500', () => {
    const error = toApplicationError(new HttpErrorResponse({ status: 500 }));

    expect(error.message).toBe('An unexpected server error occurred.');
  });

  it('should return fallback message for unknown errors', () => {
    const originalError = new Error('Unknown');
    const error = toApplicationError(originalError);

    expect(error.message).toBe('Unable to complete the request.');
    expect(error.originalError).toBe(originalError);
  });
});
