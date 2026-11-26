import { Outlet } from 'react-router';
import { AdminSessionProvider } from '../../context/AdminSessionContext';

/** Raíz de /admin: provee la sesión y deja pasar al layout correspondiente. */
export function AdminRoot() {
  return (
    <AdminSessionProvider>
      <Outlet />
    </AdminSessionProvider>
  );
}
