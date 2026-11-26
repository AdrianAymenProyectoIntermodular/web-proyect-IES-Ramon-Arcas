import { useState, type FormEvent } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router';
import { ApiError } from '../../api/client';
import { useAdminSession } from '../../context/AdminSessionContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import styles from './admin.module.css';

function loginErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 401) return 'Credenciales incorrectas.';
    if (error.status === 429) return 'Demasiados intentos. Espera unos minutos antes de volver a probar.';
    if (error.status === 403) return 'La sesión de seguridad ha caducado. Recarga la página e inténtalo de nuevo.';
    if (error.status === 422) return Object.values(error.fields)[0] ?? 'Revisa los datos introducidos.';
    if (error.status === 0) return 'No se pudo conectar con el servidor.';
  }
  return 'No se pudo iniciar sesión. Inténtalo de nuevo.';
}

export function AdminLoginPage() {
  useDocumentTitle('Acceso al panel');
  const { status, signIn } = useAdminSession();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? '/admin/noticias';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);

  if (status === 'authenticated') return <Navigate to="/admin/noticias" replace />;

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSending(true);
    try {
      await signIn(email.trim(), password);
      navigate(from, { replace: true });
    } catch (cause) {
      setError(loginErrorMessage(cause));
    } finally {
      setSending(false);
    }
  };

  return (
    <main className={styles.login}>
      <div className={styles.loginCard}>
        <span className="eyebrow">Panel del centro</span>
        <h1>Acceso al panel</h1>
        <p>Gestión de noticias y documentos del sitio público.</p>
        {error && (
          <p className={`${styles.message} ${styles.messageError}`} role="alert">
            {error}
          </p>
        )}
        <form className={styles.form} onSubmit={onSubmit} noValidate>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="admin-email">
              Correo electrónico
            </label>
            <input
              id="admin-email"
              className={styles.input}
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="admin-password">
              Contraseña
            </label>
            <input
              id="admin-password"
              className={styles.input}
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>
          <button className="button" type="submit" disabled={sending}>
            {sending ? 'Entrando…' : 'Entrar'}
          </button>
        </form>
      </div>
    </main>
  );
}
