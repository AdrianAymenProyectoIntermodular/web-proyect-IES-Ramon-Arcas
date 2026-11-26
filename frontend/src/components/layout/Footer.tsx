import { Link } from 'react-router';
import { useConfig } from '../../context/ConfigContext';
import type { NavItem } from '../../lib/navigation';
import { Logo } from '../brand/Logo';
import styles from './Footer.module.css';

export function Footer({ navigation }: { navigation: NavItem[] }) {
  const config = useConfig();
  const year = new Date().getFullYear();
  const intranet = config.intranet_url && /^https?:\/\//i.test(config.intranet_url) ? config.intranet_url : null;

  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.grid}`}>
        <div className={styles.brand}>
          <Logo variant="stacked" />
          <address className={styles.address}>
            {config.direccion && <span>{config.direccion}</span>}
            {config.telefono && <a href={`tel:${config.telefono.replace(/\s+/g, '')}`}>{config.telefono}</a>}
            {config.email_contacto && <a href={`mailto:${config.email_contacto}`}>{config.email_contacto}</a>}
            {config.horario_general && <span>Horario: {config.horario_general}</span>}
          </address>
        </div>

        <nav aria-label="Mapa del sitio" className={styles.sitemap}>
          {navigation
            .filter((item) => item.children.length > 0)
            .map((item) => (
              <div key={item.to}>
                <h2 className={styles.heading}>{item.label}</h2>
                <ul>
                  {item.children.slice(0, 5).map((child) => (
                    <li key={child.to}>
                      <Link to={child.to}>{child.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
        </nav>
      </div>

      <div className={`container ${styles.bottom}`}>
        <span>
          © {year} {config.nombre_centro} · {config.localizacion}
        </span>
        <span className={styles.bottomLinks}>
          <Link to="/contacto">Contacto</Link>
          {intranet && (
            <a href={intranet} rel="noopener noreferrer">
              Acceso intranet
            </a>
          )}
        </span>
      </div>
    </footer>
  );
}
