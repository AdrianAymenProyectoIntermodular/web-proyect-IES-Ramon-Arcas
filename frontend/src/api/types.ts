/** Tipos del contrato público (`openapi.yaml`). Solo los campos que consume el front. */

export interface DataEnvelope<T> {
  data: T;
}

export interface Paginated<T> {
  data: T[];
  meta: { page: number; limit: number; total: number };
}

export type Configuracion = Partial<
  Record<
    | 'nombre_centro'
    | 'localizacion'
    | 'direccion'
    | 'email_contacto'
    | 'telefono'
    | 'intranet_url'
    | 'horario_general',
    string
  >
>;

export interface ApiMenuItem {
  id: number;
  padre_id: number | null;
  titulo_es: string;
  titulo_en: string | null;
  url: string | null;
  pagina_id: number | null;
  orden: number;
  children: ApiMenuItem[];
}

export interface ApiMenu {
  id: number;
  clave: string;
  nombre: string;
  items: ApiMenuItem[];
}

export interface Departamento {
  id: number;
  slug: string;
  nombre_es: string;
  nombre_en: string | null;
  presentacion_es: string | null;
  presentacion_en: string | null;
  contacto_publico: string | null;
}

export interface ProfesorDepartamento {
  id: number;
  nombre: string;
  foto_id: number | null;
  cargo_es: string | null;
  cargo_en: string | null;
}

export interface Evento {
  id: number;
  slug: string;
  titulo_es: string;
  titulo_en: string | null;
  tipo: string | null;
  descripcion_es: string | null;
  descripcion_en: string | null;
  inicio: string;
  fin: string | null;
  lugar: string | null;
  destinatarios: string | null;
}

export interface PaginaBloque {
  id: number;
  tipo: 'texto' | 'imagen' | 'documentos' | 'enlaces';
  orden: number;
  contenido: Record<string, unknown> | null;
}

export interface Pagina {
  id: number;
  slug: string;
  titulo_es: string;
  titulo_en: string | null;
  bloques: PaginaBloque[];
}

export interface OrganoMiembro {
  id: number;
  persona_id: number;
  nombre: string;
  cargo_es: string;
  cargo_en: string | null;
}

export interface Organo {
  id: number;
  slug: string;
  tipo: string;
  nombre_es: string;
  nombre_en: string | null;
  descripcion_es: string | null;
  descripcion_en: string | null;
  miembros: OrganoMiembro[];
}

export interface Noticia {
  id: number;
  slug: string;
  titulo_es: string;
  titulo_en: string | null;
  resumen_es: string | null;
  resumen_en: string | null;
  cuerpo_es: string;
  cuerpo_en: string | null;
  categoria: string | null;
  imagen_id: number | null;
  publicado_en: string | null;
  destacado: boolean;
}

export type EnsenanzaTipo = 'eso' | 'bachillerato' | 'fp' | 'otro';

export interface Ensenanza {
  id: number;
  slug: string;
  tipo: EnsenanzaTipo;
  familia: string | null;
  titulo_es: string;
  titulo_en: string | null;
  requisitos_es: string | null;
  requisitos_en: string | null;
  duracion_es: string | null;
  duracion_en: string | null;
  salidas_es: string | null;
  salidas_en: string | null;
  orden: number;
}

export interface Modulo {
  id: number;
  nombre_es: string;
  nombre_en: string | null;
  horas: number | null;
  orden: number;
}

export interface MateriaOptativa {
  id: number;
  slug: string;
  nombre_es: string;
  nombre_en: string | null;
  descripcion_es: string | null;
  descripcion_en: string | null;
  ofertas?: OfertaMateria[];
}

export interface OfertaMateria {
  id: number;
  nivel: string;
  curso_academico_id: number;
  ensenanza_slug: string;
  ensenanza_titulo_es: string;
  curso_academico: string;
}

export interface OfertaOptativa {
  id: number;
  nivel: string;
  curso_academico_id: number;
  ensenanza_id: number;
  materia_slug: string;
  nombre_es: string;
  nombre_en: string | null;
}

export type ProgramaCategoria = 'educativo' | 'plan_centro' | 'actividad' | 'otro';

export interface ProgramaDepartamento {
  id: number;
  slug: string;
  nombre_es: string;
  nombre_en: string | null;
}

export interface Programa {
  id: number;
  slug: string;
  categoria: ProgramaCategoria;
  titulo_es: string;
  titulo_en: string | null;
  descripcion_es: string | null;
  descripcion_en: string | null;
  documento_id: number | null;
  imagen_id: number | null;
  orden: number;
  departamentos: ProgramaDepartamento[];
}

export interface CategoriaDocumento {
  id: number;
  slug: string;
  nombre_es: string;
  nombre_en: string | null;
  orden: number;
}

export interface Documento {
  id: number;
  titulo_es: string;
  titulo_en: string | null;
  descripcion_es: string | null;
  descripcion_en: string | null;
  categoria_id: number;
  categoria_slug: string;
  curso_academico_id: number | null;
  ensenanza_id: number | null;
  archivo_id: number;
  archivo_ruta: string;
  archivo_mime: string;
  publicado_en: string | null;
  url_descarga: string;
}

export interface Enlace {
  id: number;
  grupo: string;
  titulo_es: string;
  titulo_en: string | null;
  url: string;
  orden: number;
}

export const CONTACTO_TIPOS = ['consulta', 'sugerencia', 'queja', 'rincon_pensar'] as const;
export type ContactoTipo = (typeof CONTACTO_TIPOS)[number];

export interface ContactoInput {
  nombre: string;
  email: string;
  tipo: ContactoTipo;
  mensaje: string;
  consentimiento_privacidad: boolean;
}
