import { render } from '@testing-library/react';
import { createMemoryRouter, RouterProvider, type RouteObject } from 'react-router';
import { vi } from 'vitest';
import { ConfigProvider } from '../context/ConfigContext';
import { routes } from '../routes';

export type MockReply = { status?: number; body?: unknown } | ((url: URL, init?: RequestInit) => { status?: number; body?: unknown });

export interface MockApi {
  fetch: ReturnType<typeof vi.fn>;
  /** URLs pedidas (pathname + query), en orden. */
  calls: () => string[];
}

const json = (status: number, body: unknown) =>
  new Response(body === undefined ? null : JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

/**
 * Sustituye `fetch` por un mapa `"METHOD /ruta"` o `"/ruta"` -> respuesta.
 * Las rutas no declaradas responden 404 con el contrato de error de la API.
 */
export function mockApi(replies: Record<string, MockReply> = {}): MockApi {
  const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = new URL(String(input), 'http://localhost');
    const method = (init?.method ?? 'GET').toUpperCase();
    const reply = replies[`${method} ${url.pathname}`] ?? replies[url.pathname];
    if (!reply) return json(404, { error: { code: 'not_found', message: 'No encontrado' } });
    const { status = 200, body } = typeof reply === 'function' ? reply(url, init) : reply;
    return json(status, body);
  });
  vi.stubGlobal('fetch', fetchMock);
  return {
    fetch: fetchMock,
    calls: () =>
      fetchMock.mock.calls.map(([input]) => {
        const url = new URL(String(input), 'http://localhost');
        return url.pathname + url.search;
      }),
  };
}

export function renderRoute(path: string, routeObjects: RouteObject[] = routes) {
  const router = createMemoryRouter(routeObjects, { initialEntries: [path] });
  const utils = render(
    <ConfigProvider>
      <RouterProvider router={router} />
    </ConfigProvider>,
  );
  return { ...utils, router };
}

export const CONFIG_FIXTURE = {
  nombre_centro: 'IES Ramón Arcas Meca',
  localizacion: 'Lorca, Murcia',
  direccion: 'Avenida Juan Carlos I, Lorca (Murcia)',
  email_contacto: 'info@iesramonarcas.example',
  telefono: '+34 968 000 000',
  intranet_url: 'https://intranet.ejemplo.local',
  horario_general: 'L-V 8:00-14:30',
};
