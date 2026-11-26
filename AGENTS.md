# AGENTS.md — Web pública IES Ramón Arcas

Normas breves para agentes y desarrolladores. Detalle en `docs/`.

## Qué es este proyecto

Sitio **público** del centro (familias, alumnado, comunidad). API REST JSON bajo `/api/v1` + panel admin de contenidos.

**No es la intranet.** Repositorio, base de datos, sesión y autenticación propios. Único puente: clave pública `intranet_url` en configuración.

## Stack

- PHP 8.3 sin framework (Composer + PSR-4 + PHPUnit)
- MariaDB 11.4 LTS
- Docker: Nginx (same-origin) + PHP-FPM + MariaDB
- Estructura: `backend/` (PHP, `openapi.yaml`, Dockerfile), `frontend/` (React; panel admin en `src/admin/`), `shared/` (fixtures comunes), `infra/` (Nginx). Ningún archivo de una parte dentro de la otra; lo común va en `shared/` o `infra/`
- OpenAPI: `backend/openapi.yaml` (solo operaciones implementadas)
- Frontend en `frontend/`: React 19 + TypeScript strict + Vite + React Router, `motion` para animaciones, Vitest + Testing Library. Nginx sirve `frontend/dist` en `/`

## Contexto del proyecto intermodular

Memoria (Proyecto 2), entregas E1–E4, reparto con el compañero, fuentes de la historia: [docs/proyecto-intermodular.md](docs/proyecto-intermodular.md).

- El centro está en **Lorca** (Murcia), no en Totana.
- Personas, eventos y fichas de departamentos son **ficticios**; solo la historia del centro es real.
- Identidad: blanco + `#ff6900`; texto sobre naranja en `#1a1a1a` y enlaces naranjas en `#b34700` (contraste WCAG AA). Logos en `frontend/public/brand/`.
- Tokens en `frontend/src/styles/tokens.css`; reutilizar los componentes de `frontend/src/components/` antes de crear otros.

## Arranque rápido

Ver [README.md](README.md). Resumen: copiar `.env.example` → `.env`, `docker compose up -d --build`, `composer install`, `php bin/migrate.php`, `php bin/seed.php`. Frontend: `cd web && npm install && npm run dev`.

## Arquitectura

- Capas propias: Router, Request/Response, Auth/RBAC, PDO
- Menú ≠ contenido; archivos únicos; documentos reutilizables
- Públicos: solo `publicado` (+ vigencia). Mismo 404 si no existe o no está publicado
- Admin: sesión cookie + CSRF + roles (`admin` | `editor` | `secretaria`)
- i18n: columnas `*_es` / `*_en`; fallback a ES
- Personas + órganos + pertenencias (cargo en el vínculo); optativas = materia + oferta

Documentos: [docs/arquitectura.md](docs/arquitectura.md), [docs/modelo-datos.md](docs/modelo-datos.md), [docs/seguridad.md](docs/seguridad.md), [docs/permisos.md](docs/permisos.md), [docs/fases.md](docs/fases.md).

## Reglas al implementar

1. Autorización siempre en servidor (`App\Auth\Rbac`).
2. `ORDER BY` solo con whitelist (`App\Support\Sort`).
3. Errores: `{ "error": { "code", "message", "fields?" } }`.
4. Actualizar `backend/openapi.yaml` junto al código de cada endpoint.
5. No compartir BD/sesión con la intranet.
6. No añadir rutas “reserved” al OpenAPI; roadmap en `docs/fases.md`.
7. Comentarios: decisiones e invariantes, no narrar lo obvio.
8. Tests de permisos (401/403) y visibilidad pública en cada recurso sensible.
9. Secretos solo en `.env` (nunca en el repo).
10. **Toda implementación nueva incluye tests unitarios y se ejecutan antes de cada commit.** No se integra nada con tests en rojo.
11. Frontend: el contraste de color, la navegación con teclado y `prefers-reduced-motion` forman parte de la implementación, no de un repaso posterior.

## Tests (obligatorios)

| Parte | Dónde | Ejecutar |
|---|---|---|
| API PHP | `backend/tests/` (PHPUnit) | `docker compose exec php vendor/bin/phpunit` (o `cd backend; vendor/bin/phpunit`) |
| Frontend | `frontend/src/**/*.test.ts(x)` (Vitest + Testing Library) | `cd frontend; npm test` |
| Calidad front | — | `npm run lint`, `npm run typecheck`, `npm run build` |

Qué cubrir en cada implementación:
- Casos normales, límites y errores (404, 422, 429, fallo de red), no solo el camino feliz.
- API: permisos 401/403 y visibilidad pública (borradores y fuera de vigencia dan 404).
- Front: comportamiento visible para el usuario (roles y nombres accesibles, teclado, estados de carga/vacío/error). Simular la API con `mockApi()` y renderizar rutas con `renderRoute()` (`frontend/src/test/utils.tsx`); nunca llamar a la API real.
- Si se cambia el menú del seed, regenerar `shared/fixtures/menu-principal.json` con `php backend/bin/menu-fixture.php`: lo comparan PHPUnit y Vitest.

## Flujo Git

- Remoto: `https://github.com/adrirosel/web-proyect-IES-Ramon-Arcas.git`
- **Ramas de trabajo:** `<Nombre>-<nombre-de-la-implementacion>` (ej. `Adrian-scaffold-frontend`, `Adrian-tests-visibilidad`); cada integrante usa su nombre.
- Resolver conflictos **en esa rama** antes de integrar.
- Integrar en `main` solo cuando la implementación esté terminada y estable.
- El commit inicial en `main` fue la excepción de arranque del repositorio; a partir de ahora no desarrollar directamente sobre `main`.

## Mapa sección web → recursos API

| Sección | Recursos |
|---|---|
| Inicio / contacto | `configuracion`, `avisos`, `noticias`, `POST /contacto` |
| Organización | `organos`, `personas`, `departamentos`, `paginas`, `documentos` |
| Familias | `documentos`, `enlaces`, `paginas`, `contacto` (tipos) |
| Enseñanzas | `ensenanzas`, `materias-optativas`, `ofertas-optativas` |
| Programas | `programas` (+ N:M departamentos) |
| Secretaría | `documentos` (categoría), `paginas`, `contacto` |
| Noticias / calendario | `noticias`, `eventos`, `cursos-academicos` |
