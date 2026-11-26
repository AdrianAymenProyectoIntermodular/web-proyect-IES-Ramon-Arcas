export type Lang = 'es' | 'en';

export const DEFAULT_LANG: Lang = 'es';

/**
 * Lee `<campo>_<lang>` de una fila de la API con fallback a español,
 * igual que el contrato del backend (columnas *_es / *_en).
 */
export function pick<T extends object>(row: T, field: string, lang: Lang = DEFAULT_LANG): string {
  const record = row as Record<string, unknown>;
  const localized = record[`${field}_${lang}`];
  if (typeof localized === 'string' && localized.trim() !== '') return localized;
  const fallback = record[`${field}_es`];
  return typeof fallback === 'string' ? fallback : '';
}
