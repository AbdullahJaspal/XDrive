import type { ApiErrorDetail, ApiResponse } from '@uk-phv/shared-types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? '/api/v1';

function formatApiErrorMessage(
  message: string,
  details?: ApiErrorDetail[],
): string {
  if (!details?.length) return message;
  const fieldMessages = details
    .map((d) => (d.field ? `${d.field}: ${d.message}` : d.message))
    .join('; ');
  return fieldMessages || message;
}

export class ApiClientError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status: number,
    public readonly details?: ApiErrorDetail[],
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

async function parseApiResponse<T>(response: Response): Promise<T> {
  const body = (await response.json()) as ApiResponse<T>;

  if (!body.success) {
    throw new ApiClientError(
      body.error.code,
      formatApiErrorMessage(body.error.message, body.error.details),
      response.status,
      body.error.details,
    );
  }

  return body.data;
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit & { token?: string } = {},
): Promise<T> {
  const { token, ...rest } = options;
  const headers = new Headers(rest.headers);
  headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const response = await fetch(`${API_BASE}${path}`, {
    ...rest,
    headers,
  });

  return parseApiResponse<T>(response);
}

/** Multipart upload — do not set Content-Type (browser sets boundary). */
export async function apiFormRequest<T>(
  path: string,
  formData: FormData,
  options: { token?: string; method?: string } = {},
): Promise<T> {
  const headers = new Headers();
  if (options.token) headers.set('Authorization', `Bearer ${options.token}`);

  const response = await fetch(`${API_BASE}${path}`, {
    method: options.method ?? 'POST',
    headers,
    body: formData,
  });

  return parseApiResponse<T>(response);
}
