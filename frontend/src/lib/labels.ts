/** Etiquetas visibles de los enums del contrato (ES; el contenido es bilingüe). */

const NOTICIA_CATEGORIAS: Record<string, string> = {
  institucional: 'Institucional',
  academico: 'Académico',
  cultural: 'Cultural',
};

export const noticiaCategoriaLabel = (value: string | null): string =>
  value === null ? 'Actualidad' : (NOTICIA_CATEGORIAS[value] ?? value);

export const PROGRAMA_CATEGORIAS = [
  { value: 'educativo', label: 'Programas educativos' },
  { value: 'plan_centro', label: 'Planes de centro' },
  { value: 'actividad', label: 'Actividades' },
  { value: 'otro', label: 'Otros programas' },
] as const;

export const programaCategoriaLabel = (value: string): string =>
  PROGRAMA_CATEGORIAS.find((c) => c.value === value)?.label ?? value;
