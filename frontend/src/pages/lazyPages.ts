import { lazy } from 'react';

// React.lazy (y no `route.lazy`) para que cabecera y pie se pinten al instante
// mientras el <Suspense> de SiteLayout espera al contenido.
export const SectionPage = lazy(() => import('./comunes/SectionPage').then((m) => ({ default: m.SectionPage })));
export const PaginaPage = lazy(() => import('./comunes/PaginaPage').then((m) => ({ default: m.PaginaPage })));
export const OrganoPage = lazy(() => import('./organizacion/OrganoPage').then((m) => ({ default: m.OrganoPage })));
export const DepartamentosPage = lazy(() => import('./organizacion/DepartamentosPage').then((m) => ({ default: m.DepartamentosPage })));
export const DepartamentoPage = lazy(() => import('./organizacion/DepartamentoPage').then((m) => ({ default: m.DepartamentoPage })));
export const EventosPage = lazy(() => import('./noticias/EventosPage').then((m) => ({ default: m.EventosPage })));
export const ContactoPage = lazy(() => import('./contacto/ContactoPage').then((m) => ({ default: m.ContactoPage })));
export const ComingSoonPage = lazy(() => import('./comunes/ComingSoonPage').then((m) => ({ default: m.ComingSoonPage })));

export const NoticiasPage = lazy(() => import('./noticias/NoticiasPage').then((m) => ({ default: m.NoticiasPage })));
export const NoticiaPage = lazy(() => import('./noticias/NoticiaPage').then((m) => ({ default: m.NoticiaPage })));
export const EnsenanzaPage = lazy(() => import('./ensenanzas/EnsenanzaPage').then((m) => ({ default: m.EnsenanzaPage })));
export const FpPage = lazy(() => import('./ensenanzas/FpPage').then((m) => ({ default: m.FpPage })));
export const OptativasPage = lazy(() => import('./ensenanzas/OptativasPage').then((m) => ({ default: m.OptativasPage })));
export const ProgramasPage = lazy(() => import('./programas/ProgramasPage').then((m) => ({ default: m.ProgramasPage })));
export const ProgramaPage = lazy(() => import('./programas/ProgramaPage').then((m) => ({ default: m.ProgramaPage })));
export const DocumentosPage = lazy(() => import('./comunes/DocumentosPage').then((m) => ({ default: m.DocumentosPage })));
