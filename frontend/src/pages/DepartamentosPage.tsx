import { getDepartamentos } from '../api/endpoints';
import { DepartmentGrid } from '../components/departments/DepartmentGrid';
import { AsyncState, EmptyState } from '../components/ui/AsyncState';
import { PageHeader } from '../components/ui/PageHeader';
import { useApi } from '../hooks/useApi';

export function DepartamentosPage() {
  const state = useApi((signal) => getDepartamentos(signal), []);
  return (
    <>
      <PageHeader title="Departamentos" eyebrow="Organización">
        <p>Los departamentos didácticos organizan la enseñanza de cada materia. Elige uno para conocer su equipo.</p>
      </PageHeader>
      <section className="section">
        <div className="container">
          <AsyncState state={state} loadingLabel="Cargando departamentos…">
            {(deps) =>
              deps.length === 0 ? <EmptyState message="Todavía no hay departamentos publicados." /> : <DepartmentGrid departamentos={deps} />
            }
          </AsyncState>
        </div>
      </section>
    </>
  );
}
