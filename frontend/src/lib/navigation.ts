import type { ApiMenuItem } from '../api/types';
import { pick, type Lang } from './i18n';

export interface NavLeaf {
  label: string;
  to: string;
}

export interface NavItem extends NavLeaf {
  children: NavLeaf[];
}

/** Contexto que `SiteLayout` pasa a las páginas vía `<Outlet context>`. */
export interface LayoutContext {
  navigation: NavItem[];
}

const leaf = (label: string, to: string): NavLeaf => ({ label, to });
const item = (label: string, to: string, children: NavLeaf[] = []): NavItem => ({ label, to, children });

/**
 * Menú de respaldo si la API no responde. Debe coincidir con
 * `App\Seed\DemoContent::menuPrincipal()` (memoria §6.2).
 */
export const FALLBACK_NAVIGATION: NavItem[] = [
  item('Inicio', '/'),
  item('Organización', '/organizacion', [
    leaf('Quiénes somos', '/organizacion/quienes-somos'),
    leaf('Historia', '/organizacion/historia'),
    leaf('Equipo directivo', '/organizacion/organos/equipo-directivo'),
    leaf('Consejo escolar', '/organizacion/organos/consejo-escolar'),
    leaf('Claustro', '/organizacion/organos/claustro'),
    leaf('Comisión de coordinación pedagógica', '/organizacion/organos/ccp'),
    leaf('Departamentos', '/organizacion/departamentos'),
    leaf('Documentos institucionales', '/organizacion/documentos'),
    leaf('Horarios', '/organizacion/horarios'),
    leaf('Calendario escolar', '/organizacion/calendario'),
  ]),
  item('Familias', '/familias', [
    leaf('Documentos y enlaces', '/familias/documentos'),
    leaf('Criterios de evaluación', '/familias/criterios-evaluacion'),
    leaf('Atención a familias', '/familias/atencion'),
    leaf('Tutoriales de plataformas', '/familias/tutoriales'),
    leaf('Guía de convivencia', '/familias/convivencia'),
    leaf('Buzón de sugerencias', '/contacto?tipo=sugerencia'),
  ]),
  item('Enseñanzas', '/ensenanzas', [
    leaf('ESO', '/ensenanzas/eso'),
    leaf('Bachillerato', '/ensenanzas/bachillerato'),
    leaf('Formación Profesional', '/ensenanzas/fp'),
    leaf('Materias optativas', '/ensenanzas/optativas'),
  ]),
  item('Secretaría', '/secretaria', [
    leaf('Cita previa', '/secretaria/cita-previa'),
    leaf('Trámites administrativos', '/secretaria/tramites'),
  ]),
  item('Programas', '/programas'),
  item('Noticias', '/noticias', [leaf('Actualidad', '/noticias'), leaf('Agenda de eventos', '/eventos')]),
  item('Contacto', '/contacto'),
];

/** Solo rutas internas: un ítem de menú no puede inyectar `javascript:` ni dominios externos. */
export function isSafeInternalPath(url: string | null | undefined): url is string {
  return typeof url === 'string' && url.startsWith('/') && !url.startsWith('//');
}

/** Convierte el árbol de `GET /menus/{clave}`, descartando ítems sin ruta interna válida. */
export function fromApiMenu(items: ApiMenuItem[], lang: Lang = 'es'): NavItem[] {
  return [...items]
    .sort((a, b) => a.orden - b.orden)
    .filter((i) => isSafeInternalPath(i.url))
    .map((i) =>
      item(
        pick(i, 'titulo', lang),
        i.url as string,
        [...(i.children ?? [])]
          .sort((a, b) => a.orden - b.orden)
          .filter((c) => isSafeInternalPath(c.url))
          .map((c) => leaf(pick(c, 'titulo', lang), c.url as string)),
      ),
    );
}

/** Un apartado está activo si la ruta actual es él o cuelga de él (sin confundir /noticias con /noticiasx). */
export function isActiveSection(pathname: string, nav: NavItem): boolean {
  const matches = (to: string) => {
    const path = to.split('?')[0] ?? to;
    if (path === '/') return pathname === '/';
    return pathname === path || pathname.startsWith(`${path}/`);
  };
  return matches(nav.to) || nav.children.some((c) => matches(c.to));
}
