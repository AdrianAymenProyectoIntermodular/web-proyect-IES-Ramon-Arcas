import { lazy } from 'react';

// Panel admin: se descarga solo al entrar en /admin, separado del bundle público.
export const AdminLoginPage = lazy(() => import('./pages/AdminLoginPage').then((m) => ({ default: m.AdminLoginPage })));
export const AdminLayout = lazy(() => import('./AdminLayout').then((m) => ({ default: m.AdminLayout })));
export const AdminNoticiasPage = lazy(() => import('./pages/AdminNoticiasPage').then((m) => ({ default: m.AdminNoticiasPage })));
export const AdminDocumentosPage = lazy(() => import('./pages/AdminDocumentosPage').then((m) => ({ default: m.AdminDocumentosPage })));
