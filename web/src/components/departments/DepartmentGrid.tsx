import { Link } from 'react-router';
import type { Departamento } from '../../api/types';
import { pick } from '../../lib/i18n';
import { departmentPath } from '../../lib/paths';
import { Reveal } from '../ui/Reveal';
import { DepartmentIcon } from './DepartmentIcon';
import styles from './DepartmentGrid.module.css';

/** Tarjetas completas como enlace: el nombre es el texto accesible del enlace. */
export function DepartmentGrid({ departamentos }: { departamentos: Departamento[] }) {
  return (
    <ul className={styles.grid}>
      {departamentos.map((dep, i) => (
        <Reveal as="li" key={dep.slug} delay={Math.min(i, 8) * 0.05}>
          <Link to={departmentPath(dep.slug)} className={styles.card}>
            <span className={styles.icon}>
              <DepartmentIcon slug={dep.slug} />
            </span>
            <span className={styles.name}>{pick(dep, 'nombre')}</span>
            <span className={styles.arrow} aria-hidden="true">
              →
            </span>
          </Link>
        </Reveal>
      ))}
    </ul>
  );
}
