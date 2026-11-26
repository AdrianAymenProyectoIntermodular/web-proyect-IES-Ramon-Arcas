<?php

declare(strict_types=1);

/**
 * Seed de desarrollo. Password admin SOLO desde variables de entorno.
 *
 * Es idempotente: cada bloque hace upsert por su clave natural para que se
 * pueda ejecutar varias veces sin duplicar contenido de demostración.
 */

require dirname(__DIR__) . '/vendor/autoload.php';

use App\Auth\Password;
use App\Config;
use App\Database;
use App\Seed\DemoContent;

$envFile = dirname(__DIR__, 2) . '/.env';
if (is_file($envFile)) {
    foreach (file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
        $line = trim($line);
        if ($line === '' || str_starts_with($line, '#') || !str_contains($line, '=')) {
            continue;
        }
        [$k, $v] = explode('=', $line, 2);
        $_ENV[trim($k)] = trim($v, " \t\"'");
        putenv(trim($k) . '=' . trim($v, " \t\"'"));
    }
}

$pdo = Database::pdo();

$email = Config::get('ADMIN_EMAIL', 'admin@iesramonarcas.local');
$password = Config::get('ADMIN_PASSWORD');
$name = Config::get('ADMIN_NAME', 'Administrador');
if ($password === null || $password === '') {
    fwrite(STDERR, "ADMIN_PASSWORD no definido en .env\n");
    exit(1);
}

$exists = $pdo->prepare('SELECT id FROM usuarios WHERE email = ?');
$exists->execute([$email]);
if (!$exists->fetch()) {
    $pdo->prepare(
        'INSERT INTO usuarios (email, nombre, rol, password_hash, activo) VALUES (?, ?, \'admin\', ?, 1)'
    )->execute([$email, $name, Password::hash($password)]);
    echo "admin user created\n";
} else {
    echo "admin user exists\n";
}

$ins = $pdo->prepare(
    'INSERT INTO configuracion (clave, valor, publica) VALUES (?, ?, 1)
     ON DUPLICATE KEY UPDATE valor = VALUES(valor), publica = VALUES(publica)'
);
foreach (DemoContent::configuracion() as $clave => $valor) {
    $ins->execute([$clave, $valor]);
}

$pdo->exec("INSERT IGNORE INTO menus (id, clave, nombre) VALUES (1, 'principal', 'Menu principal'), (2, 'pie', 'Pie de pagina')");

$pdo->exec("INSERT INTO cursos_academicos (id, etiqueta, inicio, fin, actual) VALUES
    (1, '2025-2026', '2025-09-01', '2026-06-30', 0),
    (2, '2026-2027', '2026-09-01', '2027-06-30', 1)
    ON DUPLICATE KEY UPDATE actual = VALUES(actual)");

$categoria = $pdo->prepare(
    'INSERT INTO categorias_documentos (slug, nombre_es, nombre_en, orden) VALUES (?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE nombre_es = VALUES(nombre_es), nombre_en = VALUES(nombre_en), orden = VALUES(orden)'
);
foreach (DemoContent::categoriasDocumentos() as $c) {
    $categoria->execute([$c['slug'], $c['nombre_es'], $c['nombre_en'], $c['orden']]);
}
$catIds = $pdo->query('SELECT slug, id FROM categorias_documentos')->fetchAll(PDO::FETCH_KEY_PAIR);

/** Upsert por slug + reemplazo de bloques de texto Markdown. */
$seedPagina = static function (PDO $pdo, string $slug, string $es, string $en, array $markdownBloques): void {
    $pdo->prepare(
        "INSERT INTO paginas (slug, titulo_es, titulo_en, estado, publicado_en)
         VALUES (?, ?, ?, 'publicado', UTC_TIMESTAMP())
         ON DUPLICATE KEY UPDATE titulo_es = VALUES(titulo_es), titulo_en = VALUES(titulo_en), estado = 'publicado'"
    )->execute([$slug, $es, $en]);
    $id = $pdo->prepare('SELECT id FROM paginas WHERE slug = ?');
    $id->execute([$slug]);
    $paginaId = (int) $id->fetchColumn();

    $pdo->prepare('DELETE FROM pagina_bloques WHERE pagina_id = ?')->execute([$paginaId]);
    $bloque = $pdo->prepare("INSERT INTO pagina_bloques (pagina_id, tipo, contenido_json, orden) VALUES (?, 'texto', ?, ?)");
    foreach ($markdownBloques as $orden => $markdown) {
        $bloque->execute([$paginaId, json_encode(['markdown_es' => $markdown], JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE), $orden]);
    }
};

$seedPagina($pdo, 'quienes-somos', 'Quiénes somos', 'About us', [
    "El **IES Ramón Arcas Meca** es un instituto público de Educación Secundaria, Bachillerato y Formación Profesional "
    . "situado en Lorca (Murcia). Nuestro objetivo es acompañar a cada estudiante en su crecimiento académico, "
    . "profesional y personal.",
]);
$historia = DemoContent::historia();
$seedPagina($pdo, $historia['slug'], $historia['titulo_es'], $historia['titulo_en'], $historia['bloques']);
foreach (DemoContent::paginas() as $pagina) {
    $seedPagina($pdo, $pagina['slug'], $pagina['titulo_es'], $pagina['titulo_en'], $pagina['bloques']);
}

// Menú principal (memoria §6.2): se reconstruye entero para que el seed sea la fuente de verdad en desarrollo.
// «Acceso intranet» (menú pie) deja url vacía: el front resuelve configuracion.intranet_url.
$pdo->exec('DELETE FROM menu_items WHERE menu_id IN (1, 2)');
$menuItem = $pdo->prepare(
    'INSERT INTO menu_items (menu_id, padre_id, titulo_es, titulo_en, url, orden) VALUES (?, ?, ?, ?, ?, ?)'
);
foreach (DemoContent::menuPrincipal() as $orden => $item) {
    $menuItem->execute([1, null, $item['titulo_es'], $item['titulo_en'], $item['url'], $orden + 1]);
    $padreId = (int) $pdo->lastInsertId();
    foreach ($item['children'] ?? [] as $hijoOrden => $hijo) {
        $menuItem->execute([1, $padreId, $hijo['titulo_es'], $hijo['titulo_en'], $hijo['url'], $hijoOrden + 1]);
    }
}
$menuItem->execute([2, null, 'Acceso intranet', 'Intranet access', null, 1]);

// Noticias de demostración (fechas relativas para que el listado siempre pagine).
$noticia = $pdo->prepare(
    "INSERT INTO noticias (slug, titulo_es, titulo_en, resumen_es, resumen_en, cuerpo_es, categoria,
                           estado, publicado_en, destacado, curso_academico_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'publicado', ?, ?, 2)
     ON DUPLICATE KEY UPDATE titulo_es = VALUES(titulo_es), titulo_en = VALUES(titulo_en),
        resumen_es = VALUES(resumen_es), resumen_en = VALUES(resumen_en), cuerpo_es = VALUES(cuerpo_es),
        categoria = VALUES(categoria), publicado_en = VALUES(publicado_en), destacado = VALUES(destacado)"
);
foreach (DemoContent::noticias(new DateTimeImmutable('now', new DateTimeZone('Europe/Madrid'))) as $n) {
    $noticia->execute([
        $n['slug'], $n['titulo_es'], $n['titulo_en'], $n['resumen_es'], $n['resumen_en'],
        $n['cuerpo_es'], $n['categoria'], $n['publicado_en'], $n['destacado'],
    ]);
}

// Enseñanzas: ESO, Bachillerato y ciclos de FP.
$ensenanza = $pdo->prepare(
    "INSERT INTO ensenanzas (slug, tipo, familia, titulo_es, titulo_en, requisitos_es, requisitos_en,
                             duracion_es, duracion_en, salidas_es, salidas_en, estado, publicado_en, orden)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'publicado', UTC_TIMESTAMP(), ?)
     ON DUPLICATE KEY UPDATE tipo = VALUES(tipo), familia = VALUES(familia), titulo_es = VALUES(titulo_es),
        titulo_en = VALUES(titulo_en), requisitos_es = VALUES(requisitos_es), requisitos_en = VALUES(requisitos_en),
        duracion_es = VALUES(duracion_es), duracion_en = VALUES(duracion_en), salidas_es = VALUES(salidas_es),
        salidas_en = VALUES(salidas_en), orden = VALUES(orden)"
);
foreach (DemoContent::ensenanzas() as $e) {
    $ensenanza->execute([
        $e['slug'], $e['tipo'], $e['familia'], $e['titulo_es'], $e['titulo_en'], $e['requisitos_es'],
        $e['requisitos_en'], $e['duracion_es'], $e['duracion_en'], $e['salidas_es'], $e['salidas_en'], $e['orden'],
    ]);
}
$ensIds = $pdo->query('SELECT slug, id FROM ensenanzas')->fetchAll(PDO::FETCH_KEY_PAIR);

$modulos = DemoContent::modulos();
$pdo->exec('DELETE FROM modulos WHERE ensenanza_id IN (' . implode(',', array_map('intval', $ensIds)) . ')');
$modulo = $pdo->prepare(
    'INSERT INTO modulos (ensenanza_id, nombre_es, nombre_en, horas, orden) VALUES (?, ?, ?, ?, ?)'
);
foreach ($modulos as $m) {
    $modulo->execute([$ensIds[$m['ensenanza_slug']], $m['nombre_es'], $m['nombre_en'], $m['horas'], $m['orden']]);
}

// Optativas: materia estable + oferta por enseñanza/nivel/curso académico.
$materia = $pdo->prepare(
    "INSERT INTO materias_optativas (slug, nombre_es, nombre_en, descripcion_es, descripcion_en, estado)
     VALUES (?, ?, ?, ?, ?, 'publicado')
     ON DUPLICATE KEY UPDATE nombre_es = VALUES(nombre_es), nombre_en = VALUES(nombre_en),
        descripcion_es = VALUES(descripcion_es), descripcion_en = VALUES(descripcion_en), estado = 'publicado'"
);
foreach (DemoContent::materiasOptativas() as $m) {
    $materia->execute([$m['slug'], $m['nombre_es'], $m['nombre_en'], $m['descripcion_es'], $m['descripcion_en']]);
}
$matIds = $pdo->query('SELECT slug, id FROM materias_optativas')->fetchAll(PDO::FETCH_KEY_PAIR);

$oferta = $pdo->prepare(
    "INSERT INTO ofertas_optativas (materia_optativa_id, ensenanza_id, nivel, curso_academico_id, estado)
     VALUES (?, ?, ?, 2, 'publicado')
     ON DUPLICATE KEY UPDATE estado = 'publicado'"
);
foreach (DemoContent::ofertasOptativas() as $o) {
    $oferta->execute([$matIds[$o['materia_slug']], $ensIds[$o['ensenanza_slug']], $o['nivel']]);
}

$dep = $pdo->prepare(
    "INSERT INTO departamentos (slug, nombre_es, nombre_en, presentacion_es, contacto_publico, estado, orden)
     VALUES (?, ?, ?, ?, ?, 'publicado', ?)
     ON DUPLICATE KEY UPDATE nombre_es = VALUES(nombre_es), nombre_en = VALUES(nombre_en),
        presentacion_es = VALUES(presentacion_es), contacto_publico = VALUES(contacto_publico), orden = VALUES(orden)"
);
foreach (DemoContent::departamentos() as $d) {
    $dep->execute([$d['slug'], $d['nombre_es'], $d['nombre_en'], $d['presentacion_es'], $d['contacto_publico'], $d['orden']]);
}
$depIds = $pdo->query('SELECT slug, id FROM departamentos')->fetchAll(PDO::FETCH_KEY_PAIR);

$persona = $pdo->prepare(
    'INSERT INTO personas (id, nombre, biografia_es, visible_publico) VALUES (?, ?, ?, 1)
     ON DUPLICATE KEY UPDATE nombre = VALUES(nombre), biografia_es = VALUES(biografia_es)'
);
foreach (DemoContent::personas() as $p) {
    $persona->execute([$p['id'], $p['nombre'], $p['biografia_es']]);
}

$pertenencia = $pdo->prepare(
    'INSERT INTO persona_departamento (persona_id, departamento_id, cargo_es, orden) VALUES (?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE cargo_es = VALUES(cargo_es), orden = VALUES(orden)'
);
foreach (DemoContent::pertenencias() as $p) {
    $pertenencia->execute([$p['persona_id'], $depIds[$p['departamento_slug']], $p['cargo_es'], $p['orden']]);
}

$organo = $pdo->prepare(
    "INSERT INTO organos (slug, tipo, nombre_es, nombre_en, descripcion_es, estado, orden)
     VALUES (?, ?, ?, ?, ?, 'publicado', ?)
     ON DUPLICATE KEY UPDATE nombre_es = VALUES(nombre_es), descripcion_es = VALUES(descripcion_es), orden = VALUES(orden)"
);
foreach (DemoContent::organos() as $o) {
    $organo->execute([$o['slug'], $o['tipo'], $o['nombre_es'], $o['nombre_en'], $o['descripcion_es'], $o['orden']]);
}
$organoIds = $pdo->query('SELECT slug, id FROM organos')->fetchAll(PDO::FETCH_KEY_PAIR);

// organo_miembros no tiene clave natural: se reemplazan los de los órganos de demo.
$pdo->exec("DELETE om FROM organo_miembros om INNER JOIN organos o ON o.id = om.organo_id
            WHERE o.slug IN ('equipo-directivo', 'consejo-escolar', 'claustro', 'ccp')");
$miembro = $pdo->prepare('INSERT INTO organo_miembros (organo_id, persona_id, cargo_es, orden) VALUES (?, ?, ?, ?)');
foreach (DemoContent::miembros() as $m) {
    $miembro->execute([$organoIds[$m['organo_slug']], $m['persona_id'], $m['cargo_es'], $m['orden']]);
}

$evento = $pdo->prepare(
    "INSERT INTO eventos (slug, titulo_es, tipo, descripcion_es, inicio, fin, lugar, destinatarios, curso_academico_id, estado, publicado_en)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 2, 'publicado', UTC_TIMESTAMP())
     ON DUPLICATE KEY UPDATE titulo_es = VALUES(titulo_es), descripcion_es = VALUES(descripcion_es),
        inicio = VALUES(inicio), fin = VALUES(fin), lugar = VALUES(lugar), destinatarios = VALUES(destinatarios)"
);
foreach (DemoContent::eventos(new DateTimeImmutable('now', new DateTimeZone('Europe/Madrid'))) as $e) {
    $evento->execute([$e['slug'], $e['titulo_es'], $e['tipo'], $e['descripcion_es'], $e['inicio'], $e['fin'], $e['lugar'], $e['destinatarios']]);
}

// Programas por categoría + departamentos responsables.
$programa = $pdo->prepare(
    "INSERT INTO programas (slug, categoria, titulo_es, titulo_en, descripcion_es, descripcion_en,
                            estado, publicado_en, orden)
     VALUES (?, ?, ?, ?, ?, ?, 'publicado', UTC_TIMESTAMP(), ?)
     ON DUPLICATE KEY UPDATE categoria = VALUES(categoria), titulo_es = VALUES(titulo_es),
        titulo_en = VALUES(titulo_en), descripcion_es = VALUES(descripcion_es),
        descripcion_en = VALUES(descripcion_en), orden = VALUES(orden)"
);
foreach (DemoContent::programas() as $p) {
    $programa->execute([
        $p['slug'], $p['categoria'], $p['titulo_es'], $p['titulo_en'],
        $p['descripcion_es'], $p['descripcion_en'], $p['orden'],
    ]);
}
$progIds = $pdo->query('SELECT slug, id FROM programas')->fetchAll(PDO::FETCH_KEY_PAIR);
$seedProgIds = array_map(
    static fn (string $slug): int => (int) $progIds[$slug],
    array_column(DemoContent::programas(), 'slug')
);
$pdo->exec(
    'DELETE FROM programa_departamento WHERE programa_id IN ('
    . implode(',', array_map('intval', $seedProgIds)) . ')'
);
$progDep = $pdo->prepare('INSERT INTO programa_departamento (programa_id, departamento_id) VALUES (?, ?)');
foreach (DemoContent::programas() as $p) {
    foreach ($p['departamentos'] as $depSlug) {
        $progDep->execute([$progIds[$p['slug']], $depIds[$depSlug]]);
    }
}

// Archivos de ejemplo: se copian desde database/seed-files a storage/uploads
// para que las descargas de documentos funcionen en local.
$seedDir = dirname(__DIR__) . '/database/seed-files';
$uploadDir = dirname(__DIR__) . '/storage/uploads';
if (!is_dir($uploadDir) && !mkdir($uploadDir, 0775, true) && !is_dir($uploadDir)) {
    fwrite(STDERR, "No se pudo crear storage/uploads\n");
    exit(1);
}
$archivoIds = [];
$archivoFind = $pdo->prepare('SELECT id FROM archivos WHERE ruta = ?');
$archivoInsert = $pdo->prepare(
    'INSERT INTO archivos (ruta, nombre_original, mime, tamano, descripcion_es) VALUES (?, ?, ?, ?, ?)'
);
$archivoUpdate = $pdo->prepare(
    'UPDATE archivos SET nombre_original = ?, mime = ?, tamano = ?, descripcion_es = ? WHERE id = ?'
);
foreach (DemoContent::archivosDemo() as $clave => $a) {
    $origen = $seedDir . '/' . $a['fichero'];
    if (!is_file($origen)) {
        fwrite(STDERR, "Falta el archivo de seed {$a['fichero']}\n");
        exit(1);
    }
    $destino = $uploadDir . '/seed-' . $a['fichero'];
    copy($origen, $destino);
    $ruta = 'uploads/seed-' . $a['fichero'];
    $tamano = (int) filesize($destino);
    $archivoFind->execute([$ruta]);
    $archivoId = $archivoFind->fetchColumn();
    if ($archivoId) {
        $archivoUpdate->execute([$a['nombre_original'], $a['mime'], $tamano, $a['descripcion_es'], (int) $archivoId]);
        $archivoIds[$clave] = (int) $archivoId;
    } else {
        $archivoInsert->execute([$ruta, $a['nombre_original'], $a['mime'], $tamano, $a['descripcion_es']]);
        $archivoIds[$clave] = (int) $pdo->lastInsertId();
    }
}

// Documentos reutilizables: upsert por título + categoría.
$docFind = $pdo->prepare('SELECT id FROM documentos WHERE titulo_es = ? AND categoria_id = ?');
$docInsert = $pdo->prepare(
    "INSERT INTO documentos (titulo_es, titulo_en, descripcion_es, descripcion_en, categoria_id,
                             curso_academico_id, ensenanza_id, archivo_id, estado, publicado_en)
     VALUES (?, ?, ?, ?, ?, 2, ?, ?, 'publicado', UTC_TIMESTAMP())"
);
$docUpdate = $pdo->prepare(
    "UPDATE documentos SET titulo_en = ?, descripcion_es = ?, descripcion_en = ?, curso_academico_id = 2,
        ensenanza_id = ?, archivo_id = ?, estado = 'publicado' WHERE id = ?"
);
foreach (DemoContent::documentos() as $d) {
    $catId = (int) $catIds[$d['categoria_slug']];
    $ensId = $d['ensenanza_slug'] === null ? null : (int) $ensIds[$d['ensenanza_slug']];
    $archivoId = $archivoIds[$d['archivo']];
    $docFind->execute([$d['titulo_es'], $catId]);
    $docId = $docFind->fetchColumn();
    if ($docId) {
        $docUpdate->execute([$d['titulo_en'], $d['descripcion_es'], $d['descripcion_en'], $ensId, $archivoId, (int) $docId]);
    } else {
        $docInsert->execute([
            $d['titulo_es'], $d['titulo_en'], $d['descripcion_es'], $d['descripcion_en'],
            $catId, $ensId, $archivoId,
        ]);
    }
}

// Enlaces externos: upsert por grupo + título.
$enlaceFind = $pdo->prepare('SELECT id FROM enlaces WHERE grupo = ? AND titulo_es = ?');
$enlaceInsert = $pdo->prepare(
    "INSERT INTO enlaces (grupo, titulo_es, titulo_en, url, orden, estado) VALUES (?, ?, ?, ?, ?, 'publicado')"
);
$enlaceUpdate = $pdo->prepare(
    "UPDATE enlaces SET titulo_en = ?, url = ?, orden = ?, estado = 'publicado' WHERE id = ?"
);
foreach (DemoContent::enlaces() as $e) {
    $enlaceFind->execute([$e['grupo'], $e['titulo_es']]);
    $enlaceId = $enlaceFind->fetchColumn();
    if ($enlaceId) {
        $enlaceUpdate->execute([$e['titulo_en'], $e['url'], $e['orden'], (int) $enlaceId]);
    } else {
        $enlaceInsert->execute([$e['grupo'], $e['titulo_es'], $e['titulo_en'], $e['url'], $e['orden']]);
    }
}

$pdo->exec("INSERT IGNORE INTO servicios (id, slug, nombre_es, nombre_en, horario_es, estado, orden)
            VALUES (1, 'biblioteca', 'Biblioteca', 'Library', 'L-V 9:00-13:00', 'publicado', 1)");

echo "seed OK\n";
