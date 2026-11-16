import type { Evento } from '../../api/types';
import { formatEventRange, monthShort, parseDbDateTime } from '../../lib/dates';
import { pick } from '../../lib/i18n';
import { Reveal } from '../ui/Reveal';
import styles from './EventList.module.css';

export function EventCard({ evento }: { evento: Evento }) {
  const start = parseDbDateTime(evento.inicio);
  const titleId = `evento-${evento.slug}`;
  return (
    <article className={styles.card} aria-labelledby={titleId}>
      {start && (
        <time className={styles.date} dateTime={evento.inicio.replace(' ', 'T')}>
          <span className={styles.day}>{start.day}</span>
          <span className={styles.month}>{monthShort(start)}</span>
        </time>
      )}
      <div className={styles.body}>
        {evento.tipo && <span className={styles.tag}>{evento.tipo}</span>}
        <h3 id={titleId} className={styles.title}>
          {pick(evento, 'titulo')}
        </h3>
        <p className={styles.meta}>{formatEventRange(evento.inicio, evento.fin)}</p>
        {evento.lugar && <p className={styles.meta}>{evento.lugar}</p>}
        {pick(evento, 'descripcion') && <p className={styles.description}>{pick(evento, 'descripcion')}</p>}
      </div>
    </article>
  );
}

export function EventList({ eventos }: { eventos: Evento[] }) {
  return (
    <ol className={styles.list}>
      {eventos.map((evento, i) => (
        <Reveal as="li" key={evento.slug} delay={Math.min(i, 6) * 0.06}>
          <EventCard evento={evento} />
        </Reveal>
      ))}
    </ol>
  );
}
