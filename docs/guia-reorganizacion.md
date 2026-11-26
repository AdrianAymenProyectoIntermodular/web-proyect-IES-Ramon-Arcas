# Guía: actualizar tu copia local tras la reorganización de carpetas

La rama `Aymen-reorganizacionCarpetas` separa el repositorio en una parte para cada cosa. **No cambia el comportamiento** de la API ni de la web: solo dónde está cada archivo. Los tests (PHPUnit y Vitest) siguen siendo los mismos y pasan en verde.

## Qué ha cambiado

| Antes | Ahora | Por qué |
|---|---|---|
| `api/` | `backend/` | Nombre explícito de la parte servidor |
| `web/` | `frontend/` | Nombre explícito de la parte cliente |
| `openapi.yaml` (raíz) | `backend/openapi.yaml` | Es el contrato de la API: pertenece al backend |
| `docker/php/Dockerfile` | `backend/Dockerfile` | Imagen del backend, junto a su código |
| `docker/nginx/default.conf` | `infra/nginx/default.conf` | Sirve las dos partes: infraestructura común |
| `api/tests/fixtures/menu-principal.json` | `shared/fixtures/menu-principal.json` | Lo usan PHPUnit y Vitest; el front ya no lee carpetas del backend |
| `api/src/Seed/DemoContent.php` | `backend/database/seed/DemoContent.php` | Datos de demostración fuera del código de producción (mismo namespace `App\Seed`) |
| `web/src/pages/admin/*`, `web/src/context/AdminSessionContext.tsx`, `web/src/api/admin.ts` | `frontend/src/admin/` (`pages/`, `context/`, `api/`, `AdminLayout`, `AdminRoot`, `lazyPages.ts`, `admin.test.tsx`) | Panel admin separado del sitio público |
| `web/src/pages/*.tsx` (todo en un nivel) | `frontend/src/pages/<seccion>/` | Páginas agrupadas por sección: `inicio`, `organizacion`, `ensenanzas`, `programas`, `noticias`, `contacto`, `comunes` |
| `web/src/pages/catalog.module.css` | `frontend/src/styles/catalog.module.css` | Lo usan varias páginas y `DocumentosPanel` |
| CI: solo PHPUnit | CI: jobs `backend` y `frontend` (lint, typecheck, test, build) | Las comprobaciones de AGENTS.md también corren en GitHub |

Se quedan en la raíz: `docker-compose.yml`, `.env.example`, `.env` (tu copia local), `docs/`, `.github/`, `README.md` y `AGENTS.md`.

## 1. Antes de actualizar

1. Guarda tu trabajo pendiente (commit en tu rama o `git stash`). `git status` debe salir limpio.
2. Para los contenedores. Sin `-v`: así se conserva la base de datos.

```bash
docker compose down
```

## 2. Traer la rama reorganizada

```bash
git fetch origin
```

```bash
git switch Aymen-reorganizacionCarpetas
```

```bash
git pull
```

Cuando se integre en `main`, haz lo mismo con `main`.

## 3. Limpiar las carpetas antiguas

Git mueve los archivos versionados, pero `api/` y `web/` pueden seguir existiendo en tu disco con lo que Git ignora (`vendor/`, `node_modules/`, `dist/`, `storage/uploads/`, `.phpunit.cache/`).

1. Si tenías archivos subidos en local, muévelos antes de borrar:

```bash
mv api/storage/uploads/* backend/storage/uploads/ 2>/dev/null
```

2. Comprueba que en `api/` y `web/` solo quedan dependencias y builds (no código tuyo sin commit):

```bash
git status --ignored api web
```

3. Bórralas:

```bash
rm -rf api web docker
```

En Windows (PowerShell): `Remove-Item -Recurse -Force api, web, docker`.

## 4. Reinstalar y arrancar

`.env` sigue en la raíz; si no lo tienes, cópialo:

```bash
cp .env.example .env
```

`--build` es necesario la primera vez porque la imagen PHP se construye ahora desde `backend/`:

```bash
docker compose up -d --build
```

```bash
docker compose exec php composer install
```

```bash
docker compose exec php php bin/migrate.php
```

```bash
docker compose exec php php bin/seed.php
```

Frontend:

```bash
cd frontend && npm install && npm run build
```

## 5. Comprobar que todo funciona

```bash
docker compose exec php vendor/bin/phpunit
```

```bash
cd frontend && npm test && npm run lint && npm run typecheck
```

- Web: <http://localhost:8088/>
- API: <http://localhost:8088/api/v1/health>
- Desarrollo del front: `cd frontend && npm run dev` → <http://localhost:5173>

En el editor, abre de nuevo el proyecto: las rutas `api/` y `web/` ya no existen.

## 6. Si tienes una rama propia con cambios anteriores

```bash
git switch <tu-rama>
```

```bash
git merge origin/Aymen-reorganizacionCarpetas
```

(o `origin/main` cuando ya esté integrada). Git detecta los renombrados y lleva tus cambios a la ruta nueva casi siempre. Después:

- Si te queda algún archivo nuevo en `api/` o `web/`, muévelo con `git mv` a su sitio según la tabla de arriba.
- Si añadiste una página en `web/src/pages/`, muévela a la carpeta de su sección y corrige sus imports relativos (un nivel más: `../../api/...` en lugar de `../api/...`).
- Si tocaste el panel admin, tu código está ahora en `frontend/src/admin/`.
- Pasa los tests (paso 5) antes del commit del merge.

## 7. Cambios en el día a día

| Antes | Ahora |
|---|---|
| `cd api` | `cd backend` |
| `cd web` | `cd frontend` |
| Editar `openapi.yaml` | Editar `backend/openapi.yaml` |
| `php api/bin/menu-fixture.php` | `php backend/bin/menu-fixture.php` (escribe en `shared/fixtures/`) |
| Nueva página en `web/src/pages/` | Nueva página en `frontend/src/pages/<seccion>/` |
| Pantalla admin en `web/src/pages/admin/` | Pantalla admin en `frontend/src/admin/pages/` |

Regla general: cada archivo vive en la parte a la que pertenece (`backend/` o `frontend/`). Lo que usan las dos va en `shared/` (datos) o `infra/` (servidor web).
