import { apiDelete, apiGet, apiPatch, apiPost, apiUpload } from './client';
import type { Paginated } from './types';

export type AdminRole = 'admin' | 'editor' | 'secretaria';

export interface AdminUser {
  id: number;
  email: string;
  nombre: string;
  rol: AdminRole;
}

export interface AdminSession {
  user: AdminUser;
  csrf_token: string;
}

export interface AdminNoticia {
  id: number;
  slug: string;
  titulo_es: string;
  titulo_en: string | null;
  resumen_es: string | null;
  cuerpo_es: string;
  categoria: string | null;
  estado: string;
  publicado_en: string | null;
  destacado: number | boolean;
}

export interface AdminDocumento {
  id: number;
  titulo_es: string;
  titulo_en: string | null;
  descripcion_es: string | null;
  categoria_id: number;
  archivo_id: number;
  estado: string;
  publicado_en: string | null;
}

export interface AdminCategoriaDocumento {
  id: number;
  slug: string;
  nombre_es: string;
  nombre_en: string | null;
  orden: number;
}

const csrf = (token: string) => ({ 'X-CSRF-Token': token });

export const getAdminCsrf = () => apiGet<{ csrf_token: string }>('/admin/csrf');

export const adminLogin = (email: string, password: string, token: string) =>
  apiPost<AdminSession>('/admin/login', { email, password }, { headers: csrf(token) });

export const adminLogout = (token: string) => apiPost<void>('/admin/logout', {}, { headers: csrf(token) });

export const getAdminMe = (signal?: AbortSignal) => apiGet<AdminSession>('/admin/me', undefined, signal);

// --- Noticias ---

export const listAdminNoticias = (signal?: AbortSignal) =>
  apiGet<Paginated<AdminNoticia>>(
    '/admin/noticias',
    { limit: 50, sort: 'id', direction: 'desc' },
    signal,
  );

export interface NoticiaInput {
  slug: string;
  titulo_es: string;
  resumen_es: string | null;
  cuerpo_es: string;
  categoria: string | null;
  estado: string;
  publicado_en: string | null;
}

export const createAdminNoticia = (input: NoticiaInput, token: string) =>
  apiPost<{ id: number }>('/admin/noticias', input, { headers: csrf(token) });

export const patchAdminNoticia = (id: number, input: Partial<NoticiaInput>, token: string) =>
  apiPatch<{ ok: true }>(`/admin/noticias/${id}`, input, { headers: csrf(token) });

export const archiveAdminNoticia = (id: number, token: string) =>
  apiDelete<void>(`/admin/noticias/${id}`, { headers: csrf(token) });

// --- Documentos ---

export const listAdminDocumentos = (signal?: AbortSignal) =>
  apiGet<Paginated<AdminDocumento>>(
    '/admin/documentos',
    { limit: 50, sort: 'id', direction: 'desc' },
    signal,
  );

export const listAdminCategoriasDocumentos = (signal?: AbortSignal) =>
  apiGet<{ data: AdminCategoriaDocumento[] }>('/admin/categorias-documentos', undefined, signal);

export interface DocumentoInput {
  titulo_es: string;
  descripcion_es: string | null;
  categoria_id: number;
  archivo_id?: number;
  estado: string;
  publicado_en: string | null;
}

export const createAdminDocumento = (input: DocumentoInput, token: string) =>
  apiPost<{ id: number }>('/admin/documentos', input, { headers: csrf(token) });

export const patchAdminDocumento = (id: number, input: Partial<DocumentoInput>, token: string) =>
  apiPatch<{ ok: true }>(`/admin/documentos/${id}`, input, { headers: csrf(token) });

export const archiveAdminDocumento = (id: number, token: string) =>
  apiDelete<void>(`/admin/documentos/${id}`, { headers: csrf(token) });

/** Sube el archivo y devuelve su id para asociarlo a un documento. */
export const uploadAdminArchivo = (file: File, token: string) => {
  const form = new FormData();
  form.append('file', file);
  return apiUpload<{ id: number; ruta: string; url: string }>('/admin/archivos', form, {
    headers: csrf(token),
  });
};
