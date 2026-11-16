import { DEPARTMENT_ICONS, hasDepartmentIcon, renderFallbackIcon } from './icons';

/** Icono grande por slug, con uno genérico para departamentos sin icono propio. */
export function DepartmentIcon({ slug }: { slug: string }) {
  const render = (hasDepartmentIcon(slug) && DEPARTMENT_ICONS[slug]) || renderFallbackIcon;
  return render();
}
