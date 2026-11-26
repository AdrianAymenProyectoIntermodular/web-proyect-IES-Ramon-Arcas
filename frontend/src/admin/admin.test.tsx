import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { mockApi, renderRoute, CONFIG_FIXTURE, type MockReply } from '../test/utils';

const CONFIG: Record<string, MockReply> = { '/api/v1/configuracion': { body: { data: CONFIG_FIXTURE } } };

const h1 = (name: string | RegExp) => screen.findByRole('heading', { level: 1, name });

describe('Panel de administración', () => {
  it('redirige al login si no hay sesión', async () => {
    mockApi({ ...CONFIG, '/api/v1/admin/me': { status: 401, body: { error: { code: 'unauthenticated', message: 'x' } } } });
    renderRoute('/admin/noticias');
    expect(await h1('Acceso al panel')).toBeInTheDocument();
  });

  it('permite iniciar sesión y entrar al panel', async () => {
    const user = userEvent.setup();
    mockApi({
      ...CONFIG,
      '/api/v1/admin/me': { status: 401, body: { error: { code: 'unauthenticated', message: 'x' } } },
      '/api/v1/admin/csrf': { body: { csrf_token: 'csrf-1' } },
      '/api/v1/admin/login': { body: { user: { id: 1, email: 'admin@x', nombre: 'Admin', rol: 'admin' }, csrf_token: 'csrf-2' } },
      '/api/v1/admin/noticias': { body: { data: [], meta: { page: 1, limit: 50, total: 0 } } },
    });
    renderRoute('/admin/login');
    await user.type(await screen.findByLabelText('Correo electrónico'), 'admin@x');
    await user.type(screen.getByLabelText('Contraseña'), 'secreto');
    await user.click(screen.getByRole('button', { name: 'Entrar' }));
    expect(await h1('Noticias')).toBeInTheDocument();
    expect(await screen.findByText('Todavía no hay noticias. Crea la primera con el formulario.')).toBeInTheDocument();
  });

  it('muestra error con credenciales incorrectas', async () => {
    const user = userEvent.setup();
    mockApi({
      ...CONFIG,
      '/api/v1/admin/me': { status: 401, body: { error: { code: 'unauthenticated', message: 'x' } } },
      '/api/v1/admin/csrf': { body: { csrf_token: 'csrf-1' } },
      '/api/v1/admin/login': { status: 401, body: { error: { code: 'invalid_credentials', message: 'Credenciales incorrectas' } } },
    });
    renderRoute('/admin/login');
    await user.type(await screen.findByLabelText('Correo electrónico'), 'admin@x');
    await user.type(screen.getByLabelText('Contraseña'), 'mala');
    await user.click(screen.getByRole('button', { name: 'Entrar' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Credenciales incorrectas.');
  });

  it('muestra error de seguridad al crear una noticia sin CSRF válido', async () => {
    const user = userEvent.setup();
    mockApi({
      ...CONFIG,
      '/api/v1/admin/me': { body: { user: { id: 1, email: 'admin@x', nombre: 'Admin', rol: 'admin' }, csrf_token: 'csrf-2' } },
      '/api/v1/admin/noticias': { body: { data: [], meta: { page: 1, limit: 50, total: 0 } } },
      'POST /api/v1/admin/noticias': { status: 403, body: { error: { code: 'csrf_invalid', message: 'Token CSRF invalido o ausente' } } },
    });
    renderRoute('/admin/noticias');
    await screen.findByRole('heading', { level: 1, name: 'Noticias' });
    await user.type(screen.getByLabelText('Título'), 'Nueva noticia');
    await user.type(screen.getByLabelText('Cuerpo (Markdown)'), 'Cuerpo de prueba');
    await user.click(screen.getByRole('button', { name: 'Crear noticia' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/token de seguridad/i);
  });
});
