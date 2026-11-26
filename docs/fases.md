# Fases y roadmap

## Hitos de implementación

| Hito | Contenido | Estado |
|---|---|---|
| H1 | Docker, migraciones, router, health, OpenAPI base, docs | Hecho |
| H2 | Auth, CSRF, RBAC, usuarios, rate limit | Hecho |
| H3 | Archivos, documentos, páginas, menús, noticias (recorrido API) | Hecho |
| H4 | Enseñanzas, optativas, departamentos, personas/órganos, programas | Hecho |
| H5 API | Eventos, avisos, servicios, contactos, OpenAPI completo | Hecho |
| H5 front | Scaffold React + Vite + TypeScript del sitio público, servido por Nginx | Hecho (E2) |
| H6 front | Secciones restantes del sitio público y panel admin | Hecho (E3–E4) |

## Entregas de la web pública

Detalle y reparto en [proyecto-intermodular.md](proyecto-intermodular.md).

| Entrega | Contenido | Estado |
|---|---|---|
| E1 | API H1–H5 + OpenAPI + documentación (tag `Entrega1`) | Hecha |
| E2 | Frontend: identidad, menú responsive, Inicio + eventos, departamentos, historia, órganos, contacto; seed de demostración; tests PHPUnit + Vitest | En curso |
| E3 | Enseñanzas, Programas, Familias, documentos, horarios y calendario | Hecha |
| E4 | Noticias, Secretaría, panel admin, revisión WCAG, capturas | Hecha (sin `sitemap.xml`, fuera de v1) |

Cada entrega se cierra con todos los tests en verde y un tag `EntregaN` sobre `main`.

## Fuera de v1 (no van en `backend/openapi.yaml` paths)

- Preinscripciones / admisión tramitada
- Reservas de cita previa estructuradas
- Búsqueda global
- Galerías dedicadas
- Export iCalendar
- Auditoría avanzada consultable
- FAQ como recurso propio
- `sitemap.xml` y auditoría WCAG (con el front, E4)

Cuando se necesiten, se documentan aquí y luego se añaden al OpenAPI **al implementarlos**.
