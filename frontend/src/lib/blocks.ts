import type { PaginaBloque } from '../api/types';
import { pick, type Lang } from './i18n';

/** Texto Markdown de un bloque `texto` con fallback a español; null si no es mostrable. */
export function blockMarkdown(bloque: PaginaBloque, lang: Lang = 'es'): string | null {
  if (bloque.tipo !== 'texto' || !bloque.contenido) return null;
  const text = pick(bloque.contenido, 'markdown', lang);
  return text.trim() === '' ? null : text;
}
