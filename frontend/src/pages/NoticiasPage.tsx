import { Link, useSearchParams } from 'react-router';
import { getNoticias } from '../api/endpoints';
import { AsyncState, EmptyState } from '../components/ui/AsyncState';
import { PageHeader } from '../components/ui/PageHeader';
import { Pagination } from '../components/ui/Pagination';
import { Reveal } from '../components/ui/Reveal';
import { useApi } from '../hooks/useApi';
import { formatLongDate } from '../lib/dates';
import { noticiaCategoriaLabel } from '../lib/labels';
import { pick } from '../lib/i18n';
import styles from './catalog.module.css';

const PAGE_SIZE = 6;

/** Listado público paginado por `?page=` (el contrato devuelve `meta.total`). */
export function NoticiasPage() {
  const [params] = useSearchParams();
  const raw = Number(params.get('page') ?? '1');
  const page = Number.isFinite(raw) && raw >= 1 ? Math.floor(raw) : 1;
  const state = useApi((signal) => getNoticias(page, PAGE_SIZE, signal), [page]);

  return (
    <>
      <PageHeader title="Noticias" eyebrow="Actualidad">
        <p className={styles.lead}>Toda la actividad del centro: avisos, proyectos y vida escolar.</p>
      </PageHeader>
      <section className="section">
        <div className="container">
          <AsyncState
            state={state}
            loadingLabel="Cargando noticias…"
            errorMessage="No hemos podido cargar las noticias."
          >
            {(result) =>
              result.data.length === 0 ? (
                <EmptyState message="Todavía no hay noticias publicadas." />
              ) : (
                <>
                  <ul className={styles.grid}>
                    {result.data.map((noticia, i) => (
                      <Reveal as="li" key={noticia.id} delay={Math.min(i, 6) * 0.05} className={styles.card}>
                        <Link to={`/noticias/${encodeURIComponent(noticia.slug)}`} className={styles.cardLink}>
                          <p className={styles.meta}>
                            <span className={styles.badge}>{noticiaCategoriaLabel(noticia.categoria)}</span>
                            {noticia.publicado_en && (
                              <time dateTime={noticia.publicado_en}>{formatLongDate(noticia.publicado_en)}</time>
                            )}
                          </p>
                          <h2 className={styles.cardTitle}>{pick(noticia, 'titulo')}</h2>
                          {noticia.resumen_es && <p className={styles.cardText}>{noticia.resumen_es}</p>}
                          <span className={styles.meta}>Leer noticia →</span>
                        </Link>
                      </Reveal>
                    ))}
                  </ul>
                  <Pagination
                    page={result.meta.page}
                    totalPages={Math.max(1, Math.ceil(result.meta.total / result.meta.limit))}
                    buildTo={(target) => (target === 1 ? '/noticias' : `/noticias?page=${target}`)}
                    label="Paginación de noticias"
                  />
                </>
              )
            }
          </AsyncState>
          <p className={styles.actions}>
            <Link to="/eventos" className="button button--outline">
              Ver la agenda de eventos
            </Link>
          </p>
        </div>
      </section>
    </>
  );
}
