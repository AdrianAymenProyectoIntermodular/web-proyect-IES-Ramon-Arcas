<?php

declare(strict_types=1);

namespace App\Seed;

use DateTimeImmutable;

/**
 * Contenido de demostración del seed de desarrollo.
 *
 * Todas las personas son ficticias (memoria §3.2: sin datos personales reales).
 * La historia del centro es la única información real; sus fuentes están en
 * docs/proyecto-intermodular.md.
 */
final class DemoContent
{
    /** @return list<array{slug:string,nombre_es:string,nombre_en:string,presentacion_es:string,contacto_publico:string,orden:int}> */
    public static function departamentos(): array
    {
        $rows = [
            ['matematicas', 'Matemáticas', 'Mathematics', 'Fomentamos el razonamiento lógico y la resolución de problemas con proyectos de estadística aplicada y olimpiadas matemáticas.'],
            ['lengua', 'Lengua Castellana y Literatura', 'Spanish Language and Literature', 'Trabajamos la comprensión lectora, la expresión oral y escrita y el gusto por la lectura a través del club de lectura del centro.'],
            ['ingles', 'Inglés', 'English', 'Coordinamos la sección bilingüe y los intercambios con centros europeos dentro del programa Erasmus+.'],
            ['frances', 'Francés', 'French', 'Ofrecemos francés como segunda lengua extranjera y preparamos al alumnado para las certificaciones DELF.'],
            ['geografia-historia', 'Geografía e Historia', 'Geography and History', 'Acercamos el patrimonio de Lorca al aula con salidas de campo y proyectos de memoria histórica local.'],
            ['biologia-geologia', 'Biología y Geología', 'Biology and Geology', 'Desarrollamos prácticas de laboratorio, el huerto escolar y actividades de educación ambiental.'],
            ['fisica-quimica', 'Física y Química', 'Physics and Chemistry', 'Impulsamos la ciencia experimental con talleres de laboratorio y participación en ferias científicas.'],
            ['tecnologia', 'Tecnología', 'Technology', 'Diseñamos y construimos proyectos de robótica, impresión 3D y programación de dispositivos.'],
            ['educacion-fisica', 'Educación Física', 'Physical Education', 'Promovemos hábitos de vida saludable, deporte escolar y actividades en el medio natural.'],
            ['musica', 'Música', 'Music', 'Organizamos el coro del centro, conciertos de fin de trimestre y talleres de producción musical.'],
            ['dibujo', 'Dibujo y Artes Plásticas', 'Art and Design', 'Trabajamos la expresión artística, el diseño gráfico y la fotografía con exposiciones abiertas a las familias.'],
            ['filosofia', 'Filosofía', 'Philosophy', 'Fomentamos el pensamiento crítico con debates, dilemas éticos y la participación en olimpiadas de filosofía.'],
            ['economia', 'Economía', 'Economics', 'Acercamos la empresa y el emprendimiento al alumnado de Bachillerato y FP con simulaciones y visitas.'],
            ['informatica', 'Informática y Comunicaciones', 'Computing and Communications', 'Impartimos los ciclos de la familia profesional de Informática, incluido Desarrollo de Aplicaciones Web.'],
            ['electricidad', 'Electricidad y Electrónica', 'Electricity and Electronics', 'Heredamos la tradición de la antigua Escuela de Maestría Industrial con talleres de instalaciones y automatismos.'],
            ['orientacion', 'Orientación', 'Guidance', 'Acompañamos al alumnado y a las familias en la orientación académica, profesional y personal.'],
        ];

        $out = [];
        foreach ($rows as $i => [$slug, $es, $en, $presentacion]) {
            $out[] = [
                'slug' => $slug,
                'nombre_es' => $es,
                'nombre_en' => $en,
                'presentacion_es' => $presentacion,
                'contacto_publico' => $slug . '@iesramonarcas.example',
                'orden' => $i + 1,
            ];
        }
        return $out;
    }

    /** @return list<array{id:int,nombre:string,biografia_es:string}> */
    public static function personas(): array
    {
        $nombres = [
            'Lucía Montoya Ferrer', 'Andrés Salcedo Ibarra', 'Marina Quiles Robles', 'Tomás Escribano Lledó',
            'Elena Vidal Carrasco', 'Javier Olmedo Prieto', 'Carmen Ballester Núñez', 'Raúl Herranz Molina',
            'Sofía Tárraga Bernal', 'Diego Navarro Aledo', 'Paula Cerezo Galindo', 'Hugo Montesinos Ruiz',
            'Irene Lozano Peñalver', 'Marcos Arnau Celdrán', 'Nuria Cárceles Ortín', 'Pablo Segura Abellán',
            'Alba Espinosa Mula', 'Adrián Gimeno Sáez', 'Clara Belmonte Reina', 'Óscar Valera Torrente',
        ];

        $out = [];
        foreach ($nombres as $i => $nombre) {
            $out[] = [
                'id' => $i + 1,
                'nombre' => $nombre,
                'biografia_es' => 'Docente del IES Ramón Arcas Meca (perfil ficticio de demostración).',
            ];
        }
        return $out;
    }

    /**
     * Jefatura y profesorado de cada departamento (persona_departamento).
     *
     * @return list<array{persona_id:int,departamento_slug:string,cargo_es:string,orden:int}>
     */
    public static function pertenencias(): array
    {
        $personas = self::personas();
        $total = count($personas);
        $out = [];
        foreach (self::departamentos() as $i => $dep) {
            $jefe = $personas[$i % $total]['id'];
            $docente = $personas[($i + 7) % $total]['id'];
            $out[] = ['persona_id' => $jefe, 'departamento_slug' => $dep['slug'], 'cargo_es' => 'Jefatura de departamento', 'orden' => 1];
            if ($docente !== $jefe) {
                $out[] = ['persona_id' => $docente, 'departamento_slug' => $dep['slug'], 'cargo_es' => 'Profesorado', 'orden' => 2];
            }
        }
        return $out;
    }

    /** @return list<array{slug:string,tipo:string,nombre_es:string,nombre_en:string,descripcion_es:string,orden:int}> */
    public static function organos(): array
    {
        return [
            ['slug' => 'equipo-directivo', 'tipo' => 'equipo_directivo', 'nombre_es' => 'Equipo directivo', 'nombre_en' => 'Management team', 'descripcion_es' => 'Dirige y coordina la vida del centro.', 'orden' => 1],
            ['slug' => 'consejo-escolar', 'tipo' => 'consejo_escolar', 'nombre_es' => 'Consejo escolar', 'nombre_en' => 'School council', 'descripcion_es' => 'Órgano colegiado de participación de toda la comunidad educativa.', 'orden' => 2],
            ['slug' => 'claustro', 'tipo' => 'claustro', 'nombre_es' => 'Claustro', 'nombre_en' => 'Teaching staff', 'descripcion_es' => 'Órgano de participación del profesorado en el gobierno del centro.', 'orden' => 3],
            ['slug' => 'ccp', 'tipo' => 'ccp', 'nombre_es' => 'Comisión de coordinación pedagógica', 'nombre_en' => 'Pedagogical coordination committee', 'descripcion_es' => 'Coordina las programaciones didácticas de los departamentos.', 'orden' => 4],
        ];
    }

    /** @return list<array{organo_slug:string,persona_id:int,cargo_es:string,orden:int}> */
    public static function miembros(): array
    {
        $directivo = [
            [1, 'Dirección'], [2, 'Jefatura de estudios'], [3, 'Jefatura de estudios adjunta'], [4, 'Secretaría'],
        ];
        $consejo = [
            [1, 'Presidencia'], [4, 'Secretaría'], [5, 'Representante del profesorado'], [6, 'Representante del profesorado'],
            [9, 'Representante de las familias'], [10, 'Representante del alumnado'],
        ];

        $out = [];
        foreach ($directivo as $i => [$id, $cargo]) {
            $out[] = ['organo_slug' => 'equipo-directivo', 'persona_id' => $id, 'cargo_es' => $cargo, 'orden' => $i + 1];
        }
        foreach ($consejo as $i => [$id, $cargo]) {
            $out[] = ['organo_slug' => 'consejo-escolar', 'persona_id' => $id, 'cargo_es' => $cargo, 'orden' => $i + 1];
        }
        foreach (self::personas() as $i => $p) {
            $out[] = ['organo_slug' => 'claustro', 'persona_id' => $p['id'], 'cargo_es' => 'Profesorado', 'orden' => $i + 1];
        }
        foreach (self::pertenencias() as $i => $p) {
            if ($p['cargo_es'] === 'Jefatura de departamento') {
                $out[] = ['organo_slug' => 'ccp', 'persona_id' => $p['persona_id'], 'cargo_es' => 'Jefatura de departamento', 'orden' => $i + 1];
            }
        }
        return $out;
    }

    /**
     * Eventos con fecha relativa a $now para que el panel de portada siempre tenga próximos eventos.
     * El último está en el pasado a propósito: comprueba el filtro `desde`.
     *
     * @return list<array{slug:string,titulo_es:string,tipo:string,descripcion_es:string,inicio:string,fin:string,lugar:string,destinatarios:string}>
     */
    public static function eventos(DateTimeImmutable $now): array
    {
        $base = $now->setTime(0, 0);
        $rows = [
            ['jornada-puertas-abiertas', 'Jornada de puertas abiertas', 'institucional', 'Visita guiada por las instalaciones y presentación de la oferta educativa para familias.', 5, '17:00', '19:30', 'Salón de actos', 'Familias'],
            ['feria-ciencia', 'Feria de la Ciencia', 'actividad', 'El alumnado de ESO y Bachillerato presenta sus experimentos al resto del centro.', 9, '09:30', '13:30', 'Patio central', 'Comunidad educativa'],
            ['charla-fp-dual', 'Charla: FP y empresa', 'orientacion', 'Empresas de Lorca explican la Formación en Empresas a los ciclos formativos.', 14, '11:00', '12:30', 'Aula magna', 'Alumnado de FP'],
            ['concierto-navidad', 'Concierto de invierno', 'cultural', 'El coro y la orquesta del centro ofrecen su concierto de fin de trimestre.', 21, '18:30', '20:00', 'Salón de actos', 'Familias'],
            ['ruta-patrimonio', 'Ruta por el patrimonio de Lorca', 'excursion', 'Salida didáctica al casco histórico y al Castillo de Lorca.', 28, '08:30', '14:00', 'Casco histórico de Lorca', '2.º ESO'],
            ['hackathon-daw', 'Hackathon DAW', 'actividad', 'Maratón de desarrollo web por equipos del ciclo de Desarrollo de Aplicaciones Web.', 35, '09:00', '14:30', 'Aulas de informática', 'Alumnado de DAW'],
            ['sesion-evaluacion', 'Entrega de notas de la evaluación', 'institucional', 'Las tutorías atienden a las familias tras la sesión de evaluación.', 42, '16:30', '19:00', 'Aulas de tutoría', 'Familias'],
            ['jornadas-acogida', 'Jornadas de acogida', 'institucional', 'Bienvenida al alumnado de nuevo ingreso.', -10, '09:00', '12:00', 'Patio central', 'Alumnado de nuevo ingreso'],
        ];

        $out = [];
        foreach ($rows as [$slug, $titulo, $tipo, $desc, $offset, $desde, $hasta, $lugar, $dest]) {
            $day = $base->modify(sprintf('%+d days', $offset));
            $out[] = [
                'slug' => $slug,
                'titulo_es' => $titulo,
                'tipo' => $tipo,
                'descripcion_es' => $desc,
                'inicio' => $day->format('Y-m-d') . ' ' . $desde . ':00',
                'fin' => $day->format('Y-m-d') . ' ' . $hasta . ':00',
                'lugar' => $lugar,
                'destinatarios' => $dest,
            ];
        }
        return $out;
    }

    /** @return array{slug:string,titulo_es:string,titulo_en:string,bloques:list<string>} */
    public static function historia(): array
    {
        return [
            'slug' => 'historia',
            'titulo_es' => 'Historia del centro',
            'titulo_en' => 'Our history',
            'bloques' => [
                "## De la Escuela Elemental de Trabajo a la Maestría Industrial\n\n"
                . "En 1933 se crea en Lorca la **Escuela Elemental de Trabajo**, con estudios de Electricidad y Mecánica, "
                . "Industria de la Madera, Albañilería y Construcción, Tipografía e Industria del Vestido.\n\n"
                . "En 1956 la escuela se traslada a su edificio definitivo, proyectado por el arquitecto **Miguel Fisac**, "
                . "como **Escuela de Maestría Industrial**. Se convirtió en un centro de referencia de la Formación Profesional "
                . "no solo para la Región de Murcia, sino también para Almería y Granada.",

                "## Nace el IES Ramón Arcas Meca\n\n"
                . "A finales de los años ochenta el Instituto de Formación Profesional se traslada al barrio de San Antonio "
                . "(hoy IES San Juan Bosco). En 1990 el edificio de Fisac pasa a acoger un centro de nueva creación: "
                . "el **Instituto de Educación Secundaria Ramón Arcas Meca**.",

                "## El terremoto de 2011 y el nuevo edificio\n\n"
                . "Los terremotos del **11 de mayo de 2011** dañaron gravemente el edificio, que tuvo que ser demolido. "
                . "En su lugar se levantó un nuevo edificio, cuyo exterior evoca al original y en el que se conserva "
                . "el gran mural de piedra de la antigua puerta principal.\n\n"
                . "En 2015 el centro celebró su **XXV aniversario** con exposiciones y conferencias sobre su historia "
                . "y la arquitectura de Miguel Fisac.",
            ],
        ];
    }

    /**
     * Árbol del menú principal (memoria §6.2). Las URLs son rutas del front.
     *
     * @return list<array{titulo_es:string,titulo_en:string,url:string,children?:list<array{titulo_es:string,titulo_en:string,url:string}>}>
     */
    public static function menuPrincipal(): array
    {
        $item = static fn (string $es, string $en, string $url): array => ['titulo_es' => $es, 'titulo_en' => $en, 'url' => $url];

        return [
            $item('Inicio', 'Home', '/'),
            $item('Organización', 'Organisation', '/organizacion') + ['children' => [
                $item('Quiénes somos', 'About us', '/organizacion/quienes-somos'),
                $item('Historia', 'History', '/organizacion/historia'),
                $item('Equipo directivo', 'Management team', '/organizacion/organos/equipo-directivo'),
                $item('Consejo escolar', 'School council', '/organizacion/organos/consejo-escolar'),
                $item('Claustro', 'Teaching staff', '/organizacion/organos/claustro'),
                $item('Comisión de coordinación pedagógica', 'Pedagogical committee', '/organizacion/organos/ccp'),
                $item('Departamentos', 'Departments', '/organizacion/departamentos'),
                $item('Documentos institucionales', 'Institutional documents', '/organizacion/documentos'),
                $item('Horarios', 'Timetables', '/organizacion/horarios'),
                $item('Calendario escolar', 'School calendar', '/organizacion/calendario'),
            ]],
            $item('Familias', 'Families', '/familias') + ['children' => [
                $item('Documentos y enlaces', 'Documents and links', '/familias/documentos'),
                $item('Criterios de evaluación', 'Assessment criteria', '/familias/criterios-evaluacion'),
                $item('Atención a familias', 'Family support', '/familias/atencion'),
                $item('Tutoriales de plataformas', 'Platform tutorials', '/familias/tutoriales'),
                $item('Guía de convivencia', 'Coexistence guide', '/familias/convivencia'),
                $item('Buzón de sugerencias', 'Suggestions box', '/contacto?tipo=sugerencia'),
            ]],
            $item('Enseñanzas', 'Studies', '/ensenanzas') + ['children' => [
                $item('ESO', 'Secondary education', '/ensenanzas/eso'),
                $item('Bachillerato', 'Baccalaureate', '/ensenanzas/bachillerato'),
                $item('Formación Profesional', 'Vocational training', '/ensenanzas/fp'),
                $item('Materias optativas', 'Electives', '/ensenanzas/optativas'),
            ]],
            $item('Secretaría', 'Secretary', '/secretaria') + ['children' => [
                $item('Cita previa', 'Appointments', '/secretaria/cita-previa'),
                $item('Trámites administrativos', 'Procedures', '/secretaria/tramites'),
            ]],
            $item('Programas', 'Programmes', '/programas'),
            $item('Noticias', 'News', '/noticias') + ['children' => [
                $item('Actualidad', 'Latest news', '/noticias'),
                $item('Agenda de eventos', 'Events', '/eventos'),
            ]],
            $item('Contacto', 'Contact', '/contacto'),
        ];
    }

    /** @return array<string,string> claves públicas de configuración */
    public static function configuracion(): array
    {
        return [
            'nombre_centro' => 'IES Ramón Arcas Meca',
            'localizacion' => 'Lorca, Murcia',
            'direccion' => 'Avenida Juan Carlos I, Lorca (Murcia)',
            'email_contacto' => 'info@iesramonarcas.example',
            'telefono' => '+34 968 000 000',
            'intranet_url' => 'https://intranet.ejemplo.local',
            'horario_general' => 'L-V 8:00-14:30',
        ];
    }
}
