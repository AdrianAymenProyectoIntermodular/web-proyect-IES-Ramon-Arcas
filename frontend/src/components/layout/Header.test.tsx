import { act, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { FALLBACK_NAVIGATION } from '../../lib/navigation';
import { CONFIG_FIXTURE, mockApi, renderRoute } from '../../test/utils';

const withConfig = (config: Record<string, string> = CONFIG_FIXTURE) => mockApi({ '/api/v1/configuracion': { body: { data: config } } });

const desktopNav = () => screen.getByRole('navigation', { name: 'Menú principal' });

describe('Header — escritorio', () => {
  it('muestra todos los apartados de primer nivel', () => {
    withConfig();
    renderRoute('/');
    const nav = desktopNav();
    for (const item of FALLBACK_NAVIGATION) {
      const control = item.children.length > 0 ? within(nav).getByRole('button', { name: item.label }) : within(nav).getByRole('link', { name: item.label });
      expect(control).toBeInTheDocument();
    }
  });

  it('abre y cierra un desplegable con clic, reflejándolo en aria-expanded', async () => {
    withConfig();
    const user = userEvent.setup();
    renderRoute('/');
    const trigger = within(desktopNav()).getByRole('button', { name: 'Organización' });
    const panelId = trigger.getAttribute('aria-controls')!;

    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(document.getElementById(panelId)).not.toBeVisible();

    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    const panel = document.getElementById(panelId)!;
    expect(panel).toBeVisible();
    expect(within(panel).getByRole('link', { name: 'Departamentos' })).toHaveAttribute('href', '/organizacion/departamentos');
    expect(within(panel).getByRole('link', { name: /Todo organización/ })).toHaveAttribute('href', '/organizacion');

    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('solo mantiene un desplegable abierto a la vez', async () => {
    withConfig();
    const user = userEvent.setup();
    renderRoute('/');
    const organizacion = within(desktopNav()).getByRole('button', { name: 'Organización' });
    const familias = within(desktopNav()).getByRole('button', { name: 'Familias' });
    await user.click(organizacion);
    await user.click(familias);
    expect(organizacion).toHaveAttribute('aria-expanded', 'false');
    expect(familias).toHaveAttribute('aria-expanded', 'true');
  });

  it('no duplica "Todo …" si un hijo ya apunta a la sección', async () => {
    withConfig();
    const user = userEvent.setup();
    renderRoute('/');
    const trigger = within(desktopNav()).getByRole('button', { name: 'Noticias' });
    await user.click(trigger);
    const panel = document.getElementById(trigger.getAttribute('aria-controls')!)!;
    expect(within(panel).queryByRole('link', { name: /Todo noticias/ })).not.toBeInTheDocument();
  });

  it('navega con teclado: ArrowDown abre y enfoca, flechas recorren, Escape cierra y devuelve el foco', async () => {
    withConfig();
    const user = userEvent.setup();
    renderRoute('/');
    const trigger = within(desktopNav()).getByRole('button', { name: 'Secretaría' });
    const panel = () => within(document.getElementById(trigger.getAttribute('aria-controls')!)!);
    trigger.focus();

    await user.keyboard('{ArrowDown}');
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await waitFor(() => expect(panel().getByRole('link', { name: 'Cita previa' })).toHaveFocus());

    await user.keyboard('{ArrowDown}');
    expect(panel().getByRole('link', { name: 'Trámites administrativos' })).toHaveFocus();

    await user.keyboard('{ArrowDown}');
    expect(panel().getByRole('link', { name: /Todo secretaría/ })).toHaveFocus();

    await user.keyboard('{ArrowDown}');
    expect(panel().getByRole('link', { name: 'Cita previa' })).toHaveFocus();

    await user.keyboard('{ArrowUp}');
    expect(panel().getByRole('link', { name: /Todo secretaría/ })).toHaveFocus();

    await user.keyboard('{Escape}');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(trigger).toHaveFocus();
  });

  it('ArrowUp abre el desplegable y enfoca el último enlace', async () => {
    withConfig();
    const user = userEvent.setup();
    renderRoute('/');
    const trigger = within(desktopNav()).getByRole('button', { name: 'Enseñanzas' });
    trigger.focus();
    await user.keyboard('{ArrowUp}');
    await waitFor(() => expect(screen.getByRole('link', { name: /Todo enseñanzas/ })).toHaveFocus());
  });

  it('Escape sobre el botón cierra el desplegable', async () => {
    withConfig();
    const user = userEvent.setup();
    renderRoute('/');
    const trigger = within(desktopNav()).getByRole('button', { name: 'Familias' });
    await user.click(trigger);
    await user.keyboard('{Escape}');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('cierra el desplegable al hacer clic fuera', async () => {
    withConfig();
    const user = userEvent.setup();
    renderRoute('/');
    const trigger = within(desktopNav()).getByRole('button', { name: 'Organización' });
    await user.click(trigger);
    await user.click(document.body);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('cierra el desplegable al navegar a un subapartado', async () => {
    withConfig();
    const user = userEvent.setup();
    const { router } = renderRoute('/');
    const trigger = within(desktopNav()).getByRole('button', { name: 'Organización' });
    await user.click(trigger);
    await user.click(screen.getAllByRole('link', { name: 'Historia' })[0]!);
    await waitFor(() => expect(router.state.location.pathname).toBe('/organizacion/historia'));
    await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'false'));
  });

  it('marca como activo el apartado de la ruta actual', () => {
    withConfig();
    renderRoute('/organizacion/departamentos');
    const trigger = within(desktopNav()).getByRole('button', { name: 'Organización' });
    expect(trigger.className).toMatch(/active/);
    expect(within(desktopNav()).getByRole('button', { name: 'Familias' }).className).not.toMatch(/active/);
  });

  it('el logo enlaza al inicio con nombre accesible', () => {
    withConfig();
    renderRoute('/contacto');
    expect(screen.getByRole('link', { name: 'IES Ramón Arcas Meca, ir al inicio' })).toHaveAttribute('href', '/');
  });

  it('añade sombra al hacer scroll', async () => {
    withConfig();
    renderRoute('/');
    const header = screen.getAllByRole('banner')[0]!;
    expect(header.className).not.toMatch(/scrolled/);
    await act(async () => {
      Object.defineProperty(window, 'scrollY', { value: 120, configurable: true });
      window.dispatchEvent(new Event('scroll'));
    });
    expect(header.className).toMatch(/scrolled/);
    Object.defineProperty(window, 'scrollY', { value: 0, configurable: true });
  });
});

describe('Header — móvil (hamburguesa)', () => {
  const burger = () => screen.getByRole('button', { name: /Abrir menú|Cerrar menú/ });
  const mobileNav = () => document.getElementById('mobile-nav')!;

  it('abre y cierra el menú, bloqueando el scroll del fondo', async () => {
    withConfig();
    const user = userEvent.setup();
    renderRoute('/');
    expect(burger()).toHaveAttribute('aria-expanded', 'false');
    expect(mobileNav()).not.toBeVisible();

    await user.click(burger());
    expect(burger()).toHaveAttribute('aria-expanded', 'true');
    expect(burger()).toHaveAccessibleName('Cerrar menú');
    expect(mobileNav()).toBeVisible();
    expect(document.body.style.overflow).toBe('hidden');

    await user.click(burger());
    expect(mobileNav()).not.toBeVisible();
    expect(document.body.style.overflow).toBe('');
  });

  it('Escape cierra el menú móvil', async () => {
    withConfig();
    const user = userEvent.setup();
    renderRoute('/');
    await user.click(burger());
    await user.keyboard('{Escape}');
    expect(burger()).toHaveAttribute('aria-expanded', 'false');
  });

  it('despliega subapartados en acordeón', async () => {
    withConfig();
    const user = userEvent.setup();
    renderRoute('/');
    await user.click(burger());
    const section = within(mobileNav()).getByRole('button', { name: 'Enseñanzas' });
    const listId = section.getAttribute('aria-controls')!;
    expect(section).toHaveAttribute('aria-expanded', 'false');
    await user.click(section);
    expect(section).toHaveAttribute('aria-expanded', 'true');
    expect(within(document.getElementById(listId)!).getByRole('link', { name: 'ESO' })).toBeVisible();
    await user.click(section);
    expect(section).toHaveAttribute('aria-expanded', 'false');
  });

  it('abre por defecto la sección de la ruta actual', async () => {
    withConfig();
    const user = userEvent.setup();
    renderRoute('/organizacion/departamentos');
    await user.click(burger());
    expect(within(mobileNav()).getByRole('button', { name: 'Organización' })).toHaveAttribute('aria-expanded', 'true');
  });

  it('se cierra al navegar', async () => {
    withConfig();
    const user = userEvent.setup();
    const { router } = renderRoute('/');
    await user.click(burger());
    await user.click(within(mobileNav()).getByRole('link', { name: 'Contacto' }));
    await waitFor(() => expect(router.state.location.pathname).toBe('/contacto'));
    await waitFor(() => expect(burger()).toHaveAttribute('aria-expanded', 'false'));
    expect(document.body.style.overflow).toBe('');
  });
});

describe('Acceso intranet (único puente con la intranet)', () => {
  it('enlaza a configuracion.intranet_url', async () => {
    withConfig();
    renderRoute('/');
    await waitFor(() => expect(screen.getAllByRole('link', { name: 'Acceso intranet', hidden: true }).length).toBeGreaterThan(0));
    for (const link of screen.getAllByRole('link', { name: 'Acceso intranet', hidden: true })) {
      expect(link).toHaveAttribute('href', CONFIG_FIXTURE.intranet_url);
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    }
  });

  it('no se muestra sin URL configurada', async () => {
    const api = withConfig({ nombre_centro: 'IES' });
    renderRoute('/');
    await waitFor(() => expect(api.calls()).toContain('/api/v1/configuracion'));
    await act(async () => {});
    expect(screen.queryByRole('link', { name: 'Acceso intranet', hidden: true })).not.toBeInTheDocument();
  });

  it('ignora URLs no http(s)', async () => {
    const api = withConfig({ intranet_url: 'javascript:alert(1)' });
    renderRoute('/');
    await waitFor(() => expect(api.calls()).toContain('/api/v1/configuracion'));
    await act(async () => {});
    expect(screen.queryByRole('link', { name: 'Acceso intranet', hidden: true })).not.toBeInTheDocument();
  });
});
