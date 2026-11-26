import { apiGet, apiPost } from './client';
import type {
  ApiMenu,
  CategoriaDocumento,
  Configuracion,
  ContactoInput,
  DataEnvelope,
  Departamento,
  Documento,
  Enlace,
  Ensenanza,
  Evento,
  MateriaOptativa,
  Modulo,
  Noticia,
  OfertaOptativa,
  Organo,
  Pagina,
  Paginated,
  ProfesorDepartamento,
  Programa,
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

// --- Noticias ---

/** Listado paginado, de la más reciente a la más antigua. */
export const getNoticias = (page: number, limit: number, signal?: AbortSignal) =>
  apiGet<Paginated<Noticia>>('/noticias', { page, limit, sort: 'publicado_en', direction: 'desc' }, signal);

export const getNoticia = (slug: string, signal?: AbortSignal) =>
  unwrap(apiGet<DataEnvelope<Noticia>>(`/noticias/${encodeURIComponent(slug)}`, undefined, signal));

// --- Enseñanzas y optativas ---

export const getEnsenanzas = (tipo: string | undefined, limit: number, signal?: AbortSignal) =>
  apiGet<Paginated<Ensenanza>>(
    '/ensenanzas',
    { tipo, limit, sort: 'orden', direction: 'asc' },
    signal,
  );

export const getEnsenanza = (slug: string, signal?: AbortSignal) =>
  unwrap(apiGet<DataEnvelope<Ensenanza>>(`/ensenanzas/${encodeURIComponent(slug)}`, undefined, signal));

export const getModulos = (slug: string, signal?: AbortSignal) =>
  unwrap(apiGet<DataEnvelope<Modulo[]>>(`/ensenanzas/${encodeURIComponent(slug)}/modulos`, undefined, signal));

export const getMateriasOptativas = (signal?: AbortSignal) =>
  unwrap(apiGet<DataEnvelope<MateriaOptativa[]>>('/materias-optativas', undefined, signal));

export const getMateriaOptativa = (slug: string, signal?: AbortSignal) =>
  unwrap(apiGet<DataEnvelope<MateriaOptativa>>(`/materias-optativas/${encodeURIComponent(slug)}`, undefined, signal));

export const getOfertasOptativas = (signal?: AbortSignal) =>
  unwrap(apiGet<DataEnvelope<OfertaOptativa[]>>('/ofertas-optativas', undefined, signal));

// --- Programas ---

export const getProgramas = (limit: number, signal?: AbortSignal) =>
  apiGet<Paginated<Programa>>('/programas', { limit, sort: 'orden', direction: 'asc' }, signal);

export const getPrograma = (slug: string, signal?: AbortSignal) =>
  unwrap(apiGet<DataEnvelope<Programa>>(`/programas/${encodeURIComponent(slug)}`, undefined, signal));

// --- Documentos y enlaces ---

export const getCategoriasDocumentos = (signal?: AbortSignal) =>
  unwrap(apiGet<DataEnvelope<CategoriaDocumento[]>>('/categorias-documentos', undefined, signal));

export const getDocumentos = (
  filtros: { categoria?: string; ensenanza_id?: number; limit?: number; page?: number } = {},
  signal?: AbortSignal,
) =>
  apiGet<Paginated<Documento>>(
    '/documentos',
    {
      categoria: filtros.categoria,
      ensenanza_id: filtros.ensenanza_id,
      limit: filtros.limit ?? 24,
      page: filtros.page ?? 1,
    },
    signal,
  );

export const getEnlaces = (grupo?: string, signal?: AbortSignal) =>
  unwrap(apiGet<DataEnvelope<Enlace[]>>('/enlaces', { grupo }, signal));

export const postContacto = (input: ContactoInput) =>
  apiPost<{ id: number; recibido: boolean }>('/contacto', input);
