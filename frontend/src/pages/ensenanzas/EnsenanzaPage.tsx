import { Link, useParams } from 'react-router';
import { getDocumentos, getEnsenanza, getModulos } from '../../api/endpoints';
import type { Documento, Ensenanza, Modulo } from '../../api/types';
import { AsyncState } from '../../components/ui/AsyncState';
import { PageHeader } from '../../components/ui/PageHeader';
import { useApi } from '../../hooks/useApi';
import { pick } from '../../lib/i18n';
import { NotFoundPage } from '../comunes/NotFoundPage';
import styles from '../../styles/catalog.module.css';

interface EnsenanzaData {
  ensenanza: Ensenanza;
  modulos: Modulo[];
  documentos: Documento[];
}

interface EnsenanzaPageProps {
  /** Fija el slug en rutas estáticas (/ensenanzas/eso); si falta se toma de la URL. */
  slug?: string;
}

export function EnsenanzaPage({ slug: fixedSlug }: EnsenanzaPageProps) {
  const { slug: paramSlug = '' } = useParams<{ slug: string }>();
  const slug = fixedSlug ?? paramSlug;
  const state = useApi<EnsenanzaData>(async (signal) => {
    const ensenanza = await getEnsenanza(slug, signal);
    const [modulos, documentos] = await Promise.all([
      getModulos(slug, signal),
      getDocumentos({ ensenanza_id: ensenanza.id, limit: 50 }, signal),
    ]);
    return { ensenanza, modulos, documentos: documentos.data };
  }, [slug]);

  return (
    <AsyncState state={state} loadingLabel="Cargando enseñanza…" notFound={<NotFoundPage />}>
      {({ ensenanza, modulos, documentos }) => (
        <>
          <PageHeader title={pick(ensenanza, 'titulo')} eyebrow="Enseñanzas">
            {ensenanza.familia && <p className={styles.meta}>{ensenanza.familia}</p>}
          </PageHeader>
          <section className="section">
            <div className="container">
              <div className={styles.detail}>
                <div>
                  {modulos.length > 0 && (
                    <section aria-labelledby="modulos">
                      <h2 id="modulos" className={styles.groupTitle}>
                        Módulos profesionales
                      </h2>
                      <ul className={styles.list}>
                        {modulos.map((modulo) => (
                          <li key={modulo.id} className={styles.listItem}>
                            <span>{pick(modulo, 'nombre')}</span>
                            {modulo.horas !== null && (
                              <span className={styles.meta}>{modulo.horas} horas</span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </section>
                  )}

                  {documentos.length > 0 && (
                    <section aria-labelledby="documentos-ensenanza" className={styles.group}>
                      <h2 id="documentos-ensenanza" className={styles.groupTitle}>
                        Documentos
                      </h2>
                      <ul className={styles.list}>
                        {documentos.map((documento) => (
                          <li key={documento.id} className={styles.listItem}>
                            <div>
                              <a href={documento.url_descarga} download>
                                {pick(documento, 'titulo')}
                              </a>
                              {documento.descripcion_es && <p>{documento.descripcion_es}</p>}
                            </div>
                            <span className={styles.meta}>PDF</span>
                          </li>
                        ))}
                      </ul>
                    </section>
                  )}
                </div>

                <aside aria-label="Datos de la enseñanza">
                  <dl className={styles.facts}>
                    {ensenanza.requisitos_es && (
                      <div className={styles.fact}>
                        <dt className={styles.factTerm}>Requisitos de acceso</dt>
                        <dd className={styles.factValue}>{ensenanza.requisitos_es}</dd>
                      </div>
                    )}
                    {ensenanza.duracion_es && (
                      <div className={styles.fact}>
                        <dt className={styles.factTerm}>Duración</dt>
                        <dd className={styles.factValue}>{ensenanza.duracion_es}</dd>
                      </div>
                    )}
                    {ensenanza.salidas_es && (
                      <div className={styles.fact}>
                        <dt className={styles.factTerm}>Salidas</dt>
                        <dd className={styles.factValue}>{ensenanza.salidas_es}</dd>
                      </div>
                    )}
                  </dl>
                </aside>
              </div>
              <p className={styles.back}>
                <Link to="/ensenanzas">← Todas las enseñanzas</Link>
              </p>
            </div>
          </section>
        </>
      )}
    </AsyncState>
  );
}
