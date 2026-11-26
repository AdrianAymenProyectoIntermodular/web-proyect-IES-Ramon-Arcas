<?php

declare(strict_types=1);

/**
 * Regenera shared/fixtures/menu-principal.json desde DemoContent::menuPrincipal().
 * Lo leen DemoContentTest (PHPUnit) y navigation.test.ts (Vitest): ejecutar tras cambiar el menú del seed.
 */

require dirname(__DIR__) . '/vendor/autoload.php';

use App\Seed\DemoContent;

$path = dirname(__DIR__, 2) . '/shared/fixtures/menu-principal.json';
$json = json_encode(
    DemoContent::menuPrincipal(),
    JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR
) . "\n";

file_put_contents($path, $json);
echo "Escrito {$path}\n";
