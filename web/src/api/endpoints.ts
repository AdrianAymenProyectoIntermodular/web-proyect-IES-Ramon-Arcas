import { apiGet, apiPost } from './client';
import type {
  ApiMenu,
  Configuracion,
  ContactoInput,
  DataEnvelope,
  Departamento,
  Evento,
  Noticia,
  Organo,
  Pagina,
  Paginated,
  ProfesorDepartamento,
} from './types';

const unwrap = <T>(p: Promise<DataEnvelope<T>>): Promise<T> => p.then((r) => r.data);

export const getConfiguracion = (signal?: AbortSignal) =>
  unwrap(apiGet<DataEnvelope<Configuracion>>('/configuracion', undefined, signal));

export const getMenu = (clave: string, signal?: AbortSignal) =>
  unwrap(apiGet<DataEnvelope<ApiMenu>>(`/menus/${encodeURIComponent(clave)}`, undefined, signal));

export const getPagina = (slug: string, signal?: AbortSignal) =>
  unwrap(apiGet<DataEnvelope<Pagina>>(`/paginas/${encodeURIComponent(slug)}`, undefined, signal));

export const getDepartamentos = (signal?: AbortSignal) =>
  unwrap(apiGet<DataEnvelope<Departamento[]>>('/departamentos', undefined, signal));

export const getDepartamento = (slug: string, signal?: AbortSignal) =>
  unwrap(apiGet<DataEnvelope<Departamento>>(`/departamentos/${encodeURIComponent(slug)}`, undefined, signal));

export const getProfesorado = (slug: string, signal?: AbortSignal) =>
  unwrap(
    apiGet<DataEnvelope<ProfesorDepartamento[]>>(
      `/departamentos/${encodeURIComponent(slug)}/profesorado`,
      undefined,
      signal,
    ),
  );

export const getOrgano = (slug: string, signal?: AbortSignal) =>
  unwrap(apiGet<DataEnvelope<Organo>>(`/organos/${encodeURIComponent(slug)}`, undefined, signal));

/** Próximos eventos desde `desde` (YYYY-MM-DD), del más cercano al más lejano. */
export const getProximosEventos = (desde: string, limit: number, signal?: AbortSignal) =>
  apiGet<Paginated<Evento>>('/eventos', { desde, limit, sort: 'inicio', direction: 'asc' }, signal);

export const getNoticias = (limit: number, signal?: AbortSignal) =>
  apiGet<Paginated<Noticia>>('/noticias', { limit }, signal);

export const postContacto = (input: ContactoInput) =>
  apiPost<{ id: number; recibido: boolean }>('/contacto', input);
