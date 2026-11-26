import { Link, useParams } from 'react-router';
import { getNoticia } from '../../api/endpoints';
import { AsyncState } from '../../components/ui/AsyncState';
import { Markdown } from '../../components/ui/Markdown';
import { PageHeader } from '../../components/ui/PageHeader';
import { useApi } from '../../hooks/useApi';
import { formatLongDate } from '../../lib/dates';
import { noticiaCategoriaLabel } from '../../lib/labels';
import { pick } from '../../lib/i18n';
import { NotFoundPage } from '../comunes/NotFoundPage';
import styles from '../../styles/catalog.module.css';

export function NoticiaPage() {
  const { slug = '' } = useParams<{ slug: string }>();
  const state = useApi((signal) => getNoticia(slug, signal), [slug]);

  return (
    <AsyncState state={state} loadingLabel="Cargando noticia…" notFound={<NotFoundPage />}>
      {(noticia) => (
        <>
          <PageHeader title={pick(noticia, 'titulo')} eyebrow={noticiaCategoriaLabel(noticia.categoria)}>
            {noticia.resumen_es && <p className={styles.lead}>{noticia.resumen_es}</p>}
            {noticia.publicado_en && (
              <p className={styles.meta}>
                Publicado el <time dateTime={noticia.publicado_en}>{formatLongDate(noticia.publicado_en)}</time>
              </p>
            )}
          </PageHeader>
          <section className="section">
            <div className="container">
              <Markdown source={noticia.cuerpo_es} />
              <p className={styles.back}>
                <Link to="/noticias">← Todas las noticias</Link>
              </p>
            </div>
          </section>
        </>
      )}
    </AsyncState>
  );
}
