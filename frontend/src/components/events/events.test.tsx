import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { Evento } from '../../api/types';
import { mockApi, renderRoute } from '../../test/utils';
import { EventCard, EventList } from './EventList';
import { EventPanel } from './EventPanel';

const evento = (slug: string, extra: Partial<Evento> = {}): Evento => ({
  id: 1,
  slug,
  titulo_es: `Evento ${slug}`,
  titulo_en: null,
  tipo: null,
  descripcion_es: null,
  descripcion_en: null,
  inicio: '2026-11-19 17:00:00',
  fin: null,
  lugar: null,
  destinatarios: null,
  ...extra,
});

const page = (data: Evento[]) => ({ data, meta: { page: 1, limit: 4, total: data.length } });

const TODAY = new Date(2026, 10, 16, 9, 30);

describe('EventCard', () => {
  it('muestra fecha, título, horario, tipo, lugar y descripción', () => {
    render(
      <EventCard
        evento={evento('jornada', {
          titulo_es: 'Jornada de puertas abiertas',
          tipo: 'jornada',
          lugar: 'Salón de actos',
          descripcion_es: 'Visita guiada para familias.',
          fin: '2026-11-19 19:30:00',
        })}
      />,
    );
    const article = screen.getByRole('article', { name: 'Jornada de puertas abiertas' });
    const time = within(article).getByText('19').closest('time')!;
    expect(time).toHaveAttribute('datetime', '2026-11-19T17:00:00');
    expect(time).toHaveTextContent(/19\s*nov/i);
    expect(within(article).getByRole('heading', { level: 3 })).toHaveTextContent('Jornada de puertas abiertas');
    expect(article).toHaveTextContent('jueves, 19 nov · 17:00–19:30');
    expect(article).toHaveTextContent('jornada');
    expect(article).toHaveTextContent('Salón de actos');
    expect(article).toHaveTextContent('Visita guiada para familias.');
  });

  it('omite los campos opcionales vacíos', () => {
    render(<EventCard evento={evento('minimo')} />);
    const article = screen.getByRole('article');
    expect(article.querySelectorAll('p')).toHaveLength(1);
  });

  it('no rompe con una fecha inválida: omite la insignia de fecha', () => {
    render(<EventCard evento={evento('roto', { inicio: 'no-es-fecha' })} />);
    expect(screen.getByRole('article').querySelector('time')).toBeNull();
    expect(screen.getByRole('heading', { name: 'Evento roto' })).toBeInTheDocument();
  });

  it('usa el título en español como respaldo cuando falta el inglés', () => {
    render(<EventCard evento={evento('x', { titulo_es: 'Concierto', titulo_en: null })} />);
    expect(screen.getByRole('heading', { name: 'Concierto' })).toBeInTheDocument();
  });
});

describe('EventList', () => {
  it('es una lista ordenada que respeta el orden de la API', () => {
    render(<EventList eventos={[evento('a'), evento('b'), evento('c')]} />);
    const items = within(screen.getByRole('list')).getAllByRole('listitem');
    expect(items.map((li) => within(li).getByRole('heading').textContent)).toEqual(['Evento a', 'Evento b', 'Evento c']);
    expect(screen.getByRole('list').tagName).toBe('OL');
  });
});

describe('EventPanel', () => {
  const renderPanel = (props: Parameters<typeof EventPanel>[0] = {}) =>
    renderRoute('/', [{ path: '/', element: <EventPanel today={TODAY} {...props} /> }]);

  it('pide los próximos eventos desde hoy, ordenados por inicio ascendente y con límite', async () => {
    const api = mockApi({ '/api/v1/eventos': { body: page([evento('a')]) } });
    renderPanel({ limit: 3 });
    await screen.findByRole('heading', { name: 'Evento a' });
    const call = api.calls().find((c) => c.startsWith('/api/v1/eventos'))!;
    const params = new URL(call, 'http://x').searchParams;
    expect(params.get('desde')).toBe('2026-11-16');
    expect(params.get('limit')).toBe('3');
    expect(params.get('sort')).toBe('inicio');
    expect(params.get('direction')).toBe('asc');
  });

  it('muestra un estado de carga accesible mientras espera', () => {
    mockApi({ '/api/v1/eventos': { body: page([]) } });
    renderPanel();
    expect(screen.getByRole('status')).toHaveTextContent('Cargando eventos…');
  });

  it('pinta los eventos recibidos', async () => {
    mockApi({ '/api/v1/eventos': { body: page([evento('a'), evento('b')]) } });
    renderPanel();
    expect(await screen.findAllByRole('article')).toHaveLength(2);
  });

  it('muestra un mensaje cuando no hay eventos', async () => {
    mockApi({ '/api/v1/eventos': { body: page([]) } });
    renderPanel();
    expect(await screen.findByText('No hay eventos programados próximamente.')).toBeInTheDocument();
  });

  it('muestra un error si la API falla', async () => {
    mockApi({ '/api/v1/eventos': { status: 500, body: { error: { code: 'server_error', message: 'x' } } } });
    renderPanel();
    expect(await screen.findByRole('alert')).toHaveTextContent('No hemos podido cargar la agenda de eventos.');
  });

  it('enlaza a la agenda completa salvo que se oculte', async () => {
    mockApi({ '/api/v1/eventos': { body: page([]) } });
    const { unmount } = renderPanel();
    expect(screen.getByRole('link', { name: 'Ver toda la agenda' })).toHaveAttribute('href', '/eventos');
    unmount();
    renderPanel({ showAllLink: false });
    expect(screen.queryByRole('link', { name: 'Ver toda la agenda' })).not.toBeInTheDocument();
  });
});
