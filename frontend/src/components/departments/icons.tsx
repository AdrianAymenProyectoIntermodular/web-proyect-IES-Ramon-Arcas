import type { ReactElement } from 'react';
import { IconLabel as Label, IconSvg as Svg } from './IconSvg';

const SPEECH_BUBBLE = 'M8 10h32a3 3 0 0 1 3 3v18a3 3 0 0 1-3 3H20l-8 7v-7H8a3 3 0 0 1-3-3V13a3 3 0 0 1 3-3z';

/** Iconos de 48x48 por slug de departamento (`App\Seed\DemoContent::departamentos()`). */
export const DEPARTMENT_ICONS: Readonly<Record<string, () => ReactElement>> = {
  matematicas: () => (
    <Svg>
      <rect x="6" y="6" width="36" height="36" rx="8" />
      <path d="M15 17h8M19 13v8M27 17h7M15 31l6-6M21 31l-6-6M27 28h7M27 32h7" />
    </Svg>
  ),
  lengua: () => (
    <Svg>
      <path d="M24 12c-4-3-10-4-17-3v28c7-1 13 0 17 3 4-3 10-4 17-3V9c-7-1-13 0-17 3z" />
      <path d="M24 12v28M12 17h7M12 23h7M29 17h7M29 23h7" />
    </Svg>
  ),
  ingles: () => (
    <Svg>
      <path d={SPEECH_BUBBLE} />
      <Label text="EN" />
    </Svg>
  ),
  frances: () => (
    <Svg>
      <path d={SPEECH_BUBBLE} />
      <Label text="FR" />
    </Svg>
  ),
  'geografia-historia': () => (
    <Svg>
      <circle cx="24" cy="24" r="17" />
      <path d="M7 24h34M24 7c-5 5-7 11-7 17s2 12 7 17M24 7c5 5 7 11 7 17s-2 12-7 17" />
    </Svg>
  ),
  'biologia-geologia': () => (
    <Svg>
      <path d="M39 9C20 9 9 18 9 31c0 4 2 8 4 8 13 0 26-9 26-30z" />
      <path d="M9 41c6-10 13-17 22-23" />
    </Svg>
  ),
  'fisica-quimica': () => (
    <Svg>
      <path d="M19 6h10M20 6v12L9 37a3 3 0 0 0 3 5h24a3 3 0 0 0 3-5L28 18V6" />
      <path d="M14 30h20" />
      <circle cx="21" cy="35" r="1.5" />
      <circle cx="28" cy="33" r="1.5" />
    </Svg>
  ),
  tecnologia: () => (
    <Svg>
      <circle cx="24" cy="24" r="6" />
      <path d="M24 5v6M24 37v6M5 24h6M37 24h6M10.6 10.6l4.2 4.2M33.2 33.2l4.2 4.2M10.6 37.4l4.2-4.2M33.2 14.8l4.2-4.2" />
      <circle cx="24" cy="24" r="13" />
    </Svg>
  ),
  'educacion-fisica': () => (
    <Svg>
      <circle cx="24" cy="27" r="15" />
      <path d="M20 6h8M24 6v6M24 27l6-6M37 12l3-3" />
    </Svg>
  ),
  musica: () => (
    <Svg>
      <path d="M18 36V10l22-4v26" />
      <circle cx="13" cy="36" r="5" />
      <circle cx="35" cy="32" r="5" />
      <path d="M18 17l22-4" />
    </Svg>
  ),
  dibujo: () => (
    <Svg>
      <path d="M31 7l10 10-23 23H8V30z" />
      <path d="M26 12l10 10M8 30l10 10" />
    </Svg>
  ),
  filosofia: () => (
    <Svg>
      <path d="M17 33c0-4-6-7-6-15a13 13 0 0 1 26 0c0 8-6 11-6 15z" />
      <path d="M18 38h12M20 43h8M24 20v7M21 23h6" />
    </Svg>
  ),
  economia: () => (
    <Svg>
      <path d="M6 42h36M11 42V30M20 42V24M29 42V28M38 42V16" />
      <path d="M9 22l10-9 8 6 12-11M33 8h6v6" />
    </Svg>
  ),
  informatica: () => (
    <Svg>
      <rect x="5" y="8" width="38" height="26" rx="3" />
      <path d="M17 42h14M24 34v8M20 17l-5 4 5 4M28 17l5 4-5 4" />
    </Svg>
  ),
  electricidad: () => (
    <Svg>
      <path d="M27 4L10 27h12l-3 17 18-24H25z" />
    </Svg>
  ),
  orientacion: () => (
    <Svg>
      <circle cx="24" cy="24" r="18" />
      <path d="M31 17l-4 10-10 4 4-10z" />
      <path d="M24 6v3M24 39v3M6 24h3M39 24h3" />
    </Svg>
  ),
};

export function renderFallbackIcon(): ReactElement {
  return (
    <Svg>
      <path d="M6 20L24 8l18 12" />
      <path d="M10 20v20h28V20M20 40V29h8v11" />
    </Svg>
  );
}

/** Los departamentos creados después en el panel no tienen icono propio. */
export function hasDepartmentIcon(slug: string): boolean {
  return Object.hasOwn(DEPARTMENT_ICONS, slug);
}
