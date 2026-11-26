import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { adminLogin, adminLogout, getAdminCsrf, getAdminMe, type AdminSession } from '../api/admin';

export type AdminStatus = 'loading' | 'anonymous' | 'authenticated';

interface AdminSessionValue {
  status: AdminStatus;
  session: AdminSession | null;
  signIn: (email: string, password: string) => Promise<AdminSession>;
  signOut: () => Promise<void>;
  /** Renueva el token CSRF tras un 403 sin cerrar la sesión. */
  refreshCsrf: () => Promise<string>;
}

const AdminSessionContext = createContext<AdminSessionValue | null>(null);

/** Sesión del panel: cookie httpOnly en el servidor y token CSRF en memoria. */
export function AdminSessionProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AdminStatus>('loading');
  const [session, setSession] = useState<AdminSession | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    getAdminMe(controller.signal).then(
      (data) => {
        if (controller.signal.aborted) return;
        setSession(data);
        setStatus('authenticated');
      },
      () => {
        if (controller.signal.aborted) return;
        setSession(null);
        setStatus('anonymous');
      },
    );
    return () => controller.abort();
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { csrf_token } = await getAdminCsrf();
    const data = await adminLogin(email, password, csrf_token);
    setSession(data);
    setStatus('authenticated');
    return data;
  }, []);

  const signOut = useCallback(async () => {
    const token = session?.csrf_token;
    setSession(null);
    setStatus('anonymous');
    if (token) {
      try {
        await adminLogout(token);
      } catch {
        // La cookie ya no es válida: el estado local queda cerrado igualmente.
      }
    }
  }, [session]);

  const refreshCsrf = useCallback(async () => {
    const { csrf_token } = await getAdminCsrf();
    setSession((current) => (current ? { ...current, csrf_token } : current));
    return csrf_token;
  }, []);

  const value = useMemo(
    () => ({ status, session, signIn, signOut, refreshCsrf }),
    [status, session, signIn, signOut, refreshCsrf],
  );

  return <AdminSessionContext.Provider value={value}>{children}</AdminSessionContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components -- hook acoplado a su provider
export function useAdminSession(): AdminSessionValue {
  const value = useContext(AdminSessionContext);
  if (!value) throw new Error('useAdminSession debe usarse dentro de AdminSessionProvider');
  return value;
}
