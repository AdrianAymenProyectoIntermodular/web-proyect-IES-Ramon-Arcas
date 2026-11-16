import { useCallback, useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { Link, NavLink, useLocation } from 'react-router';
import { useConfig } from '../../context/ConfigContext';
import { isActiveSection, type NavItem } from '../../lib/navigation';
import { ResponsiveLogo } from '../brand/Logo';
import styles from './Header.module.css';

interface HeaderProps {
  navigation: NavItem[];
}

export function Header({ navigation }: HeaderProps) {
  const { pathname, search } = useLocation();
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  // Cualquier navegación cierra menús abiertos (estado derivado durante el render, sin efecto).
  const locationKey = pathname + search;
  const [renderedLocation, setRenderedLocation] = useState(locationKey);
  if (renderedLocation !== locationKey) {
    setRenderedLocation(locationKey);
    setOpenIndex(null);
    setMobileOpen(false);
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (openIndex === null) return;
    const onPointerDown = (event: PointerEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) setOpenIndex(null);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [openIndex]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  return (
    <header className={[styles.header, scrolled ? styles.scrolled : ''].join(' ')}>
      <div className={`container ${styles.bar}`}>
        <Link to="/" className={styles.brand} aria-label="IES Ramón Arcas Meca, ir al inicio">
          <ResponsiveLogo />
        </Link>

        <nav ref={navRef} className={styles.desktopNav} aria-label="Menú principal">
          <ul className={styles.menu}>
            {navigation.map((item, index) => (
              <li key={item.to + item.label} className={styles.menuItem}>
                {item.children.length === 0 ? (
                  <NavLink to={item.to} end={item.to === '/'} className={({ isActive }) => linkClass(isActive)}>
                    {item.label}
                  </NavLink>
                ) : (
                  <Dropdown
                    item={item}
                    open={openIndex === index}
                    active={isActiveSection(pathname, item)}
                    onToggle={(open) => setOpenIndex(open ? index : null)}
                  />
                )}
              </li>
            ))}
          </ul>
        </nav>

        <IntranetLink className={styles.intranetDesktop} />

        <button
          type="button"
          className={styles.burger}
          aria-expanded={mobileOpen}
          aria-controls="mobile-nav"
          aria-label={mobileOpen ? 'Cerrar menú' : 'Abrir menú'}
          onClick={() => setMobileOpen((v) => !v)}
        >
          <span className={styles.burgerLines} data-open={mobileOpen} aria-hidden="true" />
        </button>
      </div>

      <MobileNav id="mobile-nav" open={mobileOpen} navigation={navigation} pathname={pathname} onClose={() => setMobileOpen(false)} />
    </header>
  );
}

function linkClass(isActive: boolean): string {
  return [styles.link, isActive ? styles.active : ''].join(' ');
}

interface DropdownProps {
  item: NavItem;
  open: boolean;
  active: boolean;
  onToggle: (open: boolean) => void;
}

function Dropdown({ item, open, active, onToggle }: DropdownProps) {
  const panelId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLUListElement>(null);
  const showOverview = !item.children.some((c) => c.to === item.to);

  const focusLink = useCallback((position: 'first' | 'last') => {
    const links = panelRef.current?.querySelectorAll<HTMLAnchorElement>('a');
    if (!links || links.length === 0) return;
    (position === 'first' ? links[0] : links[links.length - 1])?.focus();
  }, []);

  const onButtonKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      onToggle(true);
      const position = event.key === 'ArrowDown' ? 'first' : 'last';
      requestAnimationFrame(() => focusLink(position));
    } else if (event.key === 'Escape') {
      onToggle(false);
    }
  };

  const onPanelKeyDown = (event: KeyboardEvent<HTMLUListElement>) => {
    const links = Array.from(panelRef.current?.querySelectorAll<HTMLAnchorElement>('a') ?? []);
    const current = links.indexOf(document.activeElement as HTMLAnchorElement);
    if (event.key === 'Escape') {
      event.preventDefault();
      onToggle(false);
      buttonRef.current?.focus();
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      links[(current + 1) % links.length]?.focus();
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      links[(current - 1 + links.length) % links.length]?.focus();
    }
  };

  return (
    <div
      className={styles.dropdown}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) onToggle(false);
      }}
    >
      <button
        ref={buttonRef}
        type="button"
        className={[styles.link, styles.trigger, active ? styles.active : ''].join(' ')}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => onToggle(!open)}
        onKeyDown={onButtonKeyDown}
      >
        {item.label}
        <svg className={styles.chevron} data-open={open} viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
          <path d="M7 10l5 5 5-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>
      <ul id={panelId} ref={panelRef} className={styles.panel} data-open={open} hidden={!open} onKeyDown={onPanelKeyDown}>
        {item.children.map((child) => (
          <li key={child.to}>
            <NavLink to={child.to} className={styles.panelLink}>
              {child.label}
            </NavLink>
          </li>
        ))}
        {showOverview && (
          <li className={styles.panelOverview}>
            <NavLink to={item.to} end className={styles.panelLink}>
              Todo {item.label.toLowerCase()} <span aria-hidden="true">→</span>
            </NavLink>
          </li>
        )}
      </ul>
    </div>
  );
}

interface MobileNavProps {
  id: string;
  open: boolean;
  navigation: NavItem[];
  pathname: string;
  onClose: () => void;
}

function MobileNav({ id, open, navigation, pathname, onClose }: MobileNavProps) {
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <nav id={id} className={styles.mobileNav} data-open={open} hidden={!open} aria-label="Menú principal móvil">
      <ul className={styles.mobileList}>
        {navigation.map((item) => {
          const sectionId = `${id}-${item.to.replace(/\W+/g, '-')}`;
          const isExpanded = expanded === item.to || (expanded === null && isActiveSection(pathname, item) && item.to !== '/');
          return (
            <li key={item.to + item.label} className={styles.mobileItem}>
              {item.children.length === 0 ? (
                <NavLink to={item.to} end={item.to === '/'} className={styles.mobileLink}>
                  {item.label}
                </NavLink>
              ) : (
                <>
                  <button
                    type="button"
                    className={styles.mobileLink}
                    aria-expanded={isExpanded}
                    aria-controls={sectionId}
                    onClick={() => setExpanded(isExpanded ? '' : item.to)}
                  >
                    {item.label}
                    <svg className={styles.chevron} data-open={isExpanded} viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                      <path d="M7 10l5 5 5-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </button>
                  <ul id={sectionId} className={styles.mobileSub} hidden={!isExpanded}>
                    {item.children.map((child) => (
                      <li key={child.to}>
                        <NavLink to={child.to} className={styles.mobileSubLink}>
                          {child.label}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </li>
          );
        })}
      </ul>
      <IntranetLink className={styles.intranetMobile} />
    </nav>
  );
}

function IntranetLink({ className }: { className?: string }) {
  const { intranet_url: url } = useConfig();
  if (!url || !/^https?:\/\//i.test(url)) return null;
  return (
    <a className={`button button--outline ${className}`} href={url} rel="noopener noreferrer">
      Acceso intranet
    </a>
  );
}
