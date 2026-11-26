import type { ReactNode } from 'react';
import type { ApiState } from '../../hooks/useApi';
import styles from './AsyncState.module.css';

export function Loading({ label = 'Cargando…' }: { label?: string }) {
  return (
    <div className={styles.loading} role="status" aria-live="polite">
      <span className={styles.spinner} aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}

export function ErrorMessage({ message, children }: { message: string; children?: ReactNode }) {
  return (
    <div className={styles.error} role="alert">
      <p>{message}</p>
      {children}
    </div>
  );
}

export function EmptyState({ message }: { message: string }) {
  return <p className={styles.empty}>{message}</p>;
}

interface AsyncStateProps<T> {
  state: ApiState<T>;
  children: (data: T) => ReactNode;
  loadingLabel?: string;
  errorMessage?: string;
  /** Contenido para 404 (recurso inexistente o no publicado: la API no los distingue). */
  notFound?: ReactNode;
}

export function AsyncState<T>({
  state,
  children,
  loadingLabel,
  errorMessage = 'No hemos podido cargar este contenido. Inténtalo de nuevo más tarde.',
  notFound,
}: AsyncStateProps<T>) {
  if (state.status === 'loading') return <Loading label={loadingLabel} />;
  if (state.status === 'error') {
    if (state.error.isNotFound && notFound) return <>{notFound}</>;
    return <ErrorMessage message={errorMessage} />;
  }
  return <>{children(state.data)}</>;
}
