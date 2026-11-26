import { Link } from 'react-router';
import styles from './Pagination.module.css';

interface PaginationProps {
  page: number;
  totalPages: number;
  /** Ruta destino de cada página (la 1 puede ser la ruta sin query). */
  buildTo: (page: number) => string;
  label?: string;
}

/** Paginación con enlaces reales: funciona sin JavaScript y conserva el foco. */
export function Pagination({ page, totalPages, buildTo, label = 'Paginación' }: PaginationProps) {
  if (totalPages <= 1) return null;
  return (
    <nav className={styles.pagination} aria-label={label}>
      {page > 1 ? (
        <Link className="button button--outline" to={buildTo(page - 1)} rel="prev">
          Anterior
        </Link>
      ) : (
        <span className={`button button--outline ${styles.disabled}`} aria-disabled="true">
          Anterior
        </span>
      )}
      <span className={styles.status}>
        Página {page} de {totalPages}
      </span>
      {page < totalPages ? (
        <Link className="button button--outline" to={buildTo(page + 1)} rel="next">
          Siguiente
        </Link>
      ) : (
        <span className={`button button--outline ${styles.disabled}`} aria-disabled="true">
          Siguiente
        </span>
      )}
    </nav>
  );
}
