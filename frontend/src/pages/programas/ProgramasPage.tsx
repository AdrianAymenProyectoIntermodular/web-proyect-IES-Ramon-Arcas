import { Link } from 'react-router';
import { getProgramas } from '../../api/endpoints';
import type { Programa } from '../../api/types';
import { AsyncState, EmptyState } from '../../components/ui/AsyncState';
import { PageHeader } from '../../components/ui/PageHeader';
import { Reveal } from '../../components/ui/Reveal';
import { useApi } from '../../hooks/useApi';
import { PROGRAMA_CATEGORIAS } from '../../lib/labels';
import { pick } from '../../lib/i18n';
import styles from '../../styles/catalog.module.css';

/** Hub de programas agrupado por categoría del contrato. */
export function ProgramasPage() {
  const state = useApi((signal) => getProgramas(50, signal), []);

  return (
    <>
      <PageHeader title="Programas" eyebrow="Centro">
        <p className={styles.lead}>
          Proyectos educativos, planes de centro y actividades que dan forma a la vida del instituto.
        </p>
      </PageHeader>
      <section className="section">
        <div className="container">
          <AsyncState state={state} loadingLabel="Cargando programas…">
            {(result) => {
              if (result.data.length === 0) {
                return <EmptyState message="Todavía no hay programas publicados." />;
              }
              const grupos = PROGRAMA_CATEGORIAS.map((categoria) => ({
                ...categoria,
                programas: result.data.filter((p) => p.categoria === categoria.value),
              })).filter((grupo) => grupo.programas.length > 0);

              return grupos.map((grupo) => (
                <section key={grupo.value} className={styles.group} aria-labelledby={`programas-${grupo.value}`}>
                  <h2 id={`programas-${grupo.value}`} className={styles.groupTitle}>
                    {grupo.label}
                  </h2>
                  <ul className={styles.grid}>
                    {grupo.programas.map((programa: Programa, i) => (
                      <Reveal as="li" key={programa.id} delay={Math.min(i, 6) * 0.05} className={styles.card}>
                        <Link to={`/programas/${encodeURIComponent(programa.slug)}`} className={styles.cardLink}>
                          <h3 className={styles.cardTitle}>{pick(programa, 'titulo')}</h3>
                          {programa.descripcion_es && <p className={styles.cardText}>{programa.descripcion_es}</p>}
                          <span className={styles.meta}>Ver programa →</span>
                        </Link>
                      </Reveal>
                    ))}
                  </ul>
                </section>
              ));
            }}
          </AsyncState>
        </div>
      </section>
    </>
  );
}
