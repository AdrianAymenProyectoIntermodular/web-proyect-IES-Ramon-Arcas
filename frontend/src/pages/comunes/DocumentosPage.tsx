import { PageHeader } from '../../components/ui/PageHeader';
import { DocumentosPanel } from '../../components/content/DocumentosPanel';
import styles from '../../styles/catalog.module.css';

interface DocumentosPageProps {
  title: string;
  eyebrow: string;
  intro: string;
  categorias: string[];
  gruposEnlaces?: string[];
}

/** Portada de descargas de una sección (organización, familias...). */
export function DocumentosPage({ title, eyebrow, intro, categorias, gruposEnlaces }: DocumentosPageProps) {
  return (
    <>
      <PageHeader title={title} eyebrow={eyebrow}>
        <p className={styles.lead}>{intro}</p>
      </PageHeader>
      <section className="section">
        <div className="container">
          <DocumentosPanel categorias={categorias} gruposEnlaces={gruposEnlaces} />
        </div>
      </section>
    </>
  );
}
