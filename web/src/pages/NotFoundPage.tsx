import { Link } from 'react-router';
import { PageHeader } from '../components/ui/PageHeader';

export function NotFoundPage() {
  return (
    <>
      <PageHeader title="Página no encontrada" eyebrow="Error 404" />
      <section className="section">
        <div className="container">
          <p>La página que buscas no existe o ya no está disponible.</p>
          <Link to="/" className="button">
            Ir al inicio
          </Link>
        </div>
      </section>
    </>
  );
}
