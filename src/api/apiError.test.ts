import { AxiosError, type AxiosResponse } from 'axios';
import { ApiError, toApiError } from './apiError';

function axiosError(status: number, data: unknown): AxiosError {
  const error = new AxiosError('failed');
  error.response = { status, data } as AxiosResponse;
  return error;
}

describe('toApiError', () => {
  it('reads the API exception body (PascalCase)', () => {
    const result = toApiError(axiosError(409, { UserMessage: 'Duplicate', ReferenceId: 'abc', Errors: { Name: ['taken'] } }));
    expect(result).toBeInstanceOf(ApiError);
    expect(result.message).toBe('Duplicate');
    expect(result.status).toBe(409);
    expect(result.reference).toBe('abc');
    expect(result.fieldErrors).toEqual({ Name: ['taken'] });
  });

  it('prefers the validation message', () => {
    expect(toApiError(axiosError(400, { ValidationMessage: 'Bad dob', UserMessage: 'x' })).message).toBe('Bad dob');
  });

  it('accepts plain-text bodies (login failures)', () => {
    expect(toApiError(axiosError(401, 'Invalid email or password.')).message).toBe('Invalid email or password.');
  });

  it('explains network failures', () => {
    expect(toApiError(new AxiosError('Network Error')).status).toBe(0);
  });

  it('falls back to a status message', () => {
    expect(toApiError(axiosError(403, {})).message).toMatch(/permission/);
  });
});
