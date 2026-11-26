import { describe, expect, it, vi } from 'vitest';
import { ApiError, apiGet, apiPost, buildUrl } from './client';

const respond = (status: number, body: unknown, contentType = 'application/json') =>
  vi.fn(async () => new Response(typeof body === 'string' ? body : JSON.stringify(body), { status, headers: { 'Content-Type': contentType } }));

describe('buildUrl', () => {
  it('prefija la base de la API', () => {
    expect(buildUrl('/eventos')).toBe('/api/v1/eventos');
  });

  it('normaliza rutas sin barra inicial', () => {
    expect(buildUrl('eventos')).toBe('/api/v1/eventos');
  });

  it('serializa la query omitiendo vacíos, null y undefined', () => {
    expect(buildUrl('/eventos', { desde: '2026-11-16', limit: 4, tipo: '', a: null, b: undefined, activo: false })).toBe(
      '/api/v1/eventos?desde=2026-11-16&limit=4&activo=false',
    );
  });

  it('codifica caracteres especiales en la query', () => {
    expect(buildUrl('/noticias', { q: 'año & curso' })).toBe('/api/v1/noticias?q=a%C3%B1o+%26+curso');
  });
});

describe('apiGet', () => {
  it('devuelve el JSON de una respuesta correcta', async () => {
    vi.stubGlobal('fetch', respond(200, { data: [1, 2] }));
    await expect(apiGet('/departamentos')).resolves.toEqual({ data: [1, 2] });
  });

  it('envía Accept JSON y credenciales same-origin', async () => {
    const fetchMock = respond(200, {});
    vi.stubGlobal('fetch', fetchMock);
    await apiGet('/configuracion');
    const [, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(init.method).toBe('GET');
    expect(init.credentials).toBe('same-origin');
    expect(init.headers).toMatchObject({ Accept: 'application/json' });
  });

  it('propaga la señal de cancelación', async () => {
    const fetchMock = respond(200, {});
    vi.stubGlobal('fetch', fetchMock);
    const controller = new AbortController();
    await apiGet('/configuracion', undefined, controller.signal);
    const [, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(init.signal).toBe(controller.signal);
  });

  it('convierte el contrato de error en ApiError con código, mensaje y campos', async () => {
    vi.stubGlobal(
      'fetch',
      respond(422, { error: { code: 'validation_error', message: 'Datos no validos', fields: { email: 'Email no valido' } } }),
    );
    const error = await apiGet('/x').catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ status: 422, code: 'validation_error', message: 'Datos no validos', fields: { email: 'Email no valido' } });
  });

  it('marca los 404 como no encontrados', async () => {
    vi.stubGlobal('fetch', respond(404, { error: { code: 'not_found', message: 'No encontrado' } }));
    const error = (await apiGet('/departamentos/nada').catch((e: unknown) => e)) as ApiError;
    expect(error.isNotFound).toBe(true);
  });

  it('tolera errores no JSON (p. ej. 502 de Nginx)', async () => {
    vi.stubGlobal('fetch', respond(502, '<html>Bad gateway</html>', 'text/html'));
    const error = (await apiGet('/x').catch((e: unknown) => e)) as ApiError;
    expect(error).toMatchObject({ status: 502, code: 'http_error', fields: {} });
    expect(error.isNotFound).toBe(false);
  });

  it('tolera JSON de error sin el formato del contrato', async () => {
    vi.stubGlobal('fetch', respond(500, { message: 'boom' }));
    await expect(apiGet('/x')).rejects.toMatchObject({ status: 500, code: 'http_error' });
  });

  it('convierte fallos de red en ApiError network_error', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => Promise.reject(new TypeError('Failed to fetch'))));
    await expect(apiGet('/x')).rejects.toMatchObject({ status: 0, code: 'network_error' });
  });

  it('no enmascara la cancelación como error de red', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => Promise.reject(new DOMException('aborted', 'AbortError'))));
    await expect(apiGet('/x')).rejects.toMatchObject({ name: 'AbortError' });
  });
});

describe('apiPost', () => {
  it('envía el cuerpo como JSON', async () => {
    const fetchMock = respond(201, { id: 7, recibido: true });
    vi.stubGlobal('fetch', fetchMock);
    await expect(apiPost('/contacto', { nombre: 'Ana' })).resolves.toEqual({ id: 7, recibido: true });
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe('/api/v1/contacto');
    expect(init.method).toBe('POST');
    expect(init.body).toBe('{"nombre":"Ana"}');
    expect(init.headers).toMatchObject({ 'Content-Type': 'application/json', Accept: 'application/json' });
  });

  it('devuelve undefined en 204 sin intentar parsear', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(null, { status: 204 })));
    await expect(apiPost('/x', {})).resolves.toBeUndefined();
  });
});
