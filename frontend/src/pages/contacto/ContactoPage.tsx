import { useSearchParams } from 'react-router';
import { ContactForm } from '../../components/contact/ContactForm';
import { PageHeader } from '../../components/ui/PageHeader';
import { useConfig } from '../../context/ConfigContext';
import styles from './ContactoPage.module.css';

export function ContactoPage() {
  const config = useConfig();
  const [params] = useSearchParams();

  return (
    <>
      <PageHeader title="Contacto" eyebrow={config.localizacion}>
        <p>Escríbenos tus consultas, sugerencias o quejas. También puedes visitarnos o llamarnos.</p>
      </PageHeader>
      <section className="section">
        <div className={`container ${styles.layout}`}>
          <ContactForm initialTipo={params.get('tipo')} />
          <aside className={styles.info} aria-labelledby="datos-contacto">
            <h2 id="datos-contacto">Datos del centro</h2>
            <dl>
              {config.direccion && (
                <>
                  <dt>Dirección</dt>
                  <dd>{config.direccion}</dd>
                </>
              )}
              {config.telefono && (
                <>
                  <dt>Teléfono</dt>
                  <dd>
                    <a href={`tel:${config.telefono.replace(/\s+/g, '')}`}>{config.telefono}</a>
                  </dd>
                </>
              )}
              {config.email_contacto && (
                <>
                  <dt>Correo</dt>
                  <dd>
                    <a href={`mailto:${config.email_contacto}`}>{config.email_contacto}</a>
                  </dd>
                </>
              )}
              {config.horario_general && (
                <>
                  <dt>Horario</dt>
                  <dd>{config.horario_general}</dd>
                </>
              )}
            </dl>
          </aside>
        </div>
      </section>
    </>
  );
}
