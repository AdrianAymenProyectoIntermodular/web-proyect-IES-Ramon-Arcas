import { CONTACTO_TIPOS, type ContactoInput, type ContactoTipo } from '../api/types';

export type ContactErrors = Partial<Record<keyof ContactoInput, string>>;

export const CONTACT_LIMITS = { nombre: 160, mensaje: 5000 } as const;

// Misma regla que FILTER_VALIDATE_EMAIL en lo esencial; el servidor sigue siendo la autoridad.
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function isContactoTipo(value: string | null | undefined): value is ContactoTipo {
  return typeof value === 'string' && (CONTACTO_TIPOS as readonly string[]).includes(value);
}

/** Validación de cortesía que replica `ContactoController::store`. */
export function validateContact(input: ContactoInput): ContactErrors {
  const errors: ContactErrors = {};
  const nombre = input.nombre.trim();
  const mensaje = input.mensaje.trim();

  if (nombre === '') errors.nombre = 'Indica tu nombre';
  else if (nombre.length > CONTACT_LIMITS.nombre) errors.nombre = `Máximo ${CONTACT_LIMITS.nombre} caracteres`;

  if (!EMAIL.test(input.email.trim())) errors.email = 'Introduce un correo electrónico válido';

  if (!isContactoTipo(input.tipo)) errors.tipo = 'Selecciona un tipo de mensaje';

  if (mensaje === '') errors.mensaje = 'Escribe tu mensaje';
  else if (mensaje.length > CONTACT_LIMITS.mensaje) errors.mensaje = `Máximo ${CONTACT_LIMITS.mensaje} caracteres`;

  if (!input.consentimiento_privacidad) errors.consentimiento_privacidad = 'Debes aceptar el aviso de privacidad';

  return errors;
}
