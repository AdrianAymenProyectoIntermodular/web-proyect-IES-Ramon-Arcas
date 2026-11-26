# Proyecto intermodular — contexto de la web pública

Extracto de la memoria técnica del Proyecto Intermodular DAW (curso 2026/2027) **solo para el Proyecto 2: web pública del centro**. La intranet docente es un producto hermano con repositorio, base de datos y sesión propios; aquí solo se documenta lo necesario para no mezclarlos.

## Qué pide la memoria para la web

| Apartado | Requisito | Dónde se cumple |
|---|---|---|
| §6.2 Mapa del sitio | Inicio, Organización, Familias, Enseñanzas, Programas, Secretaría, Noticias, Contacto | Menú `principal` del seed (`App\Seed\DemoContent::menuPrincipal()`) y `frontend/src/lib/navigation.ts` |
| §6.3 Modelo | Menú separado del contenido, documentos reutilizables, personas + órganos + pertenencias | [modelo-datos.md](modelo-datos.md) |
| §6.4 Stack | Backend PHP sin framework + MariaDB, frontend TypeScript, backoffice de contenidos | `backend/` (PHP 8.3), `frontend/` (React + Vite + TS), panel admin pendiente (E4) |
| §7 Independencia | Sin BD ni sesión compartidas con la intranet; solo un enlace | Clave pública `intranet_url` en `configuracion` (botón «Acceso intranet») |
| §3.2 Datos | Sin datos personales reales, credenciales ni claves en el repo; licencia libre recomendada (MIT); commits con sentido | Personas ficticias, correos `@iesramonarcas.example`, secretos solo en `.env` |
| §8.2 Entrega | README con instrucciones y capturas, repositorio público, memoria de módulo | README raíz y `frontend/README.md`; capturas pendientes (E4) |

Las fases 1–4 de la memoria (§5.14) son de la **intranet**. La web usa su propio calendario de entregas (abajo).

## Entregas de la web

| Entrega | Contenido | Estado |
|---|---|---|
| **E1** | Docker, migraciones, API REST `/api/v1`, OpenAPI, auth admin + CSRF + RBAC | Hecha (tag `Entrega1`) |
| **E2** | Frontend `frontend/`: identidad visual, menú con desplegables + hamburguesa, Inicio con agenda de eventos, Departamentos (rejilla + ficha), Historia real, Quiénes somos, órganos, Contacto (`POST /contacto`), seed de demostración, Nginx sirviendo el SPA, tests PHPUnit + Vitest | En curso (rama `Adrian-scaffold-frontend`) |
| **E3** | Enseñanzas (ESO, Bachillerato, FP, optativas), Programas por categoría, Familias, documentos institucionales, horarios y calendario | Pendiente |
| **E4** | Noticias (listado + detalle), Secretaría, panel admin (login CSRF + CRUD), `sitemap.xml`, revisión WCAG, capturas en README | Pendiente |

## Decisiones del frontend (E2)

- **Stack:** React 19 + TypeScript (strict) + Vite + React Router; animaciones con `motion` respetando `prefers-reduced-motion`; Markdown con `react-markdown` sin HTML crudo.
- **Identidad:** blanco + naranja corporativo `#ff6900`, estilo Material (elevaciones, radios, foco visible). El texto sobre naranja es oscuro (`#1a1a1a`, 5.7:1) y los enlaces naranjas usan `#b34700` (5.5:1): blanco sobre `#ff6900` no cumple WCAG AA (2.9:1).
- **Logos** (`frontend/public/brand/`): `logo-horizontal.png` en cabecera de escritorio, `logo-icon.png` en móvil y favicon, `logo-stacked.png` en el pie.
- **Sin Google Fonts** (RGPD): pila de fuentes del sistema.
- **Animaciones** inspiradas en [um.es](https://www.um.es/): títulos con tipografía cinética por palabras, aparición al hacer scroll, sol del logo que gira con el scroll, tarjetas que se rellenan de naranja.
- **Datos:** todo sale de la API pública. Si `GET /menus/principal` falla, el menú usa `FALLBACK_NAVIGATION`, que un fixture compartido (`shared/fixtures/menu-principal.json`) mantiene idéntico al seed en PHPUnit y Vitest.
- **Rutas pendientes:** cada sección del menú aún sin implementar está en `PENDING_SECTIONS` (`frontend/src/routes.tsx`) y muestra «en preparación», así ningún enlace del menú da 404.

## Ubicación: Lorca

Los logos, la web oficial y las fuentes históricas sitúan el centro en **Lorca** (Avenida Juan Carlos I). La memoria §6.2 y la primera versión del seed decían Totana: se ha corregido a Lorca en seed, README y frontend.

## Historia del centro (contenido real)

La página `historia` es el único contenido real del seed; todo lo demás (personas, eventos, presentaciones de departamentos) es ficticio. Hitos y fuentes:

- 1933: se crea la Escuela Elemental de Trabajo de Lorca (Electricidad y Mecánica, Madera, Albañilería y Construcción, Tipografía, Vestido).
- 1956: traslado al edificio de Miguel Fisac (con Daniel Carbonell) como Escuela de Maestría Industrial, referencia de FP para Murcia, Almería y Granada.
- Finales de los 80: la FP se traslada al barrio de San Antonio (hoy IES San Juan Bosco). 1990: nace en el edificio de Fisac el IES Ramón Arcas Meca.
- 11 de mayo de 2011: los terremotos dañan el edificio, que se demuele; el nuevo edificio evoca el original y conserva el mural de piedra de la entrada.
- 2015: XXV aniversario, con exposiciones y conferencias sobre el centro y Fisac.

Fuentes:
- [IES San Juan Bosco — Historia del centro](https://www.iessanjuanbosco.es/index.php/centro/historia-del-centro)
- [Alberca nº 14 — «Miguel Fisac y su arquitectura en la Región de Murcia»](http://www.amigosdelmuseoarqueologicodelorca.com/alberca/pdf/alberca14/16_14.pdf)
- [La Verdad (2014) — «El IES Ramón Arcas repasa los 58 años del viejo edificio»](https://www.laverdad.es/murcia/lorca/201410/30/ramon-arcas-repasa-anos-20141030013037-v.html)
- [La Verdad (2011) — «La fachada principal del IES Ramón Arcas será demolida»](https://www.laverdad.es/murcia/v/20110908/lorca/fachada-principal-ramon-arcas-20110908.html)
- [Mi Periódico Digital (2020) — «Los primeros centros de FP en la Región de Murcia»](https://www.miperiodicodigital.com/2020/grupos/palomamensajeradigital-230/los-primeros-centros-fp-region-murcia-3522.html)

## Reparto del trabajo (E3–E4)

Cada integrante trabaja en ramas `<Nombre>-<implementacion>` y solo integra en `main` con el módulo terminado y los tests en verde.

| Módulo | Recursos API | Responsable |
|---|---|---|
| Layout, identidad, Inicio, eventos, departamentos, historia, órganos, contacto | `configuracion`, `menus`, `eventos`, `departamentos`, `organos`, `paginas`, `contacto` | Adrián (E2) |
| Noticias: listado paginado + detalle | `noticias` | Compañero |
| Enseñanzas: ESO, Bachillerato, FP, optativas | `ensenanzas`, `materias-optativas`, `ofertas-optativas` | Compañero |
| Programas: hub por categoría + ficha (y seed de programas) | `programas` | Compañero |
| Familias y Secretaría: páginas y documentos | `paginas`, `documentos`, `enlaces` | Compañero |
| Panel admin mínimo: login CSRF + CRUD de noticias y documentos | `/admin/*` | Compañero |
| Memoria del módulo y capturas del README | — | Compañero |
| Accesibilidad WCAG, SEO (`sitemap.xml`), pulido de animaciones | — | Adrián |

Contrato común:
- Reutilizar tokens (`frontend/src/styles/tokens.css`) y componentes (`PageHeader`, `AsyncState`, `Reveal`, `PersonList`…); no crear estilos de marca paralelos.
- Al implementar una sección: quitarla de `PENDING_SECTIONS` y añadir su ruta en `frontend/src/routes.tsx` (página diferida en `frontend/src/pages/lazyPages.ts`).
- Si un endpoint cambia, actualizar `backend/openapi.yaml` en el mismo commit.
- No tocar `App\Auth` ni RBAC sin acordarlo.
- **Tests obligatorios** con cada implementación (ver [AGENTS.md](../AGENTS.md)).
