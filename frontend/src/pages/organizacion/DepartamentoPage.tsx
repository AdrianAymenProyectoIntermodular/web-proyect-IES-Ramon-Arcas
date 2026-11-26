import { Link, useParams } from 'react-router';
import { getDepartamento, getProfesorado } from '../../api/endpoints';
import type { Departamento, ProfesorDepartamento } from '../../api/types';
import { DepartmentIcon } from '../../components/departments/DepartmentIcon';
import { PersonList } from '../../components/people/PersonList';
import { AsyncState, EmptyState } from '../../components/ui/AsyncState';
import { PageHeader } from '../../components/ui/PageHeader';
import { Reveal } from '../../components/ui/Reveal';
import { useApi } from '../../hooks/useApi';
import { pick } from '../../lib/i18n';
import { NotFoundPage } from '../comunes/NotFoundPage';
import styles from './DepartamentoPage.module.css';

interface DepartamentoDetalle {
  departamento: Departamento;
  profesorado: ProfesorDepartamento[];
}

export function DepartamentoPage() {
  const { slug = '' } = useParams();
  const state = useApi<DepartamentoDetalle>(
    async (signal) => {
      const [departamento, profesorado] = await Promise.all([getDepartamento(slug, signal), getProfesorado(slug, signal)]);
      return { departamento, profesorado };
    },
    [slug],
  );

  return (
    <AsyncState state={state} loadingLabel="Cargando departamento…" notFound={<NotFoundPage />}>
      {({ departamento, profesorado }) => (
        <>
          <PageHeader title={pick(departamento, 'nombre')} eyebrow="Departamento" />
          <section className="section">
            <div className={`container ${styles.layout}`}>
              <div>
                <Reveal>
                  <span className={styles.icon}>
                    <DepartmentIcon slug={departamento.slug} />
                  </span>
                  {pick(departamento, 'presentacion') && <p className={styles.intro}>{pick(departamento, 'presentacion')}</p>}
                  {departamento.contacto_publico && (
                    <p>
                      Contacto: <a href={`mailto:${departamento.contacto_publico}`}>{departamento.contacto_publico}</a>
                    </p>
                  )}
                </Reveal>
                <p>
                  <Link to="/organizacion/departamentos">← Todos los departamentos</Link>
                </p>
              </div>

              <aside aria-labelledby="profesorado">
                <h2 id="profesorado" className={styles.subtitle}>
                  Profesorado
                </h2>
                {profesorado.length === 0 ? (
                  <EmptyState message="Este departamento todavía no ha publicado su equipo." />
                ) : (
                  <PersonList people={profesorado.map((p) => ({ key: p.id, nombre: p.nombre, cargo: pick(p, 'cargo') }))} />
                )}
              </aside>
            </div>
          </section>
        </>
      )}
    </AsyncState>
  );
}