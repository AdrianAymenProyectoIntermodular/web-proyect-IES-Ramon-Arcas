import { describe, expect, it } from 'vitest';
import type { ContactoInput } from '../api/types';
import { CONTACT_LIMITS, isContactoTipo, validateContact } from './contactValidation';

const valid: ContactoInput = {
  nombre: 'Ana Pérez',
  email: 'ana@example.com',
  tipo: 'consulta',
  mensaje: '¿Cuándo es la matrícula?',
  consentimiento_privacidad: true,
};

describe('validateContact', () => {
  it('no devuelve errores para un envío válido', () => {
    expect(validateContact(valid)).toEqual({});
  });

  it('exige nombre (sin contar espacios)', () => {
    expect(validateContact({ ...valid, nombre: '   ' })).toHaveProperty('nombre');
  });

  it('limita el nombre a 160 caracteres como el servidor', () => {
    expect(validateContact({ ...valid, nombre: 'a'.repeat(CONTACT_LIMITS.nombre) })).not.toHaveProperty('nombre');
    expect(validateContact({ ...valid, nombre: 'a'.repeat(CONTACT_LIMITS.nombre + 1) })).toHaveProperty('nombre');
  });

  it.each(['', 'ana', 'ana@', '@example.com', 'ana@example', 'ana example@x.com', 'ana@example.c'])('rechaza el email "%s"', (email) => {
    expect(validateContact({ ...valid, email })).toHaveProperty('email');
  });

  it.each(['ana@example.com', 'ana.perez+ies@sub.example.es', '  ana@example.com  '])('acepta el email "%s"', (email) => {
    expect(validateContact({ ...valid, email })).not.toHaveProperty('email');
  });

  it('rechaza tipos fuera de la whitelist del servidor', () => {
    expect(validateContact({ ...valid, tipo: 'spam' as ContactoInput['tipo'] })).toHaveProperty('tipo');
  });

  it('exige mensaje y lo limita a 5000 caracteres', () => {
    expect(validateContact({ ...valid, mensaje: '\n  ' })).toHaveProperty('mensaje');
    expect(validateContact({ ...valid, mensaje: 'x'.repeat(CONTACT_LIMITS.mensaje) })).not.toHaveProperty('mensaje');
    expect(validateContact({ ...valid, mensaje: 'x'.repeat(CONTACT_LIMITS.mensaje + 1) })).toHaveProperty('mensaje');
  });

  it('exige consentimiento de privacidad (RGPD)', () => {
    expect(validateContact({ ...valid, consentimiento_privacidad: false })).toHaveProperty('consentimiento_privacidad');
  });

  it('acumula todos los errores a la vez', () => {
    const errors = validateContact({ nombre: '', email: 'x', tipo: 'otro' as ContactoInput['tipo'], mensaje: '', consentimiento_privacidad: false });
    expect(Object.keys(errors).sort()).toEqual(['consentimiento_privacidad', 'email', 'mensaje', 'nombre', 'tipo']);
  });
});

describe('isContactoTipo', () => {
  it.each(['consulta', 'sugerencia', 'queja', 'rincon_pensar'])('acepta %s', (tipo) => {
    expect(isContactoTipo(tipo)).toBe(true);
  });

  it.each([null, undefined, '', 'Consulta', 'otro'])('rechaza %s', (tipo) => {
    expect(isContactoTipo(tipo)).toBe(false);
  });
});
