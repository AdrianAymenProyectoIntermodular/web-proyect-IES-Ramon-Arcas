import { lazy } from 'react';

// React.lazy (y no `route.lazy`) para que cabecera y pie se pinten al instante
// mientras el <Suspense> de SiteLayout espera al contenido.
export const SectionPage = lazy(() => import('./SectionPage').then((m) => ({ default: m.SectionPage })));
export const PaginaPage = lazy(() => import('./PaginaPage').then((m) => ({ default: m.PaginaPage })));
export const OrganoPage = lazy(() => import('./OrganoPage').then((m) => ({ default: m.OrganoPage })));
export const DepartamentosPage = lazy(() => import('./DepartamentosPage').then((m) => ({ default: m.DepartamentosPage })));
export const DepartamentoPage = lazy(() => import('./DepartamentoPage').then((m) => ({ default: m.DepartamentoPage })));
export const EventosPage = lazy(() => import('./EventosPage').then((m) => ({ default: m.EventosPage })));
export const ContactoPage = lazy(() => import('./ContactoPage').then((m) => ({ default: m.ContactoPage })));
export const ComingSoonPage = lazy(() => import('./ComingSoonPage').then((m) => ({ default: m.ComingSoonPage })));
