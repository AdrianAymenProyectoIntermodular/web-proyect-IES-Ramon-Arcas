import { describe, expect, it } from 'vitest';
import seedMenu from '../../../shared/fixtures/menu-principal.json';
import type { ApiMenuItem } from '../api/types';
import { FALLBACK_NAVIGATION, fromApiMenu, isActiveSection, isSafeInternalPath, type NavItem } from './navigation';

let nextId = 1;
const apiItem = (over: Partial<ApiMenuItem>): ApiMenuItem => ({
  id: nextId++,
  padre_id: null,
  titulo_es: 'Item',
  titulo_en: null,
  url: '/item',
  pagina_id: null,
  orden: 0,
  children: [],
  ...over,
});

describe('FALLBACK_NAVIGATION', () => {
  it('coincide con el menú del seed (fixture compartido con PHPUnit)', () => {
    const expected = seedMenu.map((item) => ({
      label: item.titulo_es,
      to: item.url,
      children: (('children' in item && item.children) || []).map((c) => ({ label: c.titulo_es, to: c.url })),
    }));
    expect(FALLBACK_NAVIGATION).toEqual(expected);
  });

  it('sigue el mapa de secciones de la memoria §6.2', () => {
    expect(FALLBACK_NAVIGATION.map((i) => i.label)).toEqual([
      'Inicio',
      'Organización',
      'Familias',
      'Enseñanzas',
      'Secretaría',
      'Programas',
      'Noticias',
      'Contacto',
    ]);
  });

  it('solo contiene rutas internas', () => {
    for (const item of FALLBACK_NAVIGATION) {
      expect(isSafeInternalPath(item.to)).toBe(true);
      item.children.forEach((c) => expect(isSafeInternalPath(c.to)).toBe(true));
    }
  });
});

describe('isSafeInternalPath', () => {
  it.each(['/', '/contacto', '/contacto?tipo=queja'])('acepta %s', (url) => {
    expect(isSafeInternalPath(url)).toBe(true);
  });

  it.each([null, undefined, '', 'contacto', '//evil.example', 'https://evil.example', 'javascript:alert(1)'])(
    'rechaza %s',
    (url) => {
      expect(isSafeInternalPath(url)).toBe(false);
    },
  );
});

describe('fromApiMenu', () => {
  it('convierte el árbol respetando el orden', () => {
    const items = [
      apiItem({ titulo_es: 'Contacto', url: '/contacto', orden: 2 }),
      apiItem({
        titulo_es: 'Organización',
        url: '/organizacion',
        orden: 1,
        children: [
          apiItem({ titulo_es: 'Historia', url: '/organizacion/historia', orden: 2 }),
          apiItem({ titulo_es: 'Departamentos', url: '/organizacion/departamentos', orden: 1 }),
        ],
      }),
    ];
    expect(fromApiMenu(items)).toEqual<NavItem[]>([
      {
        label: 'Organización',
        to: '/organizacion',
        children: [
          { label: 'Departamentos', to: '/organizacion/departamentos' },
          { label: 'Historia', to: '/organizacion/historia' },
        ],
      },
      { label: 'Contacto', to: '/contacto', children: [] },
    ]);
  });

  it('usa el título en inglés con fallback a español', () => {
    const items = [apiItem({ titulo_es: 'Inicio', titulo_en: 'Home', url: '/' }), apiItem({ titulo_es: 'Familias', url: '/familias' })];
    expect(fromApiMenu(items, 'en').map((i) => i.label)).toEqual(['Home', 'Familias']);
  });

  it('descarta ítems sin URL interna (p. ej. enlaces a página por id o externos)', () => {
    const items = [
      apiItem({ titulo_es: 'Sin url', url: null, pagina_id: 3 }),
      apiItem({ titulo_es: 'Externo', url: 'https://otro.example' }),
      apiItem({ titulo_es: 'XSS', url: 'javascript:alert(1)' }),
      apiItem({
        titulo_es: 'Válido',
        url: '/ok',
        children: [apiItem({ titulo_es: 'Hijo externo', url: '//evil.example' }), apiItem({ titulo_es: 'Hijo', url: '/ok/hijo' })],
      }),
    ];
    expect(fromApiMenu(items)).toEqual([{ label: 'Válido', to: '/ok', children: [{ label: 'Hijo', to: '/ok/hijo' }] }]);
  });

  it('no muta el array recibido', () => {
    const items = [apiItem({ orden: 2, url: '/b' }), apiItem({ orden: 1, url: '/a' })];
    const snapshot = items.map((i) => i.url);
    fromApiMenu(items);
    expect(items.map((i) => i.url)).toEqual(snapshot);
  });

  it('tolera children ausente', () => {
    const item = { ...apiItem({ url: '/x' }), children: undefined } as unknown as ApiMenuItem;
    expect(fromApiMenu([item])[0]?.children).toEqual([]);
  });
});

describe('isActiveSection', () => {
  const organizacion: NavItem = {
    label: 'Organización',
    to: '/organizacion',
    children: [{ label: 'Departamentos', to: '/organizacion/departamentos' }],
  };
  const inicio: NavItem = { label: 'Inicio', to: '/', children: [] };
  const familias: NavItem = { label: 'Familias', to: '/familias', children: [{ label: 'Buzón', to: '/contacto?tipo=sugerencia' }] };

  it('marca la sección y sus subrutas', () => {
    expect(isActiveSection('/organizacion', organizacion)).toBe(true);
    expect(isActiveSection('/organizacion/departamentos/matematicas', organizacion)).toBe(true);
  });

  it('no confunde prefijos parciales', () => {
    expect(isActiveSection('/organizacionx', organizacion)).toBe(false);
  });

  it('Inicio solo está activo en la raíz', () => {
    expect(isActiveSection('/', inicio)).toBe(true);
    expect(isActiveSection('/contacto', inicio)).toBe(false);
  });

  it('ignora la query de los hijos al comparar', () => {
    expect(isActiveSection('/contacto', familias)).toBe(true);
  });
});
