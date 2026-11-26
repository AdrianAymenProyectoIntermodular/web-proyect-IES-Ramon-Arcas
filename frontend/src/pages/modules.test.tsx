import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { Ensenanza } from '../api/types';
import { PENDING_SECTIONS, SECTION_INDEXES } from '../routes';
import { CONFIG_FIXTURE, mockApi, renderRoute, type MockReply } from '../test/utils';

const CONFIG: Record<string, MockReply> = { '/api/v1/configuracion': { body: { data: CONFIG_FIXTURE } } };
const notFound = { status: 404, body: { error: { code: 'not_found', message: 'Recurso no encontrado' } } };
const serverError = { status: 500, body: { error: { code: 'server_error', message: 'x' } } };

const h1 = (name: string | RegExp) => screen.findByRole('heading', { level: 1, name });

void PENDING_SECTIONS;
void SECTION_INDEXES;

describe('Noticias', () => {
  const noticia = (overrides: Partial<ReturnType<typeof baseNoticia>> = {}) => ({ ...baseNoticia(), ...overrides });
  function baseNoticia() {
    return {
      id: 1,
      slug: 'apertura-curso',
      titulo_es: 'Apertura del curso',
      titulo_en: null,
      resumen_es: 'Resumen de la noticia',
      resumen_en: null,
      cuerpo_es: '## Encabezado\n\nTexto de la noticia.',
      cuerpo_en: null,
      categoria: 'academico',
      imagen_id: null,
      publicado_en: '2026-11-20 09:00:00',
      destacado: false,
    };
  }

  it('lista las noticias con paginación y enlaces', async () => {
    const api = mockApi({
      ...CONFIG,
      '/api/v1/noticias': { body: { data: [noticia()], meta: { page: 1, limit: 6, total: 8 } } },
    });
    renderRoute('/noticias');
    expect(await h1('Noticias')).toBeInTheDocument();
    expect(await screen.findByRole('link', { name: /Apertura del curso/ })).toHaveAttribute(
      'href',
      '/noticias/apertura-curso',
    );
    expect(screen.getByText('Resumen de la noticia')).toBeInTheDocument();
    expect(await screen.findByRole('link', { name: 'Siguiente' })).toHaveAttribute('href', '/noticias?page=2');
    expect(api.calls().some((c) => c.includes('page=1') && c.includes('limit=6'))).toBe(true);
  });

  it('indica cuando no hay noticias', async () => {
    mockApi({ ...CONFIG, '/api/v1/noticias': { body: { data: [], meta: { page: 1, limit: 6, total: 0 } } } });
    renderRoute('/noticias');
    expect(await screen.findByText('Todavía no hay noticias publicadas.')).toBeInTheDocument();
  });

  it('muestra error si la API falla', async () => {
    mockApi({ ...CONFIG, '/api/v1/noticias': serverError });
    renderRoute('/noticias');
    expect(await screen.findByRole('alert')).toBeInTheDocument();
  });

  it('pinta el detalle como Markdown y enlaza al listado', async () => {
    mockApi({ ...CONFIG, '/api/v1/noticias/apertura-curso': { body: { data: noticia() } } });
    renderRoute('/noticias/apertura-curso');
    expect(await h1('Apertura del curso')).toBeInTheDocument();
    expect(screen.getByText('Resumen de la noticia')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Encabezado' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Todas las noticias/ })).toHaveAttribute('href', '/noticias');
  });

  it('muestra 404 si la noticia no existe', async () => {
    mockApi({ ...CONFIG, '/api/v1/noticias/nope': notFound });
    renderRoute('/noticias/nope');
    expect(await h1('Página no encontrada')).toBeInTheDocument();
  });
});

describe('Enseñanzas', () => {
  const ensenanza = (overrides: Partial<Ensenanza> = {}): Ensenanza => ({
    id: 1,
    slug: 'eso',
    tipo: 'eso',
    familia: null,
    titulo_es: 'Educación Secundaria Obligatoria',
    titulo_en: null,
    requisitos_es: 'Haber finalizado la Educación Primaria.',
    requisitos_en: null,
    duracion_es: '4 cursos',
    duracion_en: null,
    salidas_es: 'Bachillerato o FP.',
    salidas_en: null,
    orden: 1,
    ...overrides,
  });

  it('muestra requisitos, duración, salidas y módulos', async () => {
    mockApi({
      ...CONFIG,
      '/api/v1/ensenanzas/eso': { body: { data: ensenanza() } },
      '/api/v1/ensenanzas/eso/modulos': { body: { data: [{ id: 1, nombre_es: 'Robótica', nombre_en: null, horas: 120, orden: 1 }] } },
      '/api/v1/documentos': {
        body: { data: [{ id: 5, titulo_es: 'Guía', titulo_en: null, descripcion_es: 'Desc', categoria_id: 1, categoria_slug: 'institucional', curso_academico_id: null, ensenanza_id: 1, archivo_id: 9, archivo_ruta: 'uploads/x.pdf', archivo_mime: 'application/pdf', publicado_en: null, url_descarga: '/storage/uploads/x.pdf' }], meta: { page: 1, limit: 24, total: 1 } },
      },
    });
    renderRoute('/ensenanzas/eso');
    expect(await h1('Educación Secundaria Obligatoria')).toBeInTheDocument();
    expect(await screen.findByText('Haber finalizado la Educación Primaria.')).toBeInTheDocument();
    expect(await screen.findByText('4 cursos')).toBeInTheDocument();
    expect(await screen.findByText('Bachillerato o FP.')).toBeInTheDocument();
    expect(await screen.findByText('Robótica')).toBeInTheDocument();
    expect(await screen.findByText('120 horas')).toBeInTheDocument();
    expect(await screen.findByRole('link', { name: 'Guía' })).toHaveAttribute('href', '/storage/uploads/x.pdf');
  });

  it('muestra 404 si la enseñanza no existe', async () => {
    mockApi({ ...CONFIG, '/api/v1/ensenanzas/nope': notFound, '/api/v1/ensenanzas/nope/modulos': notFound });
    renderRoute('/ensenanzas/nope');
    expect(await h1('Página no encontrada')).toBeInTheDocument();
  });

  it('agrupa los ciclos de FP por familia', async () => {
    const fp1 = ensenanza({ id: 2, slug: 'daw', tipo: 'fp', familia: 'Informática', titulo_es: 'Desarrollo de Aplicaciones Web', duracion_es: '2 cursos' });
    const fp2 = ensenanza({ id: 3, slug: 'smr', tipo: 'fp', familia: 'Informática', titulo_es: 'Sistemas Microinformáticos', duracion_es: '2 cursos' });
    mockApi({
      ...CONFIG,
      '/api/v1/ensenanzas': { body: { data: [fp1, fp2], meta: { page: 1, limit: 50, total: 2 } } },
    });
    renderRoute('/ensenanzas/fp');
    expect(await h1('Formación Profesional')).toBeInTheDocument();
    expect(await screen.findByRole('heading', { level: 2, name: 'Informática' })).toBeInTheDocument();
    expect(await screen.findByRole('link', { name: /Desarrollo de Aplicaciones Web/ })).toHaveAttribute('href', '/ensenanzas/daw');
    expect(await screen.findByRole('link', { name: /Sistemas Microinformáticos/ })).toBeInTheDocument();
  });

  it('muestra las materias optativas y su oferta por curso', async () => {
    mockApi({
      ...CONFIG,
      '/api/v1/materias-optativas': { body: { data: [{ id: 1, slug: 'robotica', nombre_es: 'Robótica', nombre_en: null, descripcion_es: 'Robots.', descripcion_en: null }] } },
      '/api/v1/ofertas-optativas': { body: { data: [{ id: 1, nivel: '3ESO', curso_academico_id: 2, ensenanza_id: 1, materia_slug: 'robotica', nombre_es: 'Robótica', nombre_en: null }] } },
      '/api/v1/ensenanzas': { body: { data: [ensenanza()], meta: { page: 1, limit: 50, total: 1 } } },
    });
    renderRoute('/ensenanzas/optativas');
    expect(await h1('Materias optativas')).toBeInTheDocument();
    expect(await screen.findByRole('heading', { level: 3, name: 'Robótica' })).toBeInTheDocument();
    expect(await screen.findByText('Robots.')).toBeInTheDocument();
    expect(await screen.findByText('3ESO')).toBeInTheDocument();
  });
});

describe('Programas', () => {
  const programa = (overrides: Partial<ReturnType<typeof basePrograma>> = {}) => ({ ...basePrograma(), ...overrides });
  function basePrograma() {
    return {
      id: 1,
      slug: 'erasmus-plus',
      categoria: 'educativo',
      titulo_es: 'Erasmus+',
      titulo_en: null,
      descripcion_es: 'Movilidad europea.',
      descripcion_en: null,
      documento_id: null,
      imagen_id: null,
      orden: 1,
      departamentos: [{ id: 2, slug: 'ingles', nombre_es: 'Inglés', nombre_en: null }],
    };
  }

  it('agrupa los programas por categoría', async () => {
    mockApi({
      ...CONFIG,
      '/api/v1/programas': {
        body: {
          data: [programa(), programa({ id: 2, slug: 'plan-lector', categoria: 'plan_centro', titulo_es: 'Plan lector' })],
          meta: { page: 1, limit: 50, total: 2 },
        },
      },
    });
    renderRoute('/programas');
    expect(await h1('Programas')).toBeInTheDocument();
    expect(await screen.findByRole('heading', { level: 2, name: 'Programas educativos' })).toBeInTheDocument();
    expect(await screen.findByRole('heading', { level: 2, name: 'Planes de centro' })).toBeInTheDocument();
    expect(await screen.findByRole('link', { name: /Erasmus\+/ })).toHaveAttribute('href', '/programas/erasmus-plus');
    expect(await screen.findByRole('link', { name: /Plan lector/ })).toBeInTheDocument();
  });

  it('muestra los departamentos del programa y enlaza a ellos', async () => {
    mockApi({ ...CONFIG, '/api/v1/programas/erasmus-plus': { body: { data: programa() } } });
    renderRoute('/programas/erasmus-plus');
    expect(await h1('Erasmus+')).toBeInTheDocument();
    expect(screen.getByText('Movilidad europea.')).toBeInTheDocument();
    expect(await screen.findByRole('link', { name: /Inglés/ })).toHaveAttribute('href', '/organizacion/departamentos/ingles');
  });

  it('muestra 404 si el programa no existe', async () => {
    mockApi({ ...CONFIG, '/api/v1/programas/nope': notFound });
    renderRoute('/programas/nope');
    expect(await h1('Página no encontrada')).toBeInTheDocument();
  });
});

describe('Documentos y enlaces', () => {
  const documento = (overrides: Record<string, unknown> = {}) => ({
    id: 7,
    titulo_es: 'Calendario escolar',
    titulo_en: null,
    descripcion_es: 'Fechas del curso',
    descripcion_en: null,
    categoria_id: 1,
    categoria_slug: 'institucional',
    curso_academico_id: 2,
    ensenanza_id: null,
    archivo_id: 3,
    archivo_ruta: 'uploads/x.pdf',
    archivo_mime: 'application/pdf',
    publicado_en: null,
    url_descarga: '/storage/uploads/x.pdf',
    ...overrides,
  });

  it('muestra descargas y enlaces externos', async () => {
    mockApi({
      ...CONFIG,
      '/api/v1/documentos': {
        body: { data: [documento()], meta: { page: 1, limit: 24, total: 1 } },
      },
      '/api/v1/enlaces': { body: { data: [{ id: 1, grupo: 'institucional', titulo_es: 'Portal', titulo_en: null, url: 'https://transparencia.murcia.example', orden: 1 }] } },
      '/api/v1/categorias-documentos': { body: { data: [{ id: 1, slug: 'institucional', nombre_es: 'Documentos institucionales', nombre_en: null, orden: 1 }] } },
    });
    renderRoute('/organizacion/documentos');
    expect(await h1('Documentos institucionales')).toBeInTheDocument();
    expect(await screen.findByRole('link', { name: 'Calendario escolar' })).toHaveAttribute('href', '/storage/uploads/x.pdf');
    expect(await screen.findByText('Fechas del curso')).toBeInTheDocument();
    const enlace = await screen.findByRole('link', { name: 'Portal' });
    expect(enlace).toHaveAttribute('href', 'https://transparencia.murcia.example');
    expect(enlace).toHaveAttribute('target', '_blank');
    expect(enlace).toHaveAttribute('rel', expect.stringContaining('noopener'));
  });

  it('indica cuando no hay documentos ni enlaces', async () => {
    mockApi({
      ...CONFIG,
      '/api/v1/documentos': { body: { data: [], meta: { page: 1, limit: 24, total: 0 } } },
      '/api/v1/enlaces': { body: { data: [] } },
      '/api/v1/categorias-documentos': { body: { data: [] } },
    });
    renderRoute('/familias/documentos');
    expect(await screen.findByText('Todavía no hay documentos ni enlaces publicados.')).toBeInTheDocument();
  });

  it('pinta páginas editoriales con documentos y enlaces', async () => {
    const pagina = {
      id: 3,
      slug: 'cita-previa',
      titulo_es: 'Cita previa',
      titulo_en: null,
      bloques: [{ id: 1, tipo: 'texto', orden: 1, contenido: { markdown_es: '## Solicitud\n\nTexto.' } }],
    };
    mockApi({
      ...CONFIG,
      '/api/v1/paginas/cita-previa': { body: { data: pagina } },
      '/api/v1/documentos': { body: { data: [documento({ id: 8, categoria_slug: 'secretaria', titulo_es: 'Formulario' })], meta: { page: 1, limit: 24, total: 1 } } },
      '/api/v1/enlaces': { body: { data: [{ id: 2, grupo: 'secretaria', titulo_es: 'Sede electrónica', titulo_en: null, url: 'https://sede.murcia.example', orden: 1 }] } },
      '/api/v1/categorias-documentos': { body: { data: [{ id: 4, slug: 'secretaria', nombre_es: 'Secretaría', nombre_en: null, orden: 4 }] } },
    });
    renderRoute('/secretaria/cita-previa');
    expect(await h1('Cita previa')).toBeInTheDocument();
    expect(await screen.findByRole('heading', { level: 2, name: 'Solicitud' })).toBeInTheDocument();
    expect(await screen.findByRole('link', { name: 'Formulario' })).toBeInTheDocument();
    expect(await screen.findByRole('link', { name: 'Sede electrónica' })).toHaveAttribute('href', 'https://sede.murcia.example');
  });
});
