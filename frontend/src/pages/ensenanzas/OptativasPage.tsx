import { getEnsenanzas, getMateriasOptativas, getOfertasOptativas } from '../../api/endpoints';
import { AsyncState, EmptyState } from '../../components/ui/AsyncState';
import { PageHeader } from '../../components/ui/PageHeader';
import { Reveal } from '../../components/ui/Reveal';
import { useApi } from '../../hooks/useApi';
import { pick } from '../../lib/i18n';
import styles from '../../styles/catalog.module.css';

/** Materias optativas y su oferta por enseñanza, nivel y curso académico. */
export function OptativasPage() {
  const state = useApi(async (signal) => {
    const [materias, ofertas, ensenanzas] = await Promise.all([
      getMateriasOptativas(signal),
      getOfertasOptativas(signal),
      getEnsenanzas(undefined, 50, signal),
    ]);
    return { materias, ofertas, ensenanzas: ensenanzas.data };
  }, []);

  return (
    <>
      <PageHeader title="Materias optativas" eyebrow="Enseñanzas">
        <p className={styles.lead}>
          Asignaturas que completan la formación del alumnado según el curso y la etapa.
        </p>
      </PageHeader>
      <section className="section">
        <div className="container">
          <AsyncState state={state} loadingLabel="Cargando optativas…">
            {({ materias, ofertas, ensenanzas }) => {
              if (materias.length === 0) {
                return <EmptyState message="Todavía no hay materias optativas publicadas." />;
              }

              const ofertasPorEnsenanza = new Map<number, Map<string, string[]>>();
              for (const oferta of ofertas) {
                const niveles = ofertasPorEnsenanza.get(oferta.ensenanza_id) ?? new Map<string, string[]>();
                niveles.set(oferta.nivel, [...(niveles.get(oferta.nivel) ?? []), pick(oferta, 'nombre')]);
                ofertasPorEnsenanza.set(oferta.ensenanza_id, niveles);
              }

              return (
                <>
                  <section aria-labelledby="materias">
                    <h2 id="materias" className={styles.groupTitle}>
                      Materias disponibles
                    </h2>
                    <ul className={styles.grid}>
                      {materias.map((materia, i) => (
                        <Reveal as="li" key={materia.id} delay={Math.min(i, 6) * 0.05} className={styles.card}>
                          <div className={styles.cardLink}>
                            <h3 className={styles.cardTitle}>{pick(materia, 'nombre')}</h3>
                            {materia.descripcion_es && <p className={styles.cardText}>{materia.descripcion_es}</p>}
                          </div>
                        </Reveal>
                      ))}
                    </ul>
                  </section>

                  <section aria-labelledby="oferta" className={styles.group}>
                    <h2 id="oferta" className={styles.groupTitle}>
                      Oferta por curso
                    </h2>
                    {ofertas.length === 0 ? (
                      <EmptyState message="La oferta de optativas se publicará antes del periodo de matrícula." />
                    ) : (
                      ensenanzas
                        .filter((ensenanza) => ofertasPorEnsenanza.has(ensenanza.id))
                        .map((ensenanza) => (
                          <div key={ensenanza.id} className={styles.group}>
                            <h3 className={styles.groupTitle}>{pick(ensenanza, 'titulo')}</h3>
                            <dl className={styles.facts}>
                              {[...(ofertasPorEnsenanza.get(ensenanza.id) ?? new Map<string, string[]>()).entries()].map(
                                ([nivel, nombres]) => (
                                  <div key={nivel} className={styles.fact}>
                                    <dt className={styles.factTerm}>{nivel}</dt>
                                    <dd className={styles.factValue}>{nombres.join(' · ')}</dd>
                                  </div>
                                ),
                              )}
                            </dl>
                          </div>
                        ))
                    )}
                  </section>
                </>
              );
            }}
          </AsyncState>
        </div>
      </section>
    </>
  );
}
