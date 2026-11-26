import { Link } from 'react-router';
import { getEnsenanzas } from '../api/endpoints';
import type { Ensenanza } from '../api/types';
import { AsyncState, EmptyState } from '../components/ui/AsyncState';
import { PageHeader } from '../components/ui/PageHeader';
import { Reveal } from '../components/ui/Reveal';
import { useApi } from '../hooks/useApi';
import { pick } from '../lib/i18n';
import styles from './catalog.module.css';

/** Ciclos de Formación Profesional agrupados por familia profesional. */
export function FpPage() {
  const state = useApi((signal) => getEnsenanzas('fp', 50, signal), []);

  return (
    <>
      <PageHeader title="Formación Profesional" eyebrow="Enseñanzas">
        <p className={styles.lead}>
          Ciclos formativos de grado medio y superior con formación en empresa y talleres especializados.
        </p>
      </PageHeader>
      <section className="section">
        <div className="container">
          <AsyncState state={state} loadingLabel="Cargando ciclos…">
            {(result) => {
              if (result.data.length === 0) {
                return <EmptyState message="Todavía no hay ciclos formativos publicados." />;
              }
              const grupos = new Map<string, Ensenanza[]>();
              for (const ensenanza of result.data) {
                const familia = ensenanza.familia ?? 'Otros ciclos';
                grupos.set(familia, [...(grupos.get(familia) ?? []), ensenanza]);
              }
              return [...grupos.entries()].map(([familia, ciclos]) => (
                <section key={familia} className={styles.group} aria-labelledby={`familia-${familia}`}>
                  <h2 id={`familia-${familia}`} className={styles.groupTitle}>
                    {familia}
                  </h2>
                  <ul className={styles.grid}>
                    {ciclos.map((ciclo, i) => (
                      <Reveal as="li" key={ciclo.id} delay={Math.min(i, 6) * 0.05} className={styles.card}>
                        <Link to={`/ensenanzas/${encodeURIComponent(ciclo.slug)}`} className={styles.cardLink}>
                          <h3 className={styles.cardTitle}>{pick(ciclo, 'titulo')}</h3>
                          {ciclo.duracion_es && <p className={styles.cardText}>{ciclo.duracion_es}</p>}
                          <span className={styles.meta}>Ver ciclo →</span>
                        </Link>
                      </Reveal>
                    ))}
                  </ul>
                </section>
              ));
            }}
          </AsyncState>
          <p className={styles.back}>
            <Link to="/ensenanzas">← Todas las enseñanzas</Link>
          </p>
        </div>
      </section>
    </>
  );
}
