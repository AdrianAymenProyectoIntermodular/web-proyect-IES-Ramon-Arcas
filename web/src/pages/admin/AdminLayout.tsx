import { Suspense } from 'react';
import { Navigate, NavLink, Outlet, useLocation } from 'react-router';
import { Loading } from '../../components/ui/AsyncState';
import { useAdminSession } from '../../context/AdminSessionContext';
import styles from './admin.module.css';

const navClass = ({ isActive }: { isActive: boolean }) =>
  isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink;

/** Guard de sesión + cabecera propia del panel (no comparte layout público). */
export function AdminLayout() {
  const { status, session, signOut } = useAdminSession();
  const location = useLocation();

  if (status === 'loading') {
    return (
      <div className={styles.loading}>
        <Loading label="Comprobando sesión…" />
      </div>
    );
  }
  if (!session) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  }

  return (
    <div className={styles.shell}>
      <header className={styles.bar}>
        <div className={styles.barInner}>
          <span className={styles.brand}>Panel del centro</span>
          <nav className={styles.nav} aria-label="Panel de administración">
            <NavLink to="/admin/noticias" className={navClass}>
              Noticias
            </NavLink>
            <NavLink to="/admin/documentos" className={navClass}>
              Documentos
            </NavLink>
          </nav>
          <div className={styles.user}>
            <span>
              {session.user.nombre} · {session.user.rol}
            </span>
            <button className="button button--outline" type="button" onClick={() => void signOut()}>
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>
      <main id="contenido" className={styles.main}>
        <Suspense fallback={<Loading />}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  );
}
