import { Link, useParams } from 'react-router';
import { getPrograma } from '../../api/endpoints';
import { AsyncState } from '../../components/ui/AsyncState';
import { PageHeader } from '../../components/ui/PageHeader';
import { useApi } from '../../hooks/useApi';
import { programaCategoriaLabel } from '../../lib/labels';
import { pick } from '../../lib/i18n';
import { NotFoundPage } from '../comunes/NotFoundPage';
import styles from '../../styles/catalog.module.css';

export function ProgramaPage() {
  const { slug = '' } = useParams<{ slug: string }>();
  const state = useApi((signal) => getPrograma(slug, signal), [slug]);

  return (
    <AsyncState state={state} loadingLabel="Cargando programa…" notFound={<NotFoundPage />}>
      {(programa) => (
        <>
          <PageHeader title={pick(programa, 'titulo')} eyebrow={programaCategoriaLabel(programa.categoria)}>
            {programa.descripcion_es && <p className={styles.lead}>{programa.descripcion_es}</p>}
          </PageHeader>
          <section className="section">
            <div className="container">
              {programa.departamentos.length > 0 && (
                <section aria-labelledby="departamentos-programa">
                  <h2 id="departamentos-programa" className={styles.groupTitle}>
                    Departamentos implicados
                  </h2>
                  <ul className={styles.grid}>
                    {programa.departamentos.map((departamento) => (
                      <li key={departamento.id} className={styles.card}>
                        <Link
                          to={`/organizacion/departamentos/${encodeURIComponent(departamento.slug)}`}
                          className={styles.cardLink}
                        >
                          <h3 className={styles.cardTitle}>{pick(departamento, 'nombre')}</h3>
                          <span className={styles.meta}>Ver departamento →</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
              <p className={styles.back}>
                <Link to="/programas">← Todos los programas</Link>
              </p>
            </div>
          </section>
        </>
      )}
    </AsyncState>
  );
}
