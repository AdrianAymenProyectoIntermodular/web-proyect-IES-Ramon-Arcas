export const API_BASE: string = import.meta.env.VITE_API_BASE ?? '/api/v1';

export type QueryValue = string | number | boolean | null | undefined;
export type Query = Record<string, QueryValue>;

export type ApiMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';

export interface RequestOptions {
  signal?: AbortSignal;
  headers?: Record<string, string>;
}

/** Error del contrato `{ error: { code, message, fields? } }` (ver AGENTS.md). */
export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly fields: Record<string, string>;

  constructor(status: number, code: string, message: string, fields: Record<string, string> = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.fields = fields;
  }

  get isNotFound(): boolean {
    return this.status === 404;
  }

  get isUnauthenticated(): boolean {
    return this.status === 401;
  }

  get isForbidden(): boolean {
    return this.status === 403;
  }
}

export function buildUrl(path: string, query: Query = {}): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === '') continue;
    params.append(key, String(value));
  }
  const qs = params.toString();
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE}${normalized}${qs ? `?${qs}` : ''}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

async function toApiError(response: Response): Promise<ApiError> {
  let body: unknown = null;
  try {
    body = await response.json();
  } catch {
    // Respuestas no JSON (502 de Nginx, HTML de error...) se tratan de forma genérica.
  }
  const error = isRecord(body) && isRecord(body.error) ? body.error : null;
  if (error && typeof error.code === 'string' && typeof error.message === 'string') {
    const fields = isRecord(error.fields)
      ? Object.fromEntries(Object.entries(error.fields).map(([k, v]) => [k, String(v)]))
      : {};
    return new ApiError(response.status, error.code, error.message, fields);
  }
  return new ApiError(response.status, 'http_error', `Error HTTP ${response.status}`);
}

async function request<T>(method: ApiMethod, path: string, init: RequestInit & { query?: Query } = {}): Promise<T> {
  const { query, headers, ...rest } = init;
  let response: Response;
  try {
    response = await fetch(buildUrl(path, query), {
      ...rest,
      method,
      credentials: 'same-origin',
      headers: { Accept: 'application/json', ...headers },
    });
  } catch (cause) {
    if (cause instanceof DOMException && cause.name === 'AbortError') throw cause;
    throw new ApiError(0, 'network_error', 'No se pudo conectar con el servidor');
  }
  if (!response.ok) throw await toApiError(response);
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export function apiGet<T>(path: string, query?: Query, signal?: AbortSignal): Promise<T> {
  return request<T>('GET', path, { query, signal });
}

function jsonInit(body: unknown, options: RequestOptions): RequestInit {
  return {
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json', ...options.headers },
    signal: options.signal,
  };
}

export function apiPost<T>(path: string, body: unknown, options: RequestOptions = {}): Promise<T> {
  return request<T>('POST', path, jsonInit(body, options));
}

export function apiPatch<T>(path: string, body: unknown, options: RequestOptions = {}): Promise<T> {
  return request<T>('PATCH', path, jsonInit(body, options));
}

export function apiPut<T>(path: string, body: unknown, options: RequestOptions = {}): Promise<T> {
  return request<T>('PUT', path, jsonInit(body, options));
}

export function apiDelete<T = void>(path: string, options: RequestOptions = {}): Promise<T> {
  return request<T>('DELETE', path, { headers: options.headers, signal: options.signal });
}

/** Subida multipart: el navegador fija el Content-Type con el boundary. */
export function apiUpload<T>(path: string, form: FormData, options: RequestOptions = {}): Promise<T> {
  return request<T>('POST', path, {
    body: form,
    headers: options.headers,
    signal: options.signal,
  });
}
