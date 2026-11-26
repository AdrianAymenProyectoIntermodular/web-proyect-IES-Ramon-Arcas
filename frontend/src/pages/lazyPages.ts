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

export const NoticiasPage = lazy(() => import('./NoticiasPage').then((m) => ({ default: m.NoticiasPage })));
export const NoticiaPage = lazy(() => import('./NoticiaPage').then((m) => ({ default: m.NoticiaPage })));
export const EnsenanzaPage = lazy(() => import('./EnsenanzaPage').then((m) => ({ default: m.EnsenanzaPage })));
export const FpPage = lazy(() => import('./FpPage').then((m) => ({ default: m.FpPage })));
export const OptativasPage = lazy(() => import('./OptativasPage').then((m) => ({ default: m.OptativasPage })));
export const ProgramasPage = lazy(() => import('./ProgramasPage').then((m) => ({ default: m.ProgramasPage })));
export const ProgramaPage = lazy(() => import('./ProgramaPage').then((m) => ({ default: m.ProgramaPage })));
export const DocumentosPage = lazy(() => import('./DocumentosPage').then((m) => ({ default: m.DocumentosPage })));

export const AdminLoginPage = lazy(() => import('./admin/AdminLoginPage').then((m) => ({ default: m.AdminLoginPage })));
export const AdminLayout = lazy(() => import('./admin/AdminLayout').then((m) => ({ default: m.AdminLayout })));
export const AdminNoticiasPage = lazy(() => import('./admin/AdminNoticiasPage').then((m) => ({ default: m.AdminNoticiasPage })));
export const AdminDocumentosPage = lazy(() => import('./admin/AdminDocumentosPage').then((m) => ({ default: m.AdminDocumentosPage })));
