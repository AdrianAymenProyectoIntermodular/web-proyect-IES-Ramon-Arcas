import styles from './Logo.module.css';

export type LogoVariant = 'horizontal' | 'stacked' | 'icon';

const SOURCES: Record<LogoVariant, { src: string; width: number; height: number }> = {
  horizontal: { src: '/brand/logo-horizontal.png', width: 1024, height: 262 },
  stacked: { src: '/brand/logo-stacked.png', width: 313, height: 161 },
  icon: { src: '/brand/logo-icon.png', width: 714, height: 714 },
};

interface LogoProps {
  variant: LogoVariant;
  className?: string;
  /** Vacío si el logo es decorativo junto a un texto que ya nombra el centro. */
  alt?: string;
}

export function Logo({ variant, className, alt = 'IES Ramón Arcas Meca, Lorca' }: LogoProps) {
  const { src, width, height } = SOURCES[variant];
  return (
    <img
      className={[styles.logo, styles[variant], className].filter(Boolean).join(' ')}
      src={src}
      width={width}
      height={height}
      alt={alt}
      decoding="async"
    />
  );
}

/**
 * Logo de cabecera: horizontal en escritorio y solo el sol en móvil,
 * donde el horizontal sería ilegible.
 */
export function ResponsiveLogo() {
  return (
    <picture>
      <source media="(max-width: 600px)" srcSet={SOURCES.icon.src} width={40} height={40} />
      <img
        className={styles.header}
        src={SOURCES.horizontal.src}
        width={SOURCES.horizontal.width}
        height={SOURCES.horizontal.height}
        alt="IES Ramón Arcas Meca, Lorca"
        decoding="async"
      />
    </picture>
  );
}
