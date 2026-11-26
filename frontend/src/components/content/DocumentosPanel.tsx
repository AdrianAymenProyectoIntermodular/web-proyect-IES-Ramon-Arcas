import { getCategoriasDocumentos, getDocumentos, getEnlaces } from '../../api/endpoints';
import { useApi } from '../../hooks/useApi';
import { AsyncState, EmptyState } from '../ui/AsyncState';
import { pick } from '../../lib/i18n';
import styles from '../../styles/catalog.module.css';

interface DocumentosPanelProps {
  /** Slugs de `categorias_documentos` que se muestran, en ese orden. */
  categorias: string[];
  /** Grupos de `enlaces` que se muestran como enlaces de interés. */
  gruposEnlaces?: string[];
}

const CATEGORIA_FALLBACK: Record<string, string> = {
  institucional: 'Documentos institucionales',
  familias: 'Documentos para familias',
  horarios: 'Horarios',
  secretaria: 'Secretaría',
};

/** Descargas y enlaces reutilizables en páginas editoriales y portadas de sección. */
export function DocumentosPanel({ categorias, gruposEnlaces = [] }: DocumentosPanelProps) {
  const categoriasKey = categorias.join(',');
  const gruposKey = gruposEnlaces.join(',');
  const state = useApi(async (signal) => {
    const [documentos, categoriasApi, enlaces] = await Promise.all([
      getDocumentos({ limit: 50 }, signal),
      getCategoriasDocumentos(signal),
      getEnlaces(undefined, signal),
    ]);
    const cats = categoriasKey.split(',');
    const grupos = gruposKey === '' ? [] : gruposKey.split(',');
    return {
      documentos: documentos.data.filter((d) => cats.includes(d.categoria_slug)),
      categorias: categoriasApi,
      enlaces: enlaces.filter((e) => grupos.includes(e.grupo)),
    };
  }, [categoriasKey, gruposKey]);

  return (
    <AsyncState state={state} loadingLabel="Cargando documentos…" errorMessage="No hemos podido cargar los documentos.">
      {({ documentos, categorias: categoriasApi, enlaces }) => {
        if (documentos.length === 0 && enlaces.length === 0) {
          return <EmptyState message="Todavía no hay documentos ni enlaces publicados." />;
        }
        return (
          <>
            {documentos.length > 0 && (
              <section aria-labelledby="documentos-panel">
                <h2 id="documentos-panel" className={styles.groupTitle}>
                  Documentos
                </h2>
                {categoriasKey.split(',').map((slug) => {
                  const propios = documentos.filter((d) => d.categoria_slug === slug);
                  if (propios.length === 0) return null;
                  const nombre =
                    categoriasApi.find((c) => c.slug === slug)?.nombre_es ?? CATEGORIA_FALLBACK[slug] ?? slug;
                  return (
                    <div key={slug} className={styles.group}>
                      <h3 className={styles.groupTitle}>{nombre}</h3>
                      <ul className={styles.list}>
                        {propios.map((documento) => (
                          <li key={documento.id} className={styles.listItem}>
                            <div>
                              <a href={documento.url_descarga} download>
                                {pick(documento, 'titulo')}
                              </a>
                              {documento.descripcion_es && <p>{documento.descripcion_es}</p>}
                            </div>
                            <span className={styles.meta}>
                              {documento.archivo_mime === 'application/pdf' ? 'PDF' : 'Archivo'}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </section>
            )}

            {enlaces.length > 0 && (
              <section aria-labelledby="enlaces-panel" className={styles.group}>
                <h2 id="enlaces-panel" className={styles.groupTitle}>
                  Enlaces de interés
                </h2>
                <ul className={styles.list}>
                  {enlaces.map((enlace) => (
                    <li key={enlace.id} className={styles.listItem}>
                      <a href={enlace.url} target="_blank" rel="noopener noreferrer">
                        {pick(enlace, 'titulo')}
                      </a>
                      <span className={styles.meta}>Web externa ↗</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </>
        );
      }}
    </AsyncState>
  );
}
