import { act, render, renderHook, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ApiError } from '../api/client';
import { FALLBACK_NAVIGATION } from '../lib/navigation';
import { mockApi } from '../test/utils';
import { formatTitle, SITE_NAME, useDocumentTitle } from './useDocumentTitle';
import { useApi } from './useApi';
import { useNavigation } from './useNavigation';

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

describe('useApi', () => {
  it('pasa de loading a success', async () => {
    const { result } = renderHook(() => useApi(async () => 'ok', []));
    expect(result.current.status).toBe('loading');
    await waitFor(() => expect(result.current).toEqual({ status: 'success', data: 'ok', error: null }));
  });

  it('expone ApiError tal cual', async () => {
    const error = new ApiError(404, 'not_found', 'No encontrado');
    const { result } = renderHook(() => useApi(async () => Promise.reject(error), []));
    await waitFor(() => expect(result.current.status).toBe('error'));
    expect(result.current.error).toBe(error);
  });

  it('envuelve errores desconocidos en un ApiError genérico', async () => {
    const { result } = renderHook(() => useApi(async () => Promise.reject(new Error('boom')), []));
    await waitFor(() => expect(result.current.status).toBe('error'));
    expect(result.current.error).toMatchObject({ code: 'unexpected_error', status: 0 });
  });

  it('pasa la señal al fetcher y aborta al desmontar', async () => {
    let signal: AbortSignal | undefined;
    const { unmount } = renderHook(() =>
      useApi((s) => {
        signal = s;
        return new Promise(() => {});
      }, []),
    );
    expect(signal?.aborted).toBe(false);
    unmount();
    expect(signal?.aborted).toBe(true);
  });

  it('vuelve a loading al cambiar deps e ignora la respuesta antigua', async () => {
    const first = deferred<string>();
    const second = deferred<string>();
    const fetcher = vi.fn<(signal: AbortSignal) => Promise<string>>(() => first.promise);
    const { result, rerender } = renderHook(({ id }) => useApi(fetcher, [id]), { initialProps: { id: 'a' } });

    fetcher.mockImplementation(() => second.promise);
    rerender({ id: 'b' });
    expect(result.current.status).toBe('loading');

    await act(async () => first.resolve('respuesta-a'));
    expect(result.current.status).toBe('loading');

    await act(async () => second.resolve('respuesta-b'));
    expect(result.current).toMatchObject({ status: 'success', data: 'respuesta-b' });
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it('no actualiza estado si el error llega tras abortar', async () => {
    const pending = deferred<string>();
    const { result, rerender } = renderHook(({ id }) => useApi(() => (id === 'a' ? pending.promise : Promise.resolve('b')), [id]), {
      initialProps: { id: 'a' },
    });
    rerender({ id: 'b' });
    await waitFor(() => expect(result.current.data).toBe('b'));
    await act(async () => pending.reject(new Error('tarde')));
    expect(result.current).toMatchObject({ status: 'success', data: 'b' });
  });
});

describe('useNavigation', () => {
  it('usa el menú de respaldo mientras carga', () => {
    mockApi({ '/api/v1/menus/principal': () => ({ body: { data: { items: [] } } }) });
    const { result } = renderHook(() => useNavigation());
    expect(result.current).toBe(FALLBACK_NAVIGATION);
  });

  it('usa el menú de la API cuando responde', async () => {
    mockApi({
      '/api/v1/menus/principal': {
        body: {
          data: {
            id: 1,
            clave: 'principal',
            nombre: 'Menu',
            items: [{ id: 1, padre_id: null, titulo_es: 'Solo API', titulo_en: null, url: '/api', pagina_id: null, orden: 1, children: [] }],
          },
        },
      },
    });
    const { result } = renderHook(() => useNavigation());
    await waitFor(() => expect(result.current).toEqual([{ label: 'Solo API', to: '/api', children: [] }]));
  });

  it('mantiene el respaldo si la API falla', async () => {
    const api = mockApi({ '/api/v1/menus/principal': { status: 500, body: { error: { code: 'server_error', message: 'x' } } } });
    const { result } = renderHook(() => useNavigation());
    await waitFor(() => expect(api.fetch).toHaveBeenCalled());
    await act(async () => {});
    expect(result.current).toBe(FALLBACK_NAVIGATION);
  });

  it('mantiene el respaldo si el menú de la API está vacío', async () => {
    const api = mockApi({ '/api/v1/menus/principal': { body: { data: { id: 1, clave: 'principal', nombre: 'M', items: [] } } } });
    const { result } = renderHook(() => useNavigation());
    await waitFor(() => expect(api.fetch).toHaveBeenCalled());
    await act(async () => {});
    expect(result.current).toBe(FALLBACK_NAVIGATION);
  });
});

describe('useDocumentTitle', () => {
  it('formatea títulos con el nombre del centro', () => {
    expect(formatTitle('Contacto')).toBe(`Contacto · ${SITE_NAME}`);
    expect(formatTitle()).toBe(`${SITE_NAME} · Lorca`);
    expect(formatTitle('  ')).toBe(`${SITE_NAME} · Lorca`);
  });

  it('actualiza document.title al montar y al cambiar', () => {
    function Probe({ title }: { title?: string }) {
      useDocumentTitle(title);
      return <span>probe</span>;
    }
    const { rerender } = render(<Probe title="Historia" />);
    expect(screen.getByText('probe')).toBeInTheDocument();
    expect(document.title).toBe(`Historia · ${SITE_NAME}`);
    rerender(<Probe title="Departamentos" />);
    expect(document.title).toBe(`Departamentos · ${SITE_NAME}`);
  });
});
