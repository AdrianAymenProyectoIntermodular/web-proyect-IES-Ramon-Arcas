# Frontend — web pública IES Ramón Arcas Meca

React 19 + TypeScript (strict) + Vite + React Router. Consume la API pública `/api/v1` del mismo origen.

## Scripts

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo en `http://localhost:5173`; `/api` y `/storage` se redirigen a `VITE_API_PROXY` (por defecto `http://localhost:8088`) |
| `npm test` | Tests unitarios y de componentes (Vitest + Testing Library, jsdom) |
| `npm run test:watch` | Tests en modo observación |
| `npm run test:coverage` | Tests con informe de cobertura |
| `npm run lint` | ESLint (incluye reglas de React Hooks) |
| `npm run typecheck` | Comprobación de tipos sin compilar |
| `npm run build` | Tipos + build de producción en `dist/` (lo sirve Nginx en `/`) |

Sin la API arrancada la web sigue funcionando: el menú usa su copia local y cada bloque muestra su estado de error.

## Estructura

```
src/
  api/          Cliente HTTP (errores del contrato → ApiError), endpoints y tipos
  components/   layout (cabecera, pie), ui (PageHeader, AsyncState, Reveal, Markdown),
                departments, events, people, contact, brand
  context/      Configuración pública del centro (GET /configuracion)
  hooks/        useApi (carga con cancelación), useNavigation, useDocumentTitle
  lib/          Lógica pura: fechas, i18n, navegación, validación del contacto
  pages/        Una página por ruta; las diferidas se declaran en pages/lazyPages.ts
  styles/       tokens.css (colores, elevaciones, tipografía, movimiento) y global.css
  test/         setup de Vitest y utilidades (mockApi, renderRoute)
  routes.tsx    Rutas y secciones pendientes (PENDING_SECTIONS)
```

## Añadir una sección

1. Crea la página en `src/pages/` reutilizando `PageHeader`, `AsyncState` y los tokens de `styles/tokens.css`.
2. Si llama a la API, añade el endpoint tipado en `src/api/endpoints.ts` y sus tipos en `src/api/types.ts`.
3. Declárala en `src/pages/lazyPages.ts`, quita su entrada de `PENDING_SECTIONS` y añade la ruta en `src/routes.tsx`.
4. Escribe sus tests junto al código (`*.test.tsx`) y ejecuta `npm test`, `npm run lint`, `npm run typecheck` y `npm run build` antes del commit.

## Tests

- Simula la API con `mockApi({ '/api/v1/recurso': { body: {...} } })`; las rutas no declaradas responden 404 con el formato de error de la API.
- Renderiza páginas completas con `renderRoute('/ruta')` (router en memoria + configuración).
- Busca elementos por rol y nombre accesible (`getByRole('link', { name: '…' })`): así el test también comprueba la accesibilidad.
- Cubre carga, vacío, error, 404 y teclado además del caso normal.

## Accesibilidad e identidad

- Naranja `#ff6900` solo como fondo o decoración; el texto encima es `--color-on-brand` (`#1a1a1a`) y los enlaces naranjas usan `--color-brand-ink` (`#b34700`).
- Las animaciones (`Reveal`, `SplitText`) se desactivan con `prefers-reduced-motion`.
- Menú: desplegables con `aria-expanded`, flechas y Escape; en móvil, hamburguesa con acordeón.
