import { Link } from 'react-router';
import { PageHeader } from '../components/ui/PageHeader';

/** Marcador para secciones del menú pendientes (ver docs/proyecto-intermodular.md, reparto E3/E4). */
export function ComingSoonPage({ title }: { title: string }) {
  return (
    <>
      <PageHeader title={title} />
      <section className="section">
        <div className="container">
          <p>Estamos preparando esta sección. Muy pronto encontrarás aquí toda la información.</p>
          <Link to="/" className="button button--outline">
            Volver al inicio
          </Link>
        </div>
      </section>
    </>
  );
}
