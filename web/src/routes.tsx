import type { RouteObject } from 'react-router';
import { SiteLayout } from './components/layout/SiteLayout';
import { HomePage } from './pages/HomePage';
import {
  ComingSoonPage,
  ContactoPage,
  DepartamentoPage,
  DepartamentosPage,
  EventosPage,
  OrganoPage,
  PaginaPage,
  SectionPage,
} from './pages/lazyPages';
import { NotFoundPage } from './pages/NotFoundPage';

// Portada y 404 van en el bundle inicial; el resto se descarga al navegar.

/**
 * Secciones del menú aún sin implementar. Al implementar una, se quita de aquí
 * y se añade su ruta real abajo (ver reparto en docs/proyecto-intermodular.md).
 */
export const PENDING_SECTIONS: ReadonlyArray<{ path: string; title: string }> = [
  { path: '/organizacion/documentos', title: 'Documentos institucionales' },
  { path: '/organizacion/horarios', title: 'Horarios' },
  { path: '/organizacion/calendario', title: 'Calendario escolar' },
  { path: '/familias/documentos', title: 'Documentos y enlaces' },
  { path: '/familias/criterios-evaluacion', title: 'Criterios de evaluación' },
  { path: '/familias/atencion', title: 'Atención a familias' },
  { path: '/familias/tutoriales', title: 'Tutoriales de plataformas' },
  { path: '/familias/convivencia', title: 'Guía de convivencia' },
  { path: '/ensenanzas/eso', title: 'ESO' },
  { path: '/ensenanzas/bachillerato', title: 'Bachillerato' },
  { path: '/ensenanzas/fp', title: 'Formación Profesional' },
  { path: '/ensenanzas/optativas', title: 'Materias optativas' },
  { path: '/secretaria/cita-previa', title: 'Cita previa' },
  { path: '/secretaria/tramites', title: 'Trámites administrativos' },
  { path: '/programas', title: 'Programas' },
  { path: '/noticias', title: 'Noticias' },
];

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
      { path: '/eventos', element: <EventosPage /> },
      { path: '/contacto', element: <ContactoPage /> },
      ...PENDING_SECTIONS.map(({ path, title }) => ({ path, element: <ComingSoonPage title={title} /> })),
      { path: '*', element: <NotFoundPage /> },
    ],
  },
];
