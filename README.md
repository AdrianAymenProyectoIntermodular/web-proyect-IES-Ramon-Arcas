# Web pública — IES Ramón Arcas Meca

Web informativa del centro (Lorca, Murcia): API REST en PHP + frontend React/TypeScript. Independiente de la intranet: otra base de datos, otra sesión y otro login. El único enlace entre ambos es la URL configurable `intranet_url`.

- **1ª entrega (tag `Entrega1`):** contrato OpenAPI + API REST operativa + documentación de diseño.
- **2ª entrega:** frontend público en `frontend/` (identidad visual, menú responsive, Inicio con agenda, departamentos, historia, órganos de gobierno y contacto) + seed de demostración + tests.
- **3ª/4ª entrega (E3–E4):** secciones públicas restantes (Noticias, Enseñanzas, Programas, Familias, Secretaría, documentos) y panel admin mínimo. Detalle en [docs/memoria-modulos.md](docs/memoria-modulos.md).
- Roadmap y reparto: [docs/fases.md](docs/fases.md) y [docs/proyecto-intermodular.md](docs/proyecto-intermodular.md).

Los datos de personas y eventos del seed son **ficticios**; la historia del centro es real y sus fuentes están citadas.

Repositorio público: [adrirosel/web-proyect-IES-Ramon-Arcas](https://github.com/adrirosel/web-proyect-IES-Ramon-Arcas).

## Por qué esta arquitectura

- **API-first** bajo `/api/v1`: el contrato JSON permite después un front público, un panel admin o ambos sin rehacer el dominio.
- **PHP sin framework + Composer**: control del ciclo request→respuesta (router, auth, repositorios) sin acoplar a un MVC pesado; Composer aporta autoload y PHPUnit.
- **MariaDB 11.4 LTS**: rama con mantenimiento predecible y compatibilidad MySQL habitual en hosting.
- **Nginx same-origin** (`/` frontend, `/api`, uploads; futuro `/admin`): cookies de sesión y CSRF sin pelear con CORS multi-origen. Puerto host: **8088**.
- **React + TypeScript + Vite** en `frontend/`: tipado estricto contra el contrato de la API, páginas cargadas bajo demanda y tests con Vitest + Testing Library.
- **Menú separado del contenido**, **archivos únicos** y **documentos reutilizables**: evita duplicar subidas y permite nuevas secciones sin endpoints ad hoc.
- **Personas + órganos + pertenencias**: una persona puede ser docente y miembro del consejo con cargos distintos, sin duplicar fichas.
- **Materias optativas + ofertas**: la materia (“Robótica”) no se clona cada curso; la oferta fija enseñanza, nivel y curso académico.

## Correspondencia memoria → API

| Sección web (memoria §6.2) | Recursos API |
|---|---|
| Inicio / contacto | `configuracion`, `avisos`, `noticias`, `POST /contacto` |
| Organización | `organos`, `personas`, `departamentos`, `paginas`, `documentos`, `menus` |
| Familias | `documentos`, `enlaces`, `paginas`, `contacto` |
| Enseñanzas | `ensenanzas`, `materias-optativas`, `ofertas-optativas` |
| Programas | `programas` (+ N:M departamentos) |
| Secretaría | `documentos` (categoría), `paginas`, `contactos` (bandeja admin) |
| Noticias / calendario | `noticias`, `eventos`, `cursos-academicos` |

Nombres orientativos de la memoria vs tablas reales: `configuracion_centro` → `configuracion`; `solicitudes_secretaria` → `contactos`; jerarquía `padre_id` en `menu_items`, no en `paginas`. Detalle en [docs/modelo-datos.md](docs/modelo-datos.md).

## Requisitos

- Docker y Docker Compose
- Node.js 20.19+ (o 22.12+) y npm para el frontend
- (Opcional en host) PHP 8.3+ y Composer para tests locales

## Arranque

```bash
cp .env.example .env
docker compose up -d --build
docker compose exec php composer install
docker compose exec php php bin/migrate.php
docker compose exec php php bin/seed.php
```

Nginx publica la API en `http://localhost:8088/api/v1`.

### Frontend

```bash
cd frontend
npm install
npm run dev      # http://localhost:5173 (proxy de /api a http://localhost:8088)
npm run build    # genera frontend/dist, que Nginx sirve en http://localhost:8088/
```

Detalles en [frontend/README.md](frontend/README.md). Si la API está en otro puerto: `VITE_API_PROXY=http://localhost:9000 npm run dev`.

Comprobar la API:

```bash
curl -s http://localhost:8088/api/v1/health
curl -s http://localhost:8088/api/v1/configuracion
curl -s http://localhost:8088/api/v1/noticias
```

### Smoke por sección del mapa

```bash
# Inicio / config (incluye intranet_url)
curl -s http://localhost:8088/api/v1/configuracion
# Navegación (árbol §6.2)
curl -s http://localhost:8088/api/v1/menus/principal
# Organización
curl -s http://localhost:8088/api/v1/organos
curl -s http://localhost:8088/api/v1/departamentos
curl -s http://localhost:8088/api/v1/paginas/quienes-somos
# Familias
curl -s "http://localhost:8088/api/v1/documentos?categoria=familias"
curl -s "http://localhost:8088/api/v1/enlaces?grupo=plataformas"
# Enseñanzas / optativas
curl -s http://localhost:8088/api/v1/ensenanzas
curl -s http://localhost:8088/api/v1/materias-optativas
# Programas
curl -s http://localhost:8088/api/v1/programas
# Noticias / eventos
curl -s http://localhost:8088/api/v1/noticias
curl -s http://localhost:8088/api/v1/eventos
# Secretaría (categoría de documentos)
curl -s "http://localhost:8088/api/v1/documentos?categoria=secretaria"
```

Credenciales admin del seed: las de `ADMIN_EMAIL` / `ADMIN_PASSWORD` en `.env` (solo desarrollo).

### Flujo de login (CSRF)

```bash
# 1) Obtener cookie + CSRF
curl -c cookies.txt -s http://localhost:8088/api/v1/admin/csrf
# 2) Login con header X-CSRF-Token
curl -b cookies.txt -c cookies.txt -s -X POST http://localhost:8088/api/v1/admin/login \
  -H "Content-Type: application/json" \
  -H "X-CSRF-Token: <token>" \
  -d "{\"email\":\"admin@iesramonarcas.local\",\"password\":\"ChangeMe_DevOnly_123!\"}"
```

## Estructura

```
backend/       API PHP: public/, src/, routes/, bin/, database/ (migraciones, seed, PDFs demo),
               tests/, storage/, openapi.yaml (contrato), Dockerfile, composer.json
frontend/      Web React + TypeScript + Vite: src/ (sitio público y src/admin/), public/brand/
shared/        Lo que comparten ambas partes: fixtures/menu-principal.json (PHPUnit + Vitest)
infra/         Infraestructura común: nginx/default.conf (sirve /, /api y /storage)
docs/          Arquitectura, seguridad, modelo, permisos, fases, proyecto intermodular
docker-compose.yml, .env.example   Orquestación local (Nginx + PHP-FPM + MariaDB)
```

Regla: cada archivo vive en la parte a la que pertenece. Lo que usan las dos partes va en `shared/` o `infra/`, nunca dentro de la otra.

Si vienes de la estructura antigua (`api/`, `web/`, `docker/`): [docs/guia-reorganizacion.md](docs/guia-reorganizacion.md).

## Documentación

| Documento | Contenido |
|---|---|
| [AGENTS.md](AGENTS.md) | Normas para agentes / convenciones |
| [backend/openapi.yaml](backend/openapi.yaml) | Endpoints, esquemas, errores |
| [docs/arquitectura.md](docs/arquitectura.md) | Capas y decisiones |
| [docs/seguridad.md](docs/seguridad.md) | Controles y checklist |
| [docs/modelo-datos.md](docs/modelo-datos.md) | Tablas, relaciones y mapa memoria↔API |
| [docs/permisos.md](docs/permisos.md) | Matriz RBAC |
| [docs/fases.md](docs/fases.md) | Hitos y roadmap (fuera de OpenAPI) |
| [docs/proyecto-intermodular.md](docs/proyecto-intermodular.md) | Memoria (Proyecto 2), entregas, reparto, fuentes de la historia |
| [docs/guia-reorganizacion.md](docs/guia-reorganizacion.md) | Cómo actualizar tu copia local tras la reorganización en `backend/` y `frontend/` |
| [docs/memoria-modulos.md](docs/memoria-modulos.md) | Módulos implementados en E3–E4, endpoints, seed, tests y demo |
| [backend/README.md](backend/README.md) | Cómo añadir un endpoint |
| [frontend/README.md](frontend/README.md) | Frontend: estructura, scripts y cómo añadir una sección |

## Tests

Cada implementación nueva debe llevar sus tests y ejecutarlos antes de hacer commit ([AGENTS.md](AGENTS.md)).

```bash
# API (PHPUnit)
docker compose exec php vendor/bin/phpunit

# Frontend (Vitest + Testing Library), lint, tipos y build
cd frontend
npm test
npm run lint
npm run typecheck
npm run build
```

## Git y ramas

Repositorio: [adrirosel/web-proyect-IES-Ramon-Arcas](https://github.com/adrirosel/web-proyect-IES-Ramon-Arcas).

- Cada implementación se desarrolla en una rama `<nombre-integrante>-<nombre-de-la-implementacion>`.
- Los conflictos se resuelven en esa rama.
- Solo se integra en `main` cuando el trabajo de la rama está terminado.

## Producción (notas)

- Comprobar versión PHP/MariaDB del hosting y documentar desviaciones respecto a Docker.
- `SESSION_SECURE=true` detrás de HTTPS; rotar `ADMIN_PASSWORD`; no usar el seed de desarrollo.
- Backups de MariaDB + volumen de `backend/storage/uploads`.
