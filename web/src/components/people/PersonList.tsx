import { initials } from '../../lib/text';
import { Reveal } from '../ui/Reveal';
import styles from './PersonList.module.css';

export interface PersonEntry {
  key: string | number;
  nombre: string;
  cargo?: string;
}

/** Fichas sin foto ni datos de contacto: solo nombre y cargo (perfiles públicos mínimos). */
export function PersonList({ people, layout = 'list' }: { people: PersonEntry[]; layout?: 'list' | 'grid' }) {
  return (
    <ul className={layout === 'grid' ? styles.grid : styles.list}>
      {people.map((p, i) => (
        <Reveal as="li" key={p.key} delay={Math.min(i, 8) * 0.04} className={styles.person}>
          <span className={styles.avatar} aria-hidden="true">
            {initials(p.nombre)}
          </span>
          <span>
            <strong>{p.nombre}</strong>
            {p.cargo && <span className={styles.role}>{p.cargo}</span>}
          </span>
        </Reveal>
      ))}
    </ul>
  );
}
