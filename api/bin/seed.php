<?php

declare(strict_types=1);

/**
 * Seed de desarrollo. Password admin SOLO desde variables de entorno.
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

$pdo->exec("INSERT IGNORE INTO categorias_documentos (id, slug, nombre_es, nombre_en, orden) VALUES
    (1, 'institucional', 'Documentos institucionales', 'Institutional documents', 1),
    (2, 'familias', 'Documentos para familias', 'Family documents', 2),
    (3, 'horarios', 'Horarios', 'Timetables', 3),
    (4, 'secretaria', 'Secretaria', 'Secretary', 4)");

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

$pdo->exec("INSERT IGNORE INTO noticias (id, slug, titulo_es, titulo_en, resumen_es, cuerpo_es, categoria, estado, publicado_en, curso_academico_id)
            VALUES (1, 'bienvenida-curso', 'Bienvenida al curso', 'Welcome to the school year',
                    'Arranca el nuevo curso', 'Contenido de bienvenida del centro.', 'general',
                    'publicado', UTC_TIMESTAMP(), 1)");

$pdo->exec("INSERT IGNORE INTO ensenanzas (id, slug, tipo, titulo_es, titulo_en, estado, publicado_en, orden)
            VALUES (1, 'eso', 'eso', 'Educacion Secundaria Obligatoria', 'Compulsory Secondary Education', 'publicado', UTC_TIMESTAMP(), 1),
                   (2, 'bachillerato', 'bachillerato', 'Bachillerato', 'Baccalaureate', 'publicado', UTC_TIMESTAMP(), 2)");

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

$pdo->exec("INSERT IGNORE INTO programas (id, slug, categoria, titulo_es, titulo_en, descripcion_es, estado, publicado_en, orden)
            VALUES (1, 'erasmus-plus', 'educativo', 'Erasmus+', 'Erasmus+', 'Programa europeo de movilidad.', 'publicado', UTC_TIMESTAMP(), 1)");

$pdo->exec("INSERT IGNORE INTO materias_optativas (id, slug, nombre_es, nombre_en, estado)
            VALUES (1, 'robotica', 'Robotica', 'Robotics', 'publicado')");

$pdo->exec("INSERT IGNORE INTO ofertas_optativas (id, materia_optativa_id, ensenanza_id, nivel, curso_academico_id, estado)
            VALUES (1, 1, 1, '3ESO', 1, 'publicado')");

$pdo->exec("INSERT IGNORE INTO servicios (id, slug, nombre_es, nombre_en, horario_es, estado, orden)
            VALUES (1, 'biblioteca', 'Biblioteca', 'Library', 'L-V 9:00-13:00', 'publicado', 1)");

$pdo->exec("INSERT IGNORE INTO enlaces (id, grupo, titulo_es, titulo_en, url, orden, estado)
            VALUES (1, 'plataformas', 'Aula virtual', 'Virtual classroom', 'https://aula.ejemplo.local', 1, 'publicado')");

echo "seed OK\n";
