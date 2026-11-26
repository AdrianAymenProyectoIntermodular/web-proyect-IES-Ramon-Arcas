<?php

declare(strict_types=1);

namespace Tests\Seed;

use App\Seed\DemoContent;
use DateTimeImmutable;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;

final class DemoContentTest extends TestCase
{
    private const SLUG_PATTERN = '/^[a-z0-9]+(?:-[a-z0-9]+)*$/';

    // --- Departamentos ---

    public function testDepartamentosHaveUniqueValidSlugs(): void
    {
        $slugs = array_column(DemoContent::departamentos(), 'slug');
        $this->assertNotEmpty($slugs);
        $this->assertSame($slugs, array_values(array_unique($slugs)));
        foreach ($slugs as $slug) {
            $this->assertMatchesRegularExpression(self::SLUG_PATTERN, $slug);
            $this->assertLessThanOrEqual(160, strlen($slug));
        }
    }

    public function testDepartamentosRespectSchemaAndOrder(): void
    {
        foreach (DemoContent::departamentos() as $i => $d) {
            $this->assertSame($i + 1, $d['orden'], 'orden consecutivo para el grid');
            $this->assertNotSame('', trim($d['nombre_es']));
            $this->assertNotSame('', trim($d['nombre_en']));
            $this->assertLessThanOrEqual(200, mb_strlen($d['nombre_es']));
            $this->assertNotSame('', trim($d['presentacion_es']));
            $this->assertLessThanOrEqual(255, strlen($d['contacto_publico']));
            $this->assertStringEndsWith('.example', $d['contacto_publico'], 'dominio reservado: nunca correos reales');
        }
    }

    public function testDepartamentosCoverSecondaryAndVocationalTraining(): void
    {
        $slugs = array_column(DemoContent::departamentos(), 'slug');
        foreach (['matematicas', 'lengua', 'ingles', 'informatica', 'orientacion'] as $esperado) {
            $this->assertContains($esperado, $slugs);
        }
    }

    // --- Personas y pertenencias ---

    public function testPersonasHaveUniqueIdsAndNames(): void
    {
        $personas = DemoContent::personas();
        $ids = array_column($personas, 'id');
        $nombres = array_column($personas, 'nombre');
        $this->assertSame($ids, array_values(array_unique($ids)));
        $this->assertSame($nombres, array_values(array_unique($nombres)));
        foreach ($personas as $p) {
            $this->assertGreaterThan(0, $p['id']);
            $this->assertLessThanOrEqual(160, mb_strlen($p['nombre']));
            $this->assertStringContainsString('ficticio', $p['biografia_es']);
        }
    }

    public function testPersonasDoNotExposeContactData(): void
    {
        foreach (DemoContent::personas() as $p) {
            $this->assertSame(['id', 'nombre', 'biografia_es'], array_keys($p));
            $this->assertDoesNotMatchRegularExpression('/@|\+?\d{9}/', $p['nombre'] . $p['biografia_es']);
        }
    }

    public function testEveryDepartamentoHasExactlyOneJefatura(): void
    {
        $jefaturas = [];
        foreach (DemoContent::pertenencias() as $p) {
            if ($p['cargo_es'] === 'Jefatura de departamento') {
                $jefaturas[$p['departamento_slug']] = ($jefaturas[$p['departamento_slug']] ?? 0) + 1;
            }
        }
        foreach (array_column(DemoContent::departamentos(), 'slug') as $slug) {
            $this->assertSame(1, $jefaturas[$slug] ?? 0, "jefatura de $slug");
        }
    }

    public function testPertenenciasReferenceExistingRowsWithoutDuplicates(): void
    {
        $personaIds = array_column(DemoContent::personas(), 'id');
        $depSlugs = array_column(DemoContent::departamentos(), 'slug');
        $claves = [];
        foreach (DemoContent::pertenencias() as $p) {
            $this->assertContains($p['persona_id'], $personaIds);
            $this->assertContains($p['departamento_slug'], $depSlugs);
            $clave = $p['persona_id'] . ':' . $p['departamento_slug'];
            $this->assertNotContains($clave, $claves, 'PK (persona_id, departamento_id) duplicada');
            $claves[] = $clave;
        }
    }

    // --- Órganos ---

    public function testOrganosUseSchemaTipos(): void
    {
        $tiposValidos = ['equipo_directivo', 'consejo_escolar', 'claustro', 'ccp', 'otro'];
        $slugs = [];
        foreach (DemoContent::organos() as $o) {
            $this->assertContains($o['tipo'], $tiposValidos);
            $this->assertMatchesRegularExpression(self::SLUG_PATTERN, $o['slug']);
            $slugs[] = $o['slug'];
        }
        $this->assertSame($slugs, array_values(array_unique($slugs)));
    }

    public function testEveryOrganoHasMembersThatExist(): void
    {
        $personaIds = array_column(DemoContent::personas(), 'id');
        $porOrgano = [];
        foreach (DemoContent::miembros() as $m) {
            $this->assertContains($m['persona_id'], $personaIds);
            $this->assertNotSame('', trim($m['cargo_es']));
            $this->assertLessThanOrEqual(160, mb_strlen($m['cargo_es']));
            $porOrgano[$m['organo_slug']][] = $m['persona_id'];
        }
        foreach (array_column(DemoContent::organos(), 'slug') as $slug) {
            $this->assertNotEmpty($porOrgano[$slug] ?? [], "miembros de $slug");
            $this->assertSame($porOrgano[$slug], array_values(array_unique($porOrgano[$slug])), "persona repetida en $slug");
        }
    }

    public function testEquipoDirectivoHasDireccionJefaturaYSecretaria(): void
    {
        $cargos = array_column(
            array_filter(DemoContent::miembros(), fn ($m) => $m['organo_slug'] === 'equipo-directivo'),
            'cargo_es'
        );
        foreach (['Dirección', 'Jefatura de estudios', 'Secretaría'] as $cargo) {
            $this->assertContains($cargo, $cargos);
        }
    }

    public function testClaustroIncludesAllPersonas(): void
    {
        $claustro = array_column(
            array_filter(DemoContent::miembros(), fn ($m) => $m['organo_slug'] === 'claustro'),
            'persona_id'
        );
        $this->assertEqualsCanonicalizing(array_column(DemoContent::personas(), 'id'), $claustro);
    }

    // --- Eventos ---

    public static function referenceDates(): array
    {
        return [
            'inicio de curso' => ['2026-09-01 08:00:00'],
            'fin de año (cruce de año)' => ['2026-12-28 23:59:00'],
            'febrero bisiesto' => ['2028-02-27 12:00:00'],
        ];
    }

    #[DataProvider('referenceDates')]
    public function testEventosAreRelativeToReferenceDate(string $reference): void
    {
        $now = new DateTimeImmutable($reference);
        $hoy = $now->setTime(0, 0);
        $futuros = 0;
        foreach (DemoContent::eventos($now) as $e) {
            $inicio = DateTimeImmutable::createFromFormat('Y-m-d H:i:s', $e['inicio']);
            $fin = DateTimeImmutable::createFromFormat('Y-m-d H:i:s', $e['fin']);
            $this->assertNotFalse($inicio, 'formato DATETIME de MariaDB');
            $this->assertNotFalse($fin);
            $this->assertGreaterThan($inicio, $fin, "fin > inicio en {$e['slug']}");
            $this->assertSame($inicio->format('Y-m-d'), $fin->format('Y-m-d'), 'eventos de un solo día');
            if ($inicio >= $hoy) {
                $futuros++;
            }
        }
        $this->assertGreaterThanOrEqual(6, $futuros, 'el panel de portada necesita próximos eventos');
    }

    public function testEventosIncludeOnePastEventToExerciseDateFilter(): void
    {
        $now = new DateTimeImmutable('2026-11-16 10:00:00');
        $pasados = array_filter(
            DemoContent::eventos($now),
            fn ($e) => new DateTimeImmutable($e['inicio']) < $now->setTime(0, 0)
        );
        $this->assertCount(1, $pasados);
    }

    public function testEventosAreDeterministicForSameReference(): void
    {
        $now = new DateTimeImmutable('2026-11-16 10:00:00');
        $this->assertSame(DemoContent::eventos($now), DemoContent::eventos($now));
    }

    public function testEventosHaveUniqueSlugsAndRequiredFields(): void
    {
        $eventos = DemoContent::eventos(new DateTimeImmutable('2026-11-16'));
        $slugs = array_column($eventos, 'slug');
        $this->assertSame($slugs, array_values(array_unique($slugs)));
        foreach ($eventos as $e) {
            $this->assertMatchesRegularExpression(self::SLUG_PATTERN, $e['slug']);
            foreach (['titulo_es', 'tipo', 'descripcion_es', 'lugar', 'destinatarios'] as $campo) {
                $this->assertNotSame('', trim($e[$campo]), "$campo en {$e['slug']}");
            }
            $this->assertLessThanOrEqual(200, mb_strlen($e['titulo_es']));
            $this->assertLessThanOrEqual(80, mb_strlen($e['tipo']));
            $this->assertLessThanOrEqual(200, mb_strlen($e['lugar']));
            $this->assertLessThanOrEqual(120, mb_strlen($e['destinatarios']));
        }
    }

    // --- Historia ---

    public function testHistoriaContainsVerifiedMilestones(): void
    {
        $historia = DemoContent::historia();
        $this->assertSame('historia', $historia['slug']);
        $texto = implode("\n", $historia['bloques']);
        foreach (['1933', '1956', 'Miguel Fisac', '1990', '2011', '2015'] as $hito) {
            $this->assertStringContainsString($hito, $texto);
        }
    }

    public function testHistoriaBlocksAreMarkdownWithHeadingAndNoHtml(): void
    {
        foreach (DemoContent::historia()['bloques'] as $bloque) {
            $this->assertStringStartsWith('## ', $bloque);
            $this->assertDoesNotMatchRegularExpression('/<[a-z\/!]/i', $bloque);
            $this->assertJson(json_encode(['markdown_es' => $bloque], JSON_THROW_ON_ERROR));
        }
    }

    // --- Menú ---

    public function testMenuFollowsMemoriaSections(): void
    {
        $titulos = array_column(DemoContent::menuPrincipal(), 'titulo_es');
        $this->assertSame(
            ['Inicio', 'Organización', 'Familias', 'Enseñanzas', 'Secretaría', 'Programas', 'Noticias', 'Contacto'],
            $titulos
        );
    }

    public function testMenuIsTwoLevelsWithInternalUrls(): void
    {
        foreach (DemoContent::menuPrincipal() as $item) {
            $this->assertStringStartsWith('/', $item['url']);
            $this->assertLessThanOrEqual(160, mb_strlen($item['titulo_es']));
            foreach ($item['children'] ?? [] as $hijo) {
                $this->assertArrayNotHasKey('children', $hijo, 'el menú solo tiene dos niveles');
                $this->assertStringStartsWith('/', $hijo['url']);
                $this->assertNotSame('', trim($hijo['titulo_en']));
                $this->assertLessThanOrEqual(160, mb_strlen($hijo['titulo_es']));
            }
        }
    }

    public function testMenuLeafUrlsAreUnique(): void
    {
        $hojas = [];
        foreach (DemoContent::menuPrincipal() as $item) {
            if (empty($item['children'])) {
                $hojas[] = $item['url'];
                continue;
            }
            foreach ($item['children'] as $hijo) {
                $hojas[] = $hijo['url'];
            }
        }
        $this->assertSame($hojas, array_values(array_unique($hojas)));
    }

    public function testMenuLinksToOrganosAndDepartamentosThatExist(): void
    {
        $organos = array_column(DemoContent::organos(), 'slug');
        $organizacion = array_values(array_filter(DemoContent::menuPrincipal(), fn ($i) => $i['url'] === '/organizacion'))[0];
        $urls = array_column($organizacion['children'], 'url');
        $this->assertContains('/organizacion/departamentos', $urls);
        $this->assertContains('/organizacion/historia', $urls);
        foreach ($urls as $url) {
            if (preg_match('#^/organizacion/organos/(.+)$#', $url, $m)) {
                $this->assertContains($m[1], $organos);
            }
        }
    }

    /** El front usa el mismo fixture para su menú de respaldo (frontend/src/lib/navigation.test.ts). */
    public function testMenuMatchesSharedFixture(): void
    {
        $fixture = json_decode(
            (string) file_get_contents(__DIR__ . '/../../../shared/fixtures/menu-principal.json'),
            true,
            512,
            JSON_THROW_ON_ERROR
        );
        $this->assertSame($fixture, DemoContent::menuPrincipal());
    }

    // --- Noticias ---

    public function testNoticiasHaveUniqueSlugsAndVisibleDates(): void
    {
        $now = new DateTimeImmutable('2026-11-25 10:00:00');
        $noticias = DemoContent::noticias($now);
        $this->assertGreaterThan(6, count($noticias), 'el listado debe paginar con page size 6');
        $slugs = array_column($noticias, 'slug');
        $this->assertSame($slugs, array_values(array_unique($slugs)));

        foreach ($noticias as $n) {
            $this->assertMatchesRegularExpression(self::SLUG_PATTERN, $n['slug']);
            $this->assertLessThanOrEqual(200, mb_strlen($n['titulo_es']));
            $this->assertNotSame('', trim($n['resumen_es']));
            $this->assertNotSame('', trim($n['cuerpo_es']));
            $this->assertContains($n['destacado'], [0, 1]);
            $this->assertNotSame('', trim($n['categoria']));

            $publicado = DateTimeImmutable::createFromFormat('Y-m-d H:i:s', $n['publicado_en']);
            $this->assertNotFalse($publicado, 'publicado_en en formato DATETIME');
            $this->assertLessThanOrEqual($now, $publicado, 'una noticia futura no sería visible');
            $this->assertDoesNotMatchRegularExpression('/<[a-z\/!]/i', $n['cuerpo_es'], 'Markdown sin HTML');
        }
    }

    public function testNoticiasAreDeterministicAndPaginate(): void
    {
        $now = new DateTimeImmutable('2026-11-25 10:00:00');
        $this->assertSame(DemoContent::noticias($now), DemoContent::noticias($now));
        $this->assertCount(6, array_slice(DemoContent::noticias($now), 6), 'hay una segunda página completa');
    }

    // --- Enseñanzas y optativas ---

    public function testEnsenanzasCoverEsoBachilleratoAndFp(): void
    {
        $tipos = array_column(DemoContent::ensenanzas(), 'tipo');
        foreach (['eso', 'bachillerato', 'fp'] as $tipo) {
            $this->assertContains($tipo, $tipos);
        }
        $slugs = array_column(DemoContent::ensenanzas(), 'slug');
        $this->assertSame($slugs, array_values(array_unique($slugs)));
        $this->assertContains('eso', $slugs);
        $this->assertContains('bachillerato', $slugs);
    }

    public function testEnsenanzasRespectSchemaAndOrder(): void
    {
        foreach (DemoContent::ensenanzas() as $i => $e) {
            $this->assertSame($i + 1, $e['orden'], 'orden consecutivo para el listado');
            $this->assertContains($e['tipo'], ['eso', 'bachillerato', 'fp', 'otro']);
            $this->assertMatchesRegularExpression(self::SLUG_PATTERN, $e['slug']);
            $this->assertLessThanOrEqual(200, mb_strlen($e['titulo_es']));
            $this->assertLessThanOrEqual(120, mb_strlen($e['duracion_es']));
            foreach (['requisitos_es', 'duracion_es', 'salidas_es'] as $campo) {
                $this->assertNotSame('', trim($e[$campo]), "$campo en {$e['slug']}");
            }
        }
    }

    public function testModulosReferenceExistingEnsenanzas(): void
    {
        $slugs = array_column(DemoContent::ensenanzas(), 'slug');
        $porEnsenanza = [];
        foreach (DemoContent::modulos() as $m) {
            $this->assertContains($m['ensenanza_slug'], $slugs);
            $this->assertGreaterThan(0, $m['horas']);
            $this->assertNotSame('', trim($m['nombre_es']));
            $porEnsenanza[$m['ensenanza_slug']][] = $m['orden'];
        }
        foreach ($porEnsenanza as $slug => $ordenes) {
            $this->assertSame(range(1, count($ordenes)), $ordenes, "orden de módulos en $slug");
        }
    }

    public function testOptativasReferenceExistingRows(): void
    {
        $materias = array_column(DemoContent::materiasOptativas(), 'slug');
        $this->assertSame($materias, array_values(array_unique($materias)));
        $ensenanzas = array_column(DemoContent::ensenanzas(), 'slug');

        $claves = [];
        foreach (DemoContent::ofertasOptativas() as $o) {
            $this->assertContains($o['materia_slug'], $materias);
            $this->assertContains($o['ensenanza_slug'], $ensenanzas);
            $this->assertNotSame('', trim($o['nivel']));
            $clave = implode(':', $o);
            $this->assertNotContains($clave, $claves, 'oferta duplicada');
            $claves[] = $clave;
        }
    }

    // --- Programas ---

    public function testProgramasAreBetweenEightAndTwelve(): void
    {
        $programas = DemoContent::programas();
        $this->assertGreaterThanOrEqual(8, count($programas));
        $this->assertLessThanOrEqual(12, count($programas));
    }

    public function testProgramasHaveValidCategoriesAndDepartamentos(): void
    {
        $depSlugs = array_column(DemoContent::departamentos(), 'slug');
        $slugs = [];
        foreach (DemoContent::programas() as $p) {
            $this->assertMatchesRegularExpression(self::SLUG_PATTERN, $p['slug']);
            $this->assertContains($p['categoria'], ['educativo', 'plan_centro', 'actividad', 'otro']);
            $this->assertLessThanOrEqual(200, mb_strlen($p['titulo_es']));
            $this->assertNotSame('', trim($p['descripcion_es']));
            $this->assertNotEmpty($p['departamentos'], "{$p['slug']} sin departamentos");
            foreach ($p['departamentos'] as $depSlug) {
                $this->assertContains($depSlug, $depSlugs);
            }
            $slugs[] = $p['slug'];
        }
        $this->assertSame($slugs, array_values(array_unique($slugs)));
    }

    public function testProgramasCoverAllCategories(): void
    {
        $categorias = array_unique(array_column(DemoContent::programas(), 'categoria'));
        $this->assertEqualsCanonicalizing(['educativo', 'plan_centro', 'actividad', 'otro'], $categorias);
    }

    // --- Páginas editoriales ---

    public function testPaginasEditorialesAreMarkdownWithoutHtml(): void
    {
        $slugs = [];
        foreach (DemoContent::paginas() as $p) {
            $this->assertMatchesRegularExpression(self::SLUG_PATTERN, $p['slug']);
            $this->assertLessThanOrEqual(200, mb_strlen($p['titulo_es']));
            $this->assertNotEmpty($p['bloques']);
            foreach ($p['bloques'] as $bloque) {
                $this->assertStringStartsWith('## ', $bloque);
                $this->assertDoesNotMatchRegularExpression('/<[a-z\/!]/i', $bloque);
            }
            $slugs[] = $p['slug'];
        }
        $this->assertSame($slugs, array_values(array_unique($slugs)));
        foreach (['horarios', 'calendario', 'criterios-evaluacion', 'atencion', 'tutoriales', 'convivencia', 'cita-previa', 'tramites'] as $slug) {
            $this->assertContains($slug, $slugs);
        }
    }

    // --- Documentos, archivos y enlaces ---

    public function testArchivosDemoExistAndArePdf(): void
    {
        $dir = dirname(__DIR__, 2) . '/database/seed-files';
        $ficheros = [];
        foreach (DemoContent::archivosDemo() as $archivo) {
            $this->assertSame('application/pdf', $archivo['mime']);
            $ruta = $dir . '/' . $archivo['fichero'];
            $this->assertFileExists($ruta);
            $this->assertStringStartsWith('%PDF-', (string) file_get_contents($ruta));
            $ficheros[] = $archivo['fichero'];
        }
        $this->assertSame($ficheros, array_values(array_unique($ficheros)));
    }

    public function testDocumentosReferenceCategoriesAndArchivos(): void
    {
        $categorias = array_column(DemoContent::categoriasDocumentos(), 'slug');
        $archivos = array_keys(DemoContent::archivosDemo());
        $ensenanzas = array_column(DemoContent::ensenanzas(), 'slug');
        $claves = [];

        foreach (DemoContent::documentos() as $d) {
            $this->assertContains($d['categoria_slug'], $categorias);
            $this->assertContains($d['archivo'], $archivos);
            $this->assertNotSame('', trim($d['titulo_es']));
            $this->assertNotSame('', trim($d['descripcion_es']));
            if ($d['ensenanza_slug'] !== null) {
                $this->assertContains($d['ensenanza_slug'], $ensenanzas);
            }
            $clave = $d['titulo_es'] . ':' . $d['categoria_slug'];
            $this->assertNotContains($clave, $claves, 'documento duplicado');
            $claves[] = $clave;
        }
    }

    public function testEnlacesArePublicSafeAndGrouped(): void
    {
        $this->assertNotEmpty(DemoContent::enlaces());
        foreach (DemoContent::enlaces() as $e) {
            $this->assertNotSame('', trim($e['grupo']));
            $this->assertNotSame('', trim($e['titulo_es']));
            $this->assertStringStartsWith('https://', $e['url']);
            $this->assertStringContainsString('.example', $e['url'], 'sin dependencias externas reales');
            $this->assertDoesNotMatchRegularExpression('/password|secret|token/i', $e['url']);
        }
    }

    public function testCategoriasDocumentosMatchDocumentos(): void
    {
        $categorias = array_column(DemoContent::categoriasDocumentos(), 'slug');
        $this->assertSame($categorias, array_values(array_unique($categorias)));
        foreach (array_unique(array_column(DemoContent::documentos(), 'categoria_slug')) as $usada) {
            $this->assertContains($usada, $categorias);
        }
    }

    // --- Configuración ---

    public function testConfiguracionIsPublicSafe(): void
    {
        $config = DemoContent::configuracion();
        $this->assertSame('Lorca, Murcia', $config['localizacion']);
        $this->assertArrayHasKey('intranet_url', $config);
        $this->assertStringStartsWith('https://', $config['intranet_url']);
        foreach (array_keys($config) as $clave) {
            $this->assertDoesNotMatchRegularExpression('/password|secret|token|key/i', $clave);
            $this->assertLessThanOrEqual(100, strlen($clave));
        }
        $this->assertStringEndsWith('.example', $config['email_contacto']);
    }
}
