import { useId, useState, type ChangeEvent, type FormEvent } from 'react';
import { ApiError } from '../../api/client';
import { postContacto } from '../../api/endpoints';
import type { ContactoInput, ContactoTipo } from '../../api/types';
import { CONTACT_LIMITS, isContactoTipo, validateContact, type ContactErrors } from '../../lib/contactValidation';
import styles from './ContactForm.module.css';

const TIPO_LABELS: Record<ContactoTipo, string> = {
  consulta: 'Consulta',
  sugerencia: 'Sugerencia',
  queja: 'Queja',
  rincon_pensar: 'El rincón de pensar',
};

type Status = 'idle' | 'sending' | 'sent' | 'error';

const EMPTY: ContactoInput = { nombre: '', email: '', tipo: 'consulta', mensaje: '', consentimiento_privacidad: false };

export function ContactForm({ initialTipo }: { initialTipo?: string | null }) {
  const id = useId();
  const [values, setValues] = useState<ContactoInput>({
    ...EMPTY,
    tipo: isContactoTipo(initialTipo) ? initialTipo : EMPTY.tipo,
  });
  const [errors, setErrors] = useState<ContactErrors>({});
  const [status, setStatus] = useState<Status>('idle');
  const [serverMessage, setServerMessage] = useState('');

  const update = (field: keyof ContactoInput) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const target = event.target;
    const value = target instanceof HTMLInputElement && target.type === 'checkbox' ? target.checked : target.value;
    setValues((v) => ({ ...v, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const clientErrors = validateContact(values);
    setErrors(clientErrors);
    if (Object.keys(clientErrors).length > 0) {
      focusFirstError(event.currentTarget, clientErrors);
      return;
    }

    setStatus('sending');
    setServerMessage('');
    try {
      await postContacto({ ...values, nombre: values.nombre.trim(), email: values.email.trim(), mensaje: values.mensaje.trim() });
      setStatus('sent');
      setValues(EMPTY);
    } catch (error) {
      setStatus('error');
      if (error instanceof ApiError && error.code === 'validation_error') {
        setErrors(error.fields as ContactErrors);
        setServerMessage('Revisa los campos marcados.');
      } else if (error instanceof ApiError && error.status === 429) {
        setServerMessage('Has enviado demasiados mensajes. Espera unos minutos e inténtalo de nuevo.');
      } else {
        setServerMessage('No hemos podido enviar tu mensaje. Inténtalo más tarde.');
      }
    }
  };

  if (status === 'sent') {
    return (
      <div className={styles.success} role="status">
        <h2>¡Mensaje enviado!</h2>
        <p>Gracias por escribirnos. Te responderemos lo antes posible.</p>
        <button type="button" className="button button--outline" onClick={() => setStatus('idle')}>
          Enviar otro mensaje
        </button>
      </div>
    );
  }

  const fieldProps = (field: keyof ContactoInput) => ({
    id: `${id}-${field}`,
    name: field,
    'aria-invalid': errors[field] ? true : undefined,
    'aria-describedby': errors[field] ? `${id}-${field}-error` : undefined,
  });

  const fieldError = (field: keyof ContactoInput) =>
    errors[field] ? (
      <span id={`${id}-${field}-error`} className={styles.error}>
        {errors[field]}
      </span>
    ) : null;

  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate aria-describedby={serverMessage ? `${id}-server` : undefined}>
      {serverMessage && (
        <p id={`${id}-server`} className={styles.serverError} role="alert">
          {serverMessage}
        </p>
      )}

      <div className={styles.row}>
        <div className={styles.field}>
          <label htmlFor={`${id}-nombre`}>Nombre</label>
          <input {...fieldProps('nombre')} type="text" autoComplete="name" maxLength={CONTACT_LIMITS.nombre} value={values.nombre} onChange={update('nombre')} />
          {fieldError('nombre')}
        </div>
        <div className={styles.field}>
          <label htmlFor={`${id}-email`}>Correo electrónico</label>
          <input {...fieldProps('email')} type="email" autoComplete="email" value={values.email} onChange={update('email')} />
          {fieldError('email')}
        </div>
      </div>

      <div className={styles.field}>
        <label htmlFor={`${id}-tipo`}>Tipo de mensaje</label>
        <select {...fieldProps('tipo')} value={values.tipo} onChange={update('tipo')}>
          {Object.entries(TIPO_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        {fieldError('tipo')}
      </div>

      <div className={styles.field}>
        <label htmlFor={`${id}-mensaje`}>Mensaje</label>
        <textarea {...fieldProps('mensaje')} rows={6} maxLength={CONTACT_LIMITS.mensaje} value={values.mensaje} onChange={update('mensaje')} />
        {fieldError('mensaje')}
      </div>

      <div className={styles.checkbox}>
        <input {...fieldProps('consentimiento_privacidad')} type="checkbox" checked={values.consentimiento_privacidad} onChange={update('consentimiento_privacidad')} />
        <label htmlFor={`${id}-consentimiento_privacidad`}>
          He leído y acepto que el centro trate mis datos solo para responder a este mensaje.
        </label>
        {fieldError('consentimiento_privacidad')}
      </div>

      <button type="submit" className="button" disabled={status === 'sending'}>
        {status === 'sending' ? 'Enviando…' : 'Enviar mensaje'}
      </button>
    </form>
  );
}

function focusFirstError(form: HTMLFormElement, errors: ContactErrors) {
  const first = Object.keys(errors)[0];
  if (first) form.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
}
