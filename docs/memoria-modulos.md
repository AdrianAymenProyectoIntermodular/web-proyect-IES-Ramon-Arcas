# Memoria de módulos implementados (E3–E4)

Rama: `Aymen-modulos-frontend`. Implementa las secciones públicas restantes y el panel mínimo de administración.

## 1. Módulos públicos

| Sección | Ruta | Recursos API |
|---|---|---|
| Noticias (listado paginado) | `/noticias` | `GET /noticias?page&limit&sort=publicado_en&direction=desc` |
| Noticia (detalle) | `/noticias/:slug` | `GET /noticias/{slug}` |
| ESO / Bachillerato | `/ensenanzas/eso`, `/ensenanzas/bachillerato` | `GET /ensenanzas/{slug}`, `/ensenanzas/{slug}/modulos`, `/documentos?ensenanza_id` |
| Formación Profesional | `/ensenanzas/fp` | `GET /ensenanzas?tipo=fp` |
| Ciclo FP | `/ensenanzas/:slug` | Igual que ESO |
| Materias optativas | `/ensenanzas/optativas` | `GET /materias-optativas`, `/ofertas-optativas`, `/ensenanzas` |
| Programas (hub) | `/programas` | `GET /programas?limit=50` |
| Programa | `/programas/:slug` | `GET /programas/{slug}` |
| Documentos institucionales | `/organizacion/documentos` | `GET /documentos`, `/enlaces`, `/categorias-documentos` |
| Horarios / Calendario | `/organizacion/horarios`, `/organizacion/calendario` | `GET /paginas/{slug}` + panel de documentos |
| Documentos familias | `/familias/documentos` | Igual, categorías `familias`, enlaces `plataformas` + `familias` |
| Páginas editoriales | `/familias/*`, `/secretaria/*` | `GET /paginas/{slug}` + panel opcional de documentos/enlaces |

`PENDING_SECTIONS` queda vacío: todos los enlaces del menú resuelven a una ruta real.

## 2. Panel de administración

Rutas fuera del layout público (`/admin`):

- `/admin/login`: login con CSRF previo (`GET /admin/csrf`, `POST /admin/login`).
- `/admin/noticias`: listar, crear (slug generado del título), editar, publicar/despublicar y archivar.
- `/admin/documentos`: listar, subir PDF (`POST /admin/archivos`), crear documento por categoría, editar y archivar.

La sesión se guarda en cookie httpOnly; el token CSRF vive en memoria (`AdminSessionContext`). Los componentes usan `apiPatch`, `apiPut`, `apiDelete` y `apiUpload` añadidos a `web/src/api/client.ts`.

## 3. Contenido de demostración (seed)

`api/src/Seed/DemoContent.php` incorpora:

- 12 noticias con fechas relativas para que el listado pagine.
- ESO, Bachillerato y 4 ciclos de FP con módulos profesionales.
- 6 materias optativas y 10 ofertas por enseñanza/nivel/curso.
- 10 programas (rango 8–12) repartidos entre `educativo`, `plan_centro`, `actividad` y `otro`, con departamentos vinculados.
- 8 páginas editoriales, 6 documentos reutilizables y 8 enlaces externos.
- 6 PDFs mínimos en `api/database/seed-files/` que el seed copia a `storage/uploads`.

El seed es idempotente (upsert por clave natural) y todo el contenido ficticio usa `@iesramonarcas.example`.

## 4. Tests

- PHPUnit: `api/tests/Seed/DemoContentTest.php` ampliado (programas 8–12, slugs únicos, enums, límites de columnas, referencias cruzadas, PDFs válidos, menú intacto frente a `menu-principal.json`).
- Vitest: `web/src/pages/modules.test.tsx` cubre carga, vacío, error, 404, paginación, enlaces y panel admin (login, redirección, CSRF 403).

Verificación ejecutada: `npm test` (237 tests), `npm run lint`, `npm run typecheck`, `npm run build`, `vendor/bin/phpunit` (45 tests).

## 5. Demo local

```powershell
Copy-Item .env.example .env
docker compose up -d --build
docker compose exec php composer install
docker compose exec php php bin/migrate.php
docker compose exec php php bin/seed.php
cd web; npm install; npm run dev
```

Abrir `http://localhost:5173`. Requiere Docker Desktop (WSL2).

## 6. Capturas

Pendientes de tomar con la demo levantada (escritorio y móvil) para:
- Inicio, Noticias (listado y detalle), Enseñanzas (ESO, FP), Programas, Familias/Secretaría, panel admin.

Se guardarán en `docs/capturas/` y se enlazarán desde el README.
