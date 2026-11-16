import { useEffect, useState, type DependencyList } from 'react';
import { ApiError } from '../api/client';

export type ApiState<T> =
  | { status: 'loading'; data: null; error: null }
  | { status: 'success'; data: T; error: null }
  | { status: 'error'; data: null; error: ApiError };

const LOADING = { status: 'loading', data: null, error: null } as const;

function sameDeps(a: DependencyList, b: DependencyList): boolean {
  return a.length === b.length && a.every((value, i) => Object.is(value, b[i]));
}

/**
 * Carga declarativa con cancelación: al desmontar o cambiar `deps` se aborta
 * la petición anterior para que una respuesta tardía no pise a la nueva.
 * El estado "loading" se deriva de que el resultado guardado sea de otras deps,
 * así el efecto solo escribe estado desde callbacks asíncronos.
 */
export function useApi<T>(fetcher: (signal: AbortSignal) => Promise<T>, deps: DependencyList): ApiState<T> {
  const [result, setResult] = useState<{ deps: DependencyList; state: ApiState<T> } | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetcher(controller.signal).then(
      (data) => {
        if (!controller.signal.aborted) setResult({ deps, state: { status: 'success', data, error: null } });
      },
      (error: unknown) => {
        if (controller.signal.aborted) return;
        const apiError =
          error instanceof ApiError ? error : new ApiError(0, 'unexpected_error', 'Se ha producido un error inesperado');
        setResult({ deps, state: { status: 'error', data: null, error: apiError } });
      },
    );
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- deps las declara el llamador
  }, deps);

  if (!result || !sameDeps(result.deps, deps)) return LOADING;
  return result.state;
}
