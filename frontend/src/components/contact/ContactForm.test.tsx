import { render, screen, waitFor } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { CONTACT_LIMITS } from '../../lib/contactValidation';
import { mockApi } from '../../test/utils';
import { ContactForm } from './ContactForm';

const field = {
  nombre: () => screen.getByLabelText('Nombre'),
  email: () => screen.getByLabelText('Correo electrónico'),
  tipo: () => screen.getByLabelText('Tipo de mensaje'),
  mensaje: () => screen.getByLabelText('Mensaje'),
  consentimiento: () => screen.getByLabelText(/acepto que el centro trate mis datos/),
};
const submit = () => screen.getByRole('button', { name: /Enviar mensaje|Enviando/ });

async function fillValid(user: UserEvent) {
  await user.type(field.nombre(), '  Ana Pérez  ');
  await user.type(field.email(), ' ana@example.com ');
  await user.selectOptions(field.tipo(), 'sugerencia');
  await user.type(field.mensaje(), '  Propongo más actividades de lectura.  ');
  await user.click(field.consentimiento());
}

const ok = { status: 201, body: { data: { id: 7, recibido: true } } };

describe('ContactForm — validación en cliente', () => {
  it('no envía nada si el formulario está vacío y marca todos los campos obligatorios', async () => {
    const api = mockApi();
    const user = userEvent.setup();
    render(<ContactForm />);
    await user.click(submit());

    for (const input of [field.nombre(), field.email(), field.mensaje(), field.consentimiento()]) {
      expect(input).toHaveAttribute('aria-invalid', 'true');
      const describedBy = input.getAttribute('aria-describedby')!;
      expect(document.getElementById(describedBy)).toHaveTextContent(/.+/);
    }
    expect(field.tipo()).not.toHaveAttribute('aria-invalid');
    expect(api.fetch).not.toHaveBeenCalled();
  });

  it('lleva el foco al primer campo inválido', async () => {
    mockApi();
    const user = userEvent.setup();
    render(<ContactForm />);
    await user.type(field.nombre(), 'Ana');
    await user.click(submit());
    expect(field.email()).toHaveFocus();
  });

  it('rechaza un correo con formato inválido', async () => {
    const api = mockApi();
    const user = userEvent.setup();
    render(<ContactForm />);
    await fillValid(user);
    await user.clear(field.email());
    await user.type(field.email(), 'no-es-un-correo');
    await user.click(submit());
    expect(field.email()).toHaveAttribute('aria-invalid', 'true');
    expect(api.fetch).not.toHaveBeenCalled();
  });

  it('limpia el error de un campo en cuanto se corrige', async () => {
    mockApi();
    const user = userEvent.setup();
    render(<ContactForm />);
    await user.click(submit());
    expect(field.nombre()).toHaveAttribute('aria-invalid', 'true');
    await user.type(field.nombre(), 'A');
    expect(field.nombre()).not.toHaveAttribute('aria-invalid');
    expect(field.nombre()).not.toHaveAttribute('aria-describedby');
    expect(field.email()).toHaveAttribute('aria-invalid', 'true');
  });

  it('limita la longitud con maxLength igual que el servidor', () => {
    render(<ContactForm />);
    expect(field.nombre()).toHaveAttribute('maxLength', String(CONTACT_LIMITS.nombre));
    expect(field.mensaje()).toHaveAttribute('maxLength', String(CONTACT_LIMITS.mensaje));
  });

  it('desactiva la validación nativa para mostrar mensajes propios y accesibles', () => {
    const { container } = render(<ContactForm />);
    expect(container.querySelector('form')).toHaveAttribute('novalidate');
  });
});

describe('ContactForm — tipo de mensaje', () => {
  it('ofrece exactamente los tipos que acepta la API', () => {
    render(<ContactForm />);
    const values = Array.from((field.tipo() as HTMLSelectElement).options).map((o) => o.value);
    expect(values).toEqual(['consulta', 'sugerencia', 'queja', 'rincon_pensar']);
    expect(field.tipo()).toHaveValue('consulta');
  });

  it.each(['sugerencia', 'queja', 'rincon_pensar'])('preselecciona "%s" desde initialTipo', (tipo) => {
    render(<ContactForm initialTipo={tipo} />);
    expect(field.tipo()).toHaveValue(tipo);
  });

  it.each([null, '', 'spam', 'CONSULTA'])('ignora un initialTipo no válido (%s)', (tipo) => {
    render(<ContactForm initialTipo={tipo} />);
    expect(field.tipo()).toHaveValue('consulta');
  });
});

describe('ContactForm — envío', () => {
  it('envía el JSON esperado (recortado) por POST y muestra la confirmación', async () => {
    const api = mockApi({ 'POST /api/v1/contacto': ok });
    const user = userEvent.setup();
    render(<ContactForm />);
    await fillValid(user);
    await user.click(submit());

    expect(await screen.findByRole('status')).toHaveTextContent('¡Mensaje enviado!');
    const [url, init] = api.fetch.mock.calls[0]!;
    expect(String(url)).toBe('/api/v1/contacto');
    expect(init?.method).toBe('POST');
    expect(JSON.parse(String(init?.body))).toEqual({
      nombre: 'Ana Pérez',
      email: 'ana@example.com',
      tipo: 'sugerencia',
      mensaje: 'Propongo más actividades de lectura.',
      consentimiento_privacidad: true,
    });
  });

  it('desactiva el botón mientras envía para evitar envíos duplicados', async () => {
    let resolve!: (r: Response) => void;
    const fetchMock = vi.fn(() => new Promise<Response>((r) => (resolve = r)));
    vi.stubGlobal('fetch', fetchMock);
    const user = userEvent.setup();
    render(<ContactForm />);
    await fillValid(user);
    await user.click(submit());

    expect(submit()).toBeDisabled();
    expect(submit()).toHaveTextContent('Enviando…');
    await user.click(submit());
    expect(fetchMock).toHaveBeenCalledTimes(1);

    resolve(new Response(JSON.stringify(ok.body), { status: 201, headers: { 'Content-Type': 'application/json' } }));
    expect(await screen.findByText('¡Mensaje enviado!')).toBeInTheDocument();
  });

  it('tras enviar, "Enviar otro mensaje" devuelve un formulario vacío', async () => {
    mockApi({ 'POST /api/v1/contacto': ok });
    const user = userEvent.setup();
    render(<ContactForm initialTipo="queja" />);
    await fillValid(user);
    await user.click(submit());
    await user.click(await screen.findByRole('button', { name: 'Enviar otro mensaje' }));

    expect(field.nombre()).toHaveValue('');
    expect(field.email()).toHaveValue('');
    expect(field.mensaje()).toHaveValue('');
    expect(field.consentimiento()).not.toBeChecked();
    expect(field.tipo()).toHaveValue('consulta');
  });

  it('muestra los errores por campo que devuelve el servidor (422)', async () => {
    mockApi({
      'POST /api/v1/contacto': {
        status: 422,
        body: { error: { code: 'validation_error', message: 'Datos no válidos', fields: { email: 'Dominio no permitido.' } } },
      },
    });
    const user = userEvent.setup();
    render(<ContactForm />);
    await fillValid(user);
    await user.click(submit());

    expect(await screen.findByRole('alert')).toHaveTextContent('Revisa los campos marcados.');
    expect(field.email()).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByText('Dominio no permitido.')).toBeInTheDocument();
    expect(field.nombre()).toHaveValue('  Ana Pérez  ');
    expect(submit()).toBeEnabled();
  });

  it('informa del límite de envíos (429) sin perder lo escrito', async () => {
    mockApi({ 'POST /api/v1/contacto': { status: 429, body: { error: { code: 'rate_limited', message: 'x' } } } });
    const user = userEvent.setup();
    render(<ContactForm />);
    await fillValid(user);
    await user.click(submit());
    expect(await screen.findByRole('alert')).toHaveTextContent('Has enviado demasiados mensajes');
    expect(field.mensaje()).toHaveValue('  Propongo más actividades de lectura.  ');
  });

  it.each([
    ['error del servidor', () => mockApi({ 'POST /api/v1/contacto': { status: 500, body: { error: { code: 'server_error', message: 'x' } } } })],
    ['fallo de red', () => vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')))],
  ])('muestra un mensaje genérico ante %s y permite reintentar', async (_label, setup) => {
    setup();
    const user = userEvent.setup();
    render(<ContactForm />);
    await fillValid(user);
    await user.click(submit());
    expect(await screen.findByRole('alert')).toHaveTextContent('No hemos podido enviar tu mensaje. Inténtalo más tarde.');
    await waitFor(() => expect(submit()).toBeEnabled());
  });

  it('el aviso de error queda asociado al formulario', async () => {
    mockApi({ 'POST /api/v1/contacto': { status: 500, body: { error: { code: 'server_error', message: 'x' } } } });
    const user = userEvent.setup();
    const { container } = render(<ContactForm />);
    await fillValid(user);
    await user.click(submit());
    const alert = await screen.findByRole('alert');
    expect(container.querySelector('form')).toHaveAttribute('aria-describedby', alert.id);
  });
});
