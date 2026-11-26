import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import type { Departamento, Organo, Pagina, ProfesorDepartamento } from '../api/types';
import { FALLBACK_NAVIGATION } from '../lib/navigation';
import { SECTION_INDEXES } from '../routes';
import { CONFIG_FIXTURE, mockApi, renderRoute, type MockReply } from '../test/utils';

const CONFIG: Record<string, MockReply> = { '/api/v1/configuracion': { body: { data: CONFIG_FIXTURE } } };
const notFound = { status: 404, body: { error: { code: 'not_found', message: 'Recurso no encontrado' } } };
const serverError = { status: 500, body: { error: { code: 'server_error', message: 'x' } } };

const h1 = (name: string | RegExp) => screen.findByRole('heading', { level: 1, name });

const departamento = (slug: string, nombre: string, extra: Partial<Departamento> = {}): Departamento => ({
  id: 1,
  slug,
  nombre_es: nombre,
  nombre_en: null,
  presentacion_es: null,
  presentacion_en: null,
  contacto_publico: null,
  ...extra,
});

describe('Inicio', () => {
  it('muestra el nombre del centro, la localización, los accesos rápidos y la agenda', async () => {
    const api = mockApi({ ...CONFIG, '/api/v1/eventos': { body: { data: [], meta: { page: 1, limit: 4, total: 0 } } } });
    renderRoute('/');
    expect(await h1('IES Ramón Arcas Meca')).toBeInTheDocument();
    expect(await screen.findByText('Lorca, Murcia')).toBeInTheDocument();
    const accesos = screen.getByRole('heading', { name: 'Accesos rápidos' }).closest('section')!;
    expect(within(accesos).getAllByRole('link').map((a) => a.getAttribute('href'))).toEqual([
      '/ensenanzas',
      '/organizacion/departamentos',
      '/familias',
      '/secretaria',
    ]);
    expect(screen.getByRole('heading', { name: 'Próximos eventos' })).toBeInTheDocument();
    expect(await screen.findByText('No hay eventos programados próximamente.')).toBeInTheDocument();
    expect(api.calls().some((c) => c.startsWith('/api/v1/eventos?'))).toBe(true);
    await waitFor(() => expect(document.title).toBe('IES Ramón Arcas Meca · Lorca'));
  });

  it('tiene enlace para saltar al contenido principal', () => {
    mockApi(CONFIG);
    renderRoute('/');
    expect(screen.getByRole('link', { name: 'Saltar al contenido' })).toHaveAttribute('href', '#contenido');
    expect(screen.getByRole('main')).toHaveAttribute('id', 'contenido');
  });
});

describe('Departamentos', () => {
  it('lista los departamentos de la API como enlaces', async () => {
    mockApi({
      ...CONFIG,
      '/api/v1/departamentos': { body: { data: [departamento('matematicas', 'Matemáticas'), departamento('musica', 'Música')] } },
    });
    renderRoute('/organizacion/departamentos');
    expect(await h1('Departamentos')).toBeInTheDocument();
    expect(await screen.findByRole('link', { name: 'Matemáticas' })).toHaveAttribute('href', '/organizacion/departamentos/matematicas');
    expect(screen.getByRole('link', { name: 'Música' })).toBeInTheDocument();
    await waitFor(() => expect(document.title).toBe('Departamentos · IES Ramón Arcas Meca'));
  });

  it('indica cuando no hay departamentos publicados', async () => {
    mockApi({ ...CONFIG, '/api/v1/departamentos': { body: { data: [] } } });
    renderRoute('/organizacion/departamentos');
    expect(await screen.findByText('Todavía no hay departamentos publicados.')).toBeInTheDocument();
  });

  it('muestra un error si la API falla', async () => {
    mockApi({ ...CONFIG, '/api/v1/departamentos': serverError });
    renderRoute('/organizacion/departamentos');
    expect(await screen.findByRole('alert')).toHaveTextContent('No hemos podido cargar este contenido');
  });

  it('navega del listado al detalle al pulsar una tarjeta', async () => {
    mockApi({
      ...CONFIG,
      '/api/v1/departamentos': { body: { data: [departamento('musica', 'Música')] } },
      '/api/v1/departamentos/musica': { body: { data: departamento('musica', 'Música') } },
      '/api/v1/departamentos/musica/profesorado': { body: { data: [] } },
    });
    const user = userEvent.setup();
    const { router } = renderRoute('/organizacion/departamentos');
    await user.click(await screen.findByRole('link', { name: 'Música' }));
    await waitFor(() => expect(router.state.location.pathname).toBe('/organizacion/departamentos/musica'));
    expect(await h1('Música')).toBeInTheDocument();
  });
});

describe('Detalle de departamento', () => {
  const profesor = (id: number, nombre: string, cargo: string | null): ProfesorDepartamento => ({
    id,
    nombre,
    foto_id: null,
    cargo_es: cargo,
    cargo_en: null,
  });

  it('muestra presentación, contacto y profesorado con su cargo', async () => {
    const api = mockApi({
      ...CONFIG,
      '/api/v1/departamentos/fisica-quimica': {
        body: {
          data: departamento('fisica-quimica', 'Física y Química', {
            presentacion_es: 'Ciencia experimental en el laboratorio.',
            contacto_publico: 'fisica-quimica@iesramonarcas.example',
          }),
        },
      },
      '/api/v1/departamentos/fisica-quimica/profesorado': {
        body: { data: [profesor(1, 'Lucía Romero Sáez', 'Jefatura de departamento'), profesor(2, 'Mario Gil Ortiz', null)] },
      },
    });
    renderRoute('/organizacion/departamentos/fisica-quimica');

    expect(await h1('Física y Química')).toBeInTheDocument();
    expect(screen.getByText('Ciencia experimental en el laboratorio.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'fisica-quimica@iesramonarcas.example' })).toHaveAttribute(
      'href',
      'mailto:fisica-quimica@iesramonarcas.example',
    );
    const aside = screen.getByRole('complementary', { name: 'Profesorado' });
    const items = within(aside).getAllByRole('listitem');
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent('LRLucía Romero SáezJefatura de departamento');
    expect(items[1]).toHaveTextContent('Mario Gil Ortiz');
    expect(screen.getByRole('link', { name: '← Todos los departamentos' })).toHaveAttribute('href', '/organizacion/departamentos');
    expect(api.calls()).toEqual(
      expect.arrayContaining(['/api/v1/departamentos/fisica-quimica', '/api/v1/departamentos/fisica-quimica/profesorado']),
    );
  });

  it('indica cuando el departamento no ha publicado su equipo', async () => {
    mockApi({
      ...CONFIG,
      '/api/v1/departamentos/musica': { body: { data: departamento('musica', 'Música') } },
      '/api/v1/departamentos/musica/profesorado': { body: { data: [] } },
    });
    renderRoute('/organizacion/departamentos/musica');
    expect(await screen.findByText('Este departamento todavía no ha publicado su equipo.')).toBeInTheDocument();
    expect(within(screen.getByRole('main')).queryByRole('link', { name: /@/ })).not.toBeInTheDocument();
  });

  it('muestra la página 404 si el departamento no existe o no está publicado', async () => {
    mockApi({ ...CONFIG, '/api/v1/departamentos/inexistente': notFound, '/api/v1/departamentos/inexistente/profesorado': notFound });
    renderRoute('/organizacion/departamentos/inexistente');
    expect(await h1('Página no encontrada')).toBeInTheDocument();
  });

  it('muestra error genérico (no 404) si falla el servidor', async () => {
    mockApi({
      ...CONFIG,
      '/api/v1/departamentos/musica': serverError,
      '/api/v1/departamentos/musica/profesorado': { body: { data: [] } },
    });
    renderRoute('/organizacion/departamentos/musica');
    expect(await screen.findByRole('alert')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Página no encontrada' })).not.toBeInTheDocument();
  });
});

describe('Páginas editoriales (historia, quiénes somos)', () => {
  const historia: Pagina = {
    id: 2,
    slug: 'historia',
    titulo_es: 'Historia del centro',
    titulo_en: null,
    bloques: [
      { id: 2, tipo: 'texto', orden: 2, contenido: { markdown_es: '## 1956\n\nEdificio de **Miguel Fisac**.' } },
      { id: 1, tipo: 'texto', orden: 1, contenido: { markdown_es: '## 1933\n\nEscuela Elemental de Trabajo.' } },
      { id: 3, tipo: 'imagen', orden: 3, contenido: { archivo_id: 9 } },
      { id: 4, tipo: 'texto', orden: 4, contenido: { markdown_es: 'Texto <script>window.__xss = true</script><img src=x onerror="window.__xss=true">' } },
    ],
  };

  it('pinta los bloques de texto en orden y como Markdown', async () => {
    const api = mockApi({ ...CONFIG, '/api/v1/paginas/historia': { body: { data: historia } } });
    renderRoute('/organizacion/historia');
    expect(await h1('Historia del centro')).toBeInTheDocument();
    const headings = screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent);
    expect(headings.indexOf('1933')).toBeLessThan(headings.indexOf('1956'));
    expect(screen.getByText('Miguel Fisac').tagName).toBe('STRONG');
    expect(api.calls()).toContain('/api/v1/paginas/historia');
  });

  it('no inyecta HTML crudo procedente del contenido', async () => {
    mockApi({ ...CONFIG, '/api/v1/paginas/historia': { body: { data: historia } } });
    const { container } = renderRoute('/organizacion/historia');
    await h1('Historia del centro');
    expect(container.querySelector('main script')).toBeNull();
    expect(container.querySelector('main img[onerror]')).toBeNull();
    expect((window as unknown as { __xss?: boolean }).__xss).toBeUndefined();
  });

  it('carga "quiénes somos" con su propio slug', async () => {
    const api = mockApi({
      ...CONFIG,
      '/api/v1/paginas/quienes-somos': { body: { data: { ...historia, slug: 'quienes-somos', titulo_es: 'Quiénes somos', bloques: [] } } },
    });
    renderRoute('/organizacion/quienes-somos');
    expect(await h1('Quiénes somos')).toBeInTheDocument();
    expect(api.calls()).toContain('/api/v1/paginas/quienes-somos');
  });

  it('muestra 404 si la página no está publicada', async () => {
    mockApi({ ...CONFIG, '/api/v1/paginas/historia': notFound });
    renderRoute('/organizacion/historia');
    expect(await h1('Página no encontrada')).toBeInTheDocument();
  });
});

describe('Órganos de gobierno', () => {
  const equipo: Organo = {
    id: 1,
    slug: 'equipo-directivo',
    tipo: 'equipo_directivo',
    nombre_es: 'Equipo directivo',
    nombre_en: null,
    descripcion_es: 'Coordina la vida del centro.',
    descripcion_en: null,
    miembros: [
      { id: 1, persona_id: 1, nombre: 'Elena Navarro Ruiz', cargo_es: 'Dirección', cargo_en: null },
      { id: 2, persona_id: 2, nombre: 'Javier Martínez López', cargo_es: 'Secretaría', cargo_en: null },
    ],
  };

  it('muestra nombre, descripción y miembros con su cargo', async () => {
    mockApi({ ...CONFIG, '/api/v1/organos/equipo-directivo': { body: { data: equipo } } });
    renderRoute('/organizacion/organos/equipo-directivo');
    expect(await h1('Equipo directivo')).toBeInTheDocument();
    expect(screen.getByText('Coordina la vida del centro.')).toBeInTheDocument();
    expect(screen.getByText('Elena Navarro Ruiz').closest('li')).toHaveTextContent('Dirección');
    expect(screen.getByText('Javier Martínez López').closest('li')).toHaveTextContent('Secretaría');
  });

  it('indica cuando no hay miembros publicados', async () => {
    mockApi({ ...CONFIG, '/api/v1/organos/claustro': { body: { data: { ...equipo, slug: 'claustro', miembros: [] } } } });
    renderRoute('/organizacion/organos/claustro');
    expect(await screen.findByText('Todavía no se han publicado sus miembros.')).toBeInTheDocument();
  });

  it('muestra 404 si el órgano no existe', async () => {
    mockApi({ ...CONFIG, '/api/v1/organos/nada': notFound });
    renderRoute('/organizacion/organos/nada');
    expect(await h1('Página no encontrada')).toBeInTheDocument();
  });
});

describe('Contacto', () => {
  it('muestra el formulario y los datos del centro desde la configuración', async () => {
    mockApi(CONFIG);
    renderRoute('/contacto');
    expect(await h1('Contacto')).toBeInTheDocument();
    const aside = screen.getByRole('complementary', { name: 'Datos del centro' });
    await waitFor(() => expect(aside).toHaveTextContent(CONFIG_FIXTURE.direccion));
    expect(within(aside).getByRole('link', { name: CONFIG_FIXTURE.telefono })).toHaveAttribute('href', 'tel:+34968000000');
    expect(within(aside).getByRole('link', { name: CONFIG_FIXTURE.email_contacto })).toHaveAttribute(
      'href',
      `mailto:${CONFIG_FIXTURE.email_contacto}`,
    );
    expect(aside).toHaveTextContent(CONFIG_FIXTURE.horario_general);
  });

  it('preselecciona el tipo desde ?tipo= (enlace "Buzón de sugerencias")', async () => {
    mockApi(CONFIG);
    renderRoute('/contacto?tipo=sugerencia');
    expect(await screen.findByLabelText('Tipo de mensaje')).toHaveValue('sugerencia');
  });
});

describe('Agenda de eventos', () => {
  it('pide hasta 24 eventos y no repite el enlace a sí misma', async () => {
    const api = mockApi({ ...CONFIG, '/api/v1/eventos': { body: { data: [], meta: { page: 1, limit: 24, total: 0 } } } });
    renderRoute('/eventos');
    expect(await h1(/agenda|eventos/i)).toBeInTheDocument();
    await waitFor(() => expect(api.calls().some((c) => c.includes('limit=24'))).toBe(true));
    expect(screen.queryByRole('link', { name: 'Ver toda la agenda' })).not.toBeInTheDocument();
  });
});

describe('Enrutado', () => {
  it.each(SECTION_INDEXES)('la portada de %s lista sus subapartados', async (path) => {
    mockApi(CONFIG);
    renderRoute(path);
    const section = FALLBACK_NAVIGATION.find((item) => item.to === path)!;
    expect(await h1(section.label)).toBeInTheDocument();
    const main = screen.getByRole('main');
    expect(within(main).getAllByRole('link').map((a) => a.getAttribute('href'))).toEqual(section.children.map((c) => c.to));
  });

  it('cada enlace interno del menú tiene una ruta (ninguno cae en 404)', async () => {
    const leaves = FALLBACK_NAVIGATION.flatMap((item) => [item.to, ...item.children.map((c) => c.to)]).map((to) => to.split('?')[0]!);
    const routed = new Set([
      '/',
      ...SECTION_INDEXES,
      '/organizacion/quienes-somos',
      '/organizacion/historia',
      '/organizacion/departamentos',
      '/organizacion/documentos',
      '/organizacion/horarios',
      '/organizacion/calendario',
      '/familias/documentos',
      '/familias/criterios-evaluacion',
      '/familias/atencion',
      '/familias/tutoriales',
      '/familias/convivencia',
      '/ensenanzas/eso',
      '/ensenanzas/bachillerato',
      '/ensenanzas/fp',
      '/ensenanzas/optativas',
      '/secretaria/cita-previa',
      '/secretaria/tramites',
      '/programas',
      '/noticias',
      '/eventos',
      '/contacto',
    ]);
    const unrouted = leaves.filter((to) => !routed.has(to) && !to.startsWith('/organizacion/organos/'));
    expect(unrouted).toEqual([]);
  });

  it('las rutas desconocidas muestran la página 404 dentro del layout', async () => {
    mockApi(CONFIG);
    renderRoute('/no/existe');
    expect(await h1('Página no encontrada')).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Menú principal' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ir al inicio' })).toHaveAttribute('href', '/');
    await waitFor(() => expect(document.title).toBe('Página no encontrada · IES Ramón Arcas Meca'));
  });

  it('la cabecera se muestra mientras se descarga una página diferida', () => {
    mockApi(CONFIG);
    renderRoute('/contacto');
    expect(screen.getByRole('navigation', { name: 'Menú principal' })).toBeInTheDocument();
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });

  it('usa el menú de la API cuando está disponible', async () => {
    mockApi({
      ...CONFIG,
      '/api/v1/menus/principal': {
        body: {
          data: {
            id: 1,
            clave: 'principal',
            nombre: 'Principal',
            items: [{ id: 1, padre_id: null, titulo_es: 'Solo API', titulo_en: null, url: '/contacto', pagina_id: null, orden: 1, children: [] }],
          },
        },
      },
    });
    renderRoute('/');
    const nav = screen.getByRole('navigation', { name: 'Menú principal' });
    expect(await within(nav).findByRole('link', { name: 'Solo API' })).toBeInTheDocument();
  });
});

describe('Pie de página', () => {
  it('muestra datos del centro, mapa del sitio y año actual', async () => {
    mockApi(CONFIG);
    renderRoute('/');
    const footer = screen.getByRole('contentinfo');
    await waitFor(() => expect(footer).toHaveTextContent(CONFIG_FIXTURE.direccion));
    const sitemap = within(footer).getByRole('navigation', { name: 'Mapa del sitio' });
    const withChildren = FALLBACK_NAVIGATION.filter((i) => i.children.length > 0);
    expect(within(sitemap).getAllByRole('heading').map((h) => h.textContent)).toEqual(withChildren.map((i) => i.label));
    for (const list of within(sitemap).getAllByRole('list')) {
      expect(within(list).getAllByRole('listitem').length).toBeLessThanOrEqual(5);
    }
    expect(footer).toHaveTextContent(`© ${new Date().getFullYear()}`);
    expect(within(footer).getByRole('link', { name: 'Contacto' })).toHaveAttribute('href', '/contacto');
  });
});
