import { EventPanel } from '../../components/events/EventPanel';
import { PageHeader } from '../../components/ui/PageHeader';

export function EventosPage() {
  return (
    <>
      <PageHeader title="Agenda de eventos" eyebrow="Noticias">
        <p>Actividades, jornadas y citas importantes del curso.</p>
      </PageHeader>
      <section className="section">
        <div className="container">
          <EventPanel limit={24} showAllLink={false} />
        </div>
      </section>
    </>
  );
}
