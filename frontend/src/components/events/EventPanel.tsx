import { Link } from 'react-router';
import { getProximosEventos } from '../../api/endpoints';
import { useApi } from '../../hooks/useApi';
import { toQueryDate } from '../../lib/dates';
import { AsyncState, EmptyState } from '../ui/AsyncState';
import { EventList } from './EventList';
import styles from './EventList.module.css';

interface EventPanelProps {
  limit?: number;
  /** Inyectable en tests; por defecto, hoy en la zona del navegador. */
  today?: Date;
  showAllLink?: boolean;
}

export function EventPanel({ limit = 4, today, showAllLink = true }: EventPanelProps) {
  const desde = toQueryDate(today ?? new Date());
  const state = useApi((signal) => getProximosEventos(desde, limit, signal), [desde, limit]);

  return (
    <div>
      <AsyncState state={state} loadingLabel="Cargando eventos…" errorMessage="No hemos podido cargar la agenda de eventos.">
        {(page) =>
          page.data.length === 0 ? (
            <EmptyState message="No hay eventos programados próximamente." />
          ) : (
            <EventList eventos={page.data} />
          )
        }
      </AsyncState>
      {showAllLink && (
        <p className={styles.actions}>
          <Link to="/eventos" className="button button--outline">
            Ver toda la agenda
          </Link>
        </p>
      )}
    </div>
  );
}
