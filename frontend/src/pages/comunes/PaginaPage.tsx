import { getPagina } from '../../api/endpoints';
import { DocumentosPanel } from '../../components/content/DocumentosPanel';
import { AsyncState } from '../../components/ui/AsyncState';
import { Markdown } from '../../components/ui/Markdown';
import { PageHeader } from '../../components/ui/PageHeader';
import { Reveal } from '../../components/ui/Reveal';
import { useApi } from '../../hooks/useApi';
import { blockMarkdown } from '../../lib/blocks';
import { pick } from '../../lib/i18n';
import { NotFoundPage } from './NotFoundPage';

interface PaginaPageProps {
  slug: string;
  eyebrow?: string;
  /** Categorías de documentos que se muestran al final de la página. */
  documentosCategoria?: string;
  /** Grupos de enlaces externos que se muestran al final de la página. */
  enlacesGrupos?: string[];
}

/** Página editorial genérica (`GET /paginas/{slug}`) con documentos y enlaces opcionales. */
export function PaginaPage({ slug, eyebrow, documentosCategoria, enlacesGrupos }: PaginaPageProps) {
  const state = useApi((signal) => getPagina(slug, signal), [slug]);
  return (
    <AsyncState state={state} loadingLabel="Cargando…" notFound={<NotFoundPage />}>
      {(pagina) => (
        <>
          <PageHeader title={pick(pagina, 'titulo')} eyebrow={eyebrow} />
          <section className="section">
            <div className="container">
              {[...pagina.bloques]
                .sort((a, b) => a.orden - b.orden)
                .map((bloque) => {
                  const markdown = blockMarkdown(bloque);
                  return markdown ? (
                    <Reveal key={bloque.id}>
                      <Markdown source={markdown} />
                    </Reveal>
                  ) : null;
                })}
              {(documentosCategoria || (enlacesGrupos && enlacesGrupos.length > 0)) && (
                <DocumentosPanel
                  categorias={documentosCategoria ? [documentosCategoria] : []}
                  gruposEnlaces={enlacesGrupos}
                />
              )}
            </div>
          </section>
        </>
      )}
    </AsyncState>
  );
}
