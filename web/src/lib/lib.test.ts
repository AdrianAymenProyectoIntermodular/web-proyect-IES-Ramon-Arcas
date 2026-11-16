import { describe, expect, it } from 'vitest';
import type { PaginaBloque } from '../api/types';
import { blockMarkdown } from './blocks';
import { formatEventRange, formatTime, monthShort, parseDbDateTime, toQueryDate, weekday } from './dates';
import { pick } from './i18n';
import { initials } from './text';
import { departmentPath } from './paths';

describe('pick (i18n con fallback a ES)', () => {
  const row = { titulo_es: 'Historia', titulo_en: 'History', resumen_es: 'Texto', resumen_en: '', vacio_es: null };

  it('devuelve el idioma pedido', () => {
    expect(pick(row, 'titulo', 'en')).toBe('History');
  });

  it('usa español por defecto', () => {
    expect(pick(row, 'titulo')).toBe('Historia');
  });

  it('cae a español si la traducción está vacía', () => {
    expect(pick(row, 'resumen', 'en')).toBe('Texto');
  });

  it('cae a español si la traducción solo tiene espacios', () => {
    expect(pick({ a_es: 'Sí', a_en: '   ' }, 'a', 'en')).toBe('Sí');
  });

  it('devuelve cadena vacía si no hay valor en ningún idioma', () => {
    expect(pick(row, 'vacio', 'en')).toBe('');
    expect(pick(row, 'inexistente')).toBe('');
  });
});

describe('fechas de eventos', () => {
  it('descompone DATETIME de MariaDB sin aplicar zona horaria', () => {
    expect(parseDbDateTime('2026-11-19 17:00:00')).toEqual({ year: 2026, month: 11, day: 19, hour: 17, minute: 0 });
  });

  it('acepta formato ISO con T y sin segundos', () => {
    expect(parseDbDateTime('2026-11-19T08:05')).toEqual({ year: 2026, month: 11, day: 19, hour: 8, minute: 5 });
  });

  it('acepta solo fecha (medianoche)', () => {
    expect(parseDbDateTime('2026-01-02')).toMatchObject({ hour: 0, minute: 0 });
  });

  it.each(['', 'mañana', '2026-13-01', '2026-02-30', '2027-02-29', '2026-11-19 24:00', '2026-11-19 10:60', '19/11/2026'])(
    'rechaza "%s"',
    (value) => {
      expect(parseDbDateTime(value)).toBeNull();
    },
  );

  it('acepta el 29 de febrero en año bisiesto', () => {
    expect(parseDbDateTime('2028-02-29 10:00:00')).not.toBeNull();
  });

  it('formatea hora, mes y día de la semana en español', () => {
    const parts = parseDbDateTime('2026-11-19 09:05:00')!;
    expect(formatTime(parts)).toBe('09:05');
    expect(monthShort(parts)).toBe('nov');
    expect(weekday(parts)).toBe('jueves');
  });

  it('formatea un evento de un día con hora de fin', () => {
    expect(formatEventRange('2026-11-19 17:00:00', '2026-11-19 19:30:00')).toBe('jueves, 19 nov · 17:00–19:30');
  });

  it('formatea un evento sin fin', () => {
    expect(formatEventRange('2026-12-01 10:00:00', null)).toBe('martes, 1 dic · 10:00');
  });

  it('formatea un evento de varios días', () => {
    expect(formatEventRange('2026-12-30 09:00:00', '2027-01-02 14:00:00')).toBe('miércoles, 30 dic · 09:00 – 2 ene · 14:00');
  });

  it('ignora un fin con formato inválido', () => {
    expect(formatEventRange('2026-12-01 10:00:00', 'luego')).toBe('martes, 1 dic · 10:00');
  });

  it('devuelve vacío si el inicio es inválido', () => {
    expect(formatEventRange('nunca', null)).toBe('');
  });

  it('genera la fecha local YYYY-MM-DD para el filtro "desde"', () => {
    expect(toQueryDate(new Date(2026, 0, 5, 23, 59))).toBe('2026-01-05');
    expect(toQueryDate(new Date(2026, 10, 16))).toBe('2026-11-16');
  });
});

describe('initials', () => {
  it.each([
    ['Lucía Montoya Ferrer', 'LM'],
    ['óscar valera', 'ÓV'],
    ['  Ana  ', 'A'],
    ['', ''],
  ])('"%s" -> "%s"', (nombre, esperado) => {
    expect(initials(nombre)).toBe(esperado);
  });
});

describe('blockMarkdown', () => {
  const bloque = (over: Partial<PaginaBloque>): PaginaBloque => ({ id: 1, tipo: 'texto', orden: 0, contenido: null, ...over });

  it('extrae el Markdown de un bloque de texto', () => {
    expect(blockMarkdown(bloque({ contenido: { markdown_es: '## Hola' } }))).toBe('## Hola');
  });

  it('respeta el idioma con fallback a español', () => {
    const b = bloque({ contenido: { markdown_es: 'Hola', markdown_en: 'Hello' } });
    expect(blockMarkdown(b, 'en')).toBe('Hello');
    expect(blockMarkdown(bloque({ contenido: { markdown_es: 'Hola' } }), 'en')).toBe('Hola');
  });

  it('ignora bloques no textuales, sin contenido o vacíos', () => {
    expect(blockMarkdown(bloque({ tipo: 'imagen', contenido: { markdown_es: 'x' } }))).toBeNull();
    expect(blockMarkdown(bloque({ contenido: null }))).toBeNull();
    expect(blockMarkdown(bloque({ contenido: { markdown_es: '   ' } }))).toBeNull();
    expect(blockMarkdown(bloque({ contenido: { markdown_es: 42 } }))).toBeNull();
  });
});

describe('departmentPath', () => {
  it('construye la ruta y codifica el slug', () => {
    expect(departmentPath('matematicas')).toBe('/organizacion/departamentos/matematicas');
    expect(departmentPath('a b/c')).toBe('/organizacion/departamentos/a%20b%2Fc');
  });
});
