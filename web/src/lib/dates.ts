export interface DateParts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
}

const DB_DATETIME = /^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2})(?::\d{2})?)?$/;

const MONTHS_SHORT = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const MONTHS_LONG = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];
const WEEKDAYS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

/**
 * Las fechas de eventos son hora de pared del centro (Europe/Madrid) sin zona.
 * Se descomponen a mano para no desplazarlas según la zona horaria del navegador.
 */
export function parseDbDateTime(value: string): DateParts | null {
  const match = DB_DATETIME.exec(value.trim());
  if (!match) return null;
  const [, y, mo, d, h = '0', mi = '0'] = match;
  const parts = { year: Number(y), month: Number(mo), day: Number(d), hour: Number(h), minute: Number(mi) };
  const check = new Date(Date.UTC(parts.year, parts.month - 1, parts.day));
  if (check.getUTCMonth() !== parts.month - 1 || check.getUTCDate() !== parts.day) return null;
  if (parts.hour > 23 || parts.minute > 59) return null;
  return parts;
}

const pad = (n: number) => String(n).padStart(2, '0');

export function formatTime(parts: DateParts): string {
  return `${pad(parts.hour)}:${pad(parts.minute)}`;
}

export function monthShort(parts: DateParts): string {
  return MONTHS_SHORT[parts.month - 1] ?? '';
}

export function weekday(parts: DateParts): string {
  return WEEKDAYS[new Date(Date.UTC(parts.year, parts.month - 1, parts.day)).getUTCDay()] ?? '';
}

/** "jueves, 19 nov · 17:00–19:30" */
export function formatEventRange(inicio: string, fin: string | null): string {
  const start = parseDbDateTime(inicio);
  if (!start) return '';
  const base = `${weekday(start)}, ${start.day} ${monthShort(start)} · ${formatTime(start)}`;
  const end = fin ? parseDbDateTime(fin) : null;
  if (!end) return base;
  const sameDay = end.year === start.year && end.month === start.month && end.day === start.day;
  return sameDay ? `${base}–${formatTime(end)}` : `${base} – ${end.day} ${monthShort(end)} · ${formatTime(end)}`;
}

/** Fecha local del navegador en formato `YYYY-MM-DD` (filtro `desde` de la API). */
export function toQueryDate(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** "19 de noviembre de 2026" a partir de un DATETIME de la API. */
export function formatLongDate(value: string): string {
  const parts = parseDbDateTime(value);
  if (!parts) return '';
  return `${parts.day} de ${MONTHS_LONG[parts.month - 1] ?? ''} de ${parts.year}`;
}

/** DATETIME UTC `YYYY-MM-DD HH:MM:SS`, formato que usa MariaDB en `publicado_en`. */
export function toDbDateTime(date: Date = new Date()): string {
  return (
    `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())} ` +
    `${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}:${pad(date.getUTCSeconds())}`
  );
}
