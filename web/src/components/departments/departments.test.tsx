import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { Departamento } from '../../api/types';
import { mockApi, renderRoute } from '../../test/utils';
import { DepartmentGrid } from './DepartmentGrid';
import { DepartmentIcon } from './DepartmentIcon';
import { DEPARTMENT_ICONS, hasDepartmentIcon, renderFallbackIcon } from './icons';

/** Debe coincidir con `App\Seed\DemoContent::departamentos()`. */
const SEED_SLUGS = [
  'matematicas',
  'lengua',
  'ingles',
  'frances',
  'geografia-historia',
  'biologia-geologia',
  'fisica-quimica',
  'tecnologia',
  'educacion-fisica',
  'musica',
  'dibujo',
  'filosofia',
  'economia',
  'informatica',
  'electricidad',
  'orientacion',
];

const iconMarkup = (slug: string) => render(<DepartmentIcon slug={slug} />).container.innerHTML;

const departamento = (slug: string, nombre: string, extra: Partial<Departamento> = {}): Departamento => ({
  id: SEED_SLUGS.indexOf(slug) + 1,
  slug,
  nombre_es: nombre,
  nombre_en: null,
  presentacion_es: null,
  presentacion_en: null,
  contacto_publico: null,
  ...extra,
});

describe('Iconos de departamento', () => {
  it.each(SEED_SLUGS)('el departamento "%s" del seed tiene icono propio', (slug) => {
    expect(hasDepartmentIcon(slug)).toBe(true);
  });

  it('no hay iconos huérfanos (sin departamento en el seed)', () => {
    expect(Object.keys(DEPARTMENT_ICONS).sort()).toEqual([...SEED_SLUGS].sort());
  });

  it('cada icono es distinto del resto y del genérico', () => {
    const fallback = render(renderFallbackIcon()).container.innerHTML;
    const markups = SEED_SLUGS.map(iconMarkup);
    expect(new Set(markups).size).toBe(SEED_SLUGS.length);
    expect(markups).not.toContain(fallback);
  });

  it('los iconos son decorativos (aria-hidden, no enfocables) y escalables', () => {
    const { container } = render(<DepartmentIcon slug="musica" />);
    const svg = container.querySelector('svg')!;
    expect(svg).toHaveAttribute('aria-hidden', 'true');
    expect(svg).toHaveAttribute('focusable', 'false');
    expect(svg).toHaveAttribute('viewBox', '0 0 48 48');
    expect(svg).not.toHaveAttribute('width');
    expect(svg).toHaveAttribute('stroke', 'currentColor');
  });

  it.each(['departamento-nuevo', '', 'constructor', 'toString', '__proto__'])('usa el icono genérico para "%s"', (slug) => {
    expect(hasDepartmentIcon(slug)).toBe(false);
    expect(iconMarkup(slug)).toBe(render(renderFallbackIcon()).container.innerHTML);
  });
});

describe('DepartmentGrid', () => {
  const renderGrid = (deps: Departamento[]) => {
    mockApi();
    return renderRoute('/', [{ path: '/', element: <DepartmentGrid departamentos={deps} /> }]);
  };

  it('muestra un enlace por departamento hacia su página de detalle, en el orden recibido', () => {
    renderGrid([departamento('musica', 'Música'), departamento('matematicas', 'Matemáticas'), departamento('fisica-quimica', 'Física y Química')]);
    const links = screen.getAllByRole('link');
    expect(links.map((a) => a.textContent?.replace('→', '').trim())).toEqual(['Música', 'Matemáticas', 'Física y Química']);
    expect(links.map((a) => a.getAttribute('href'))).toEqual([
      '/organizacion/departamentos/musica',
      '/organizacion/departamentos/matematicas',
      '/organizacion/departamentos/fisica-quimica',
    ]);
  });

  it('la tarjeta completa es el enlace y su nombre accesible es el del departamento', () => {
    renderGrid([departamento('dibujo', 'Dibujo')]);
    const link = screen.getByRole('link', { name: /Dibujo/ });
    expect(link.querySelector('svg')).not.toBeNull();
    expect(link.closest('li')).not.toBeNull();
    expect(link).toHaveAccessibleName('Dibujo');
  });

  it('usa el nombre en español aunque haya inglés', () => {
    renderGrid([departamento('ingles', 'Inglés', { nombre_en: 'English' })]);
    expect(screen.getByRole('link', { name: 'Inglés' })).toBeInTheDocument();
  });

  it('codifica slugs con caracteres especiales en la URL', () => {
    renderGrid([departamento('a b', 'Raro')]);
    expect(screen.getByRole('link', { name: 'Raro' })).toHaveAttribute('href', '/organizacion/departamentos/a%20b');
  });

  it('se renderiza como lista para lectores de pantalla', () => {
    renderGrid(SEED_SLUGS.map((s) => departamento(s, s)));
    const list = screen.getByRole('list');
    expect(within(list).getAllByRole('listitem')).toHaveLength(SEED_SLUGS.length);
  });
});
