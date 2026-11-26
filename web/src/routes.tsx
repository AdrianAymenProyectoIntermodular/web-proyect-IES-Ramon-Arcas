import type { RouteObject } from 'react-router';
import { AdminRoot } from './pages/admin/AdminRoot';
import { SiteLayout } from './components/layout/SiteLayout';
import { HomePage } from './pages/HomePage';
import {
  AdminDocumentosPage,
  AdminLayout,
  AdminLoginPage,
  AdminNoticiasPage,
  ContactoPage,
  DepartamentoPage,
  DepartamentosPage,
  DocumentosPage,
  EnsenanzaPage,
  EventosPage,
  FpPage,
  NoticiaPage,
  NoticiasPage,
  OptativasPage,
  OrganoPage,
  PaginaPage,
  ProgramaPage,
  ProgramasPage,
  SectionPage,
} from './pages/lazyPages';
import { NotFoundPage } from './pages/NotFoundPage';

// Portada y 404 van en el bundle inicial; el resto se descarga al navegar.

/**
 * Secciones del menú aún sin implementar. Tras E3–E4 queda vacío.
 */
export const PENDING_SECTIONS: ReadonlyArray<{ path: string; title: string }> = [];

/** Apartados con subapartados que muestran su índice. */
export const SECTION_INDEXES = ['/organizacion', '/familias', '/ensenanzas', '/secretaria'] as const;

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <SiteLayout />,
    children: [
      { index: true, element: <HomePage /> },
      ...SECTION_INDEXES.map((path) => ({ path, element: <SectionPage path={path} /> })),
      { path: '/organizacion/quienes-somos', element: <PaginaPage slug="quienes-somos" eyebrow="Organización" /> },
      { path: '/organizacion/historia', element: <PaginaPage slug="historia" eyebrow="Organización" /> },
      { path: '/organizacion/organos/:slug', element: <OrganoPage /> },
      { path: '/organizacion/departamentos', element: <DepartamentosPage /> },
      { path: '/organizacion/departamentos/:slug', element: <DepartamentoPage /> },
      { path: '/organizacion/documentos', element: <DocumentosPage title="Documentos institucionales" eyebrow="Organización" intro="Documentos y normativa del centro." categorias={['institucional', 'horarios']} gruposEnlaces={['institucional']} /> },
      { path: '/organizacion/horarios', element: <PaginaPage slug="horarios" eyebrow="Organización" documentosCategoria="horarios" /> },
      { path: '/organizacion/calendario', element: <PaginaPage slug="calendario" eyebrow="Organización" documentosCategoria="institucional" enlacesGrupos={['institucional']} /> },
      { path: '/familias/documentos', element: <DocumentosPage title="Documentos y enlaces" eyebrow="Familias" intro="Documentos y enlaces de interés para las familias." categorias={['familias']} gruposEnlaces={['plataformas', 'familias']} /> },
      { path: '/familias/criterios-evaluacion', element: <PaginaPage slug="criterios-evaluacion" eyebrow="Familias" documentosCategoria="familias" /> },
      { path: '/familias/atencion', element: <PaginaPage slug="atencion" eyebrow="Familias" documentosCategoria="familias" enlacesGrupos={['familias']} /> },
      { path: '/familias/tutoriales', element: <PaginaPage slug="tutoriales" eyebrow="Familias" enlacesGrupos={['plataformas']} /> },
      { path: '/familias/convivencia', element: <PaginaPage slug="convivencia" eyebrow="Familias" documentosCategoria="familias" /> },
      { path: '/ensenanzas/eso', element: <EnsenanzaPage slug="eso" /> },
      { path: '/ensenanzas/bachillerato', element: <EnsenanzaPage slug="bachillerato" /> },
      { path: '/ensenanzas/fp', element: <FpPage /> },
      { path: '/ensenanzas/optativas', element: <OptativasPage /> },
      { path: '/ensenanzas/:slug', element: <EnsenanzaPage /> },
      { path: '/secretaria/cita-previa', element: <PaginaPage slug="cita-previa" eyebrow="Secretaría" documentosCategoria="secretaria" enlacesGrupos={['secretaria']} /> },
      { path: '/secretaria/tramites', element: <PaginaPage slug="tramites" eyebrow="Secretaría" documentosCategoria="secretaria" enlacesGrupos={['secretaria']} /> },
      { path: '/programas', element: <ProgramasPage /> },
      { path: '/programas/:slug', element: <ProgramaPage /> },
      { path: '/noticias', element: <NoticiasPage /> },
      { path: '/noticias/:slug', element: <NoticiaPage /> },
      { path: '/eventos', element: <EventosPage /> },
      { path: '/contacto', element: <ContactoPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
  {
    path: '/admin',
    element: <AdminRoot />,
    children: [
      { index: true, element: <AdminLoginPage /> },
      { path: 'login', element: <AdminLoginPage /> },
      {
        element: <AdminLayout />,
        children: [
          { path: 'noticias', element: <AdminNoticiasPage /> },
          { path: 'documentos', element: <AdminDocumentosPage /> },
        ],
      },
    ],
  },
];
