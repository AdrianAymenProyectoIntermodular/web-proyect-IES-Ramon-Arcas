import { useParams } from 'react-router';
import { getOrgano } from '../../api/endpoints';
import { PersonList } from '../../components/people/PersonList';
import { AsyncState, EmptyState } from '../../components/ui/AsyncState';
import { PageHeader } from '../../components/ui/PageHeader';
import { useApi } from '../../hooks/useApi';
import { pick } from '../../lib/i18n';
import { NotFoundPage } from '../comunes/NotFoundPage';

/** Equipo directivo, consejo escolar, claustro y CCP (`GET /organos/{slug}`). */
export function OrganoPage() {
  const { slug = '' } = useParams();
  const state = useApi((signal) => getOrgano(slug, signal), [slug]);

  return (
    <AsyncState state={state} loadingLabel="Cargando…" notFound={<NotFoundPage />}>
      {(organo) => (
        <>
          <PageHeader title={pick(organo, 'nombre')} eyebrow="Organización">
            {pick(organo, 'descripcion') && <p>{pick(organo, 'descripcion')}</p>}
          </PageHeader>
          <section className="section">
            <div className="container">
              {organo.miembros.length === 0 ? (
                <EmptyState message="Todavía no se han publicado sus miembros." />
              ) : (
                <PersonList
                  layout="grid"
                  people={organo.miembros.map((m) => ({ key: m.id, nombre: m.nombre, cargo: pick(m, 'cargo') }))}
                />
              )}
            </div>
          </section>
        </>
      )}
    </AsyncState>
  );
}
