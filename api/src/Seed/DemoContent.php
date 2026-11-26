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

    // --- E3: enseñanzas, optativas y programas ---

    /**
     * Oferta educativa. Los ciclos de FP son filas propias (tipo fp) para que
     * /ensenanzas/fp pueda listarlos y cada ciclo tenga su ficha.
     *
     * @return list<array{slug:string,tipo:string,familia:string|null,titulo_es:string,titulo_en:string,requisitos_es:string,requisitos_en:string,duracion_es:string,duracion_en:string,salidas_es:string,salidas_en:string,orden:int}>
     */
    public static function ensenanzas(): array
    {
        return [
            [
                'slug' => 'eso',
                'tipo' => 'eso',
                'familia' => null,
                'titulo_es' => 'Educación Secundaria Obligatoria',
                'titulo_en' => 'Compulsory Secondary Education',
                'requisitos_es' => 'Haber finalizado la Educación Primaria. La etapa es obligatoria y gratuita entre los 12 y los 16 años.',
                'requisitos_en' => 'Completion of primary education. Compulsory and free between the ages of 12 and 16.',
                'duracion_es' => '4 cursos',
                'duracion_en' => '4 years',
                'salidas_es' => 'Bachillerato, ciclos de Formación Profesional de grado medio o incorporación al mundo laboral.',
                'salidas_en' => 'Baccalaureate, intermediate vocational training or employment.',
                'orden' => 1,
            ],
            [
                'slug' => 'bachillerato',
                'tipo' => 'bachillerato',
                'familia' => null,
                'titulo_es' => 'Bachillerato',
                'titulo_en' => 'Baccalaureate',
                'requisitos_es' => 'Título de Graduado en Educación Secundaria Obligatoria.',
                'requisitos_en' => 'Compulsory Secondary Education certificate.',
                'duracion_es' => '2 cursos',
                'duracion_en' => '2 years',
                'salidas_es' => 'Estudios universitarios, ciclos de Formación Profesional de grado superior o mundo laboral.',
                'salidas_en' => 'University studies, advanced vocational training or employment.',
                'orden' => 2,
            ],
            [
                'slug' => 'desarrollo-aplicaciones-web',
                'tipo' => 'fp',
                'familia' => 'Informática y Comunicaciones',
                'titulo_es' => 'Desarrollo de Aplicaciones Web',
                'titulo_en' => 'Web Application Development',
                'requisitos_es' => 'Título de Bachillerato, de Técnico o de Técnico Superior, o prueba de acceso a ciclos formativos.',
                'requisitos_en' => 'Baccalaureate, technician or advanced technician certificate, or vocational access exam.',
                'duracion_es' => '2 cursos (2.000 horas)',
                'duracion_en' => '2 years (2,000 hours)',
                'salidas_es' => 'Desarrollo web frontend y backend, administración de sistemas y despliegue de aplicaciones.',
                'salidas_en' => 'Frontend and backend web development, systems administration and application deployment.',
                'orden' => 3,
            ],
            [
                'slug' => 'sistemas-microinformaticos-redes',
                'tipo' => 'fp',
                'familia' => 'Informática y Comunicaciones',
                'titulo_es' => 'Sistemas Microinformáticos y Redes',
                'titulo_en' => 'Microcomputer Systems and Networks',
                'requisitos_es' => 'Título de Graduado en Educación Secundaria Obligatoria o prueba de acceso.',
                'requisitos_en' => 'Compulsory Secondary Education certificate or access exam.',
                'duracion_es' => '2 cursos (2.000 horas)',
                'duracion_en' => '2 years (2,000 hours)',
                'salidas_es' => 'Instalación y mantenimiento de equipos, redes locales y soporte técnico.',
                'salidas_en' => 'Equipment installation and maintenance, local networks and technical support.',
                'orden' => 4,
            ],
            [
                'slug' => 'instalaciones-electricas-automaticas',
                'tipo' => 'fp',
                'familia' => 'Electricidad y Electrónica',
                'titulo_es' => 'Instalaciones Eléctricas y Automáticas',
                'titulo_en' => 'Electrical and Automated Installations',
                'requisitos_es' => 'Título de Graduado en Educación Secundaria Obligatoria o prueba de acceso.',
                'requisitos_en' => 'Compulsory Secondary Education certificate or access exam.',
                'duracion_es' => '2 cursos (2.000 horas)',
                'duracion_en' => '2 years (2,000 hours)',
                'salidas_es' => 'Montaje y mantenimiento de instalaciones eléctricas, domóticas y automatizadas.',
                'salidas_en' => 'Assembly and maintenance of electrical, home automation and automated installations.',
                'orden' => 5,
            ],
            [
                'slug' => 'gestion-administrativa',
                'tipo' => 'fp',
                'familia' => 'Administración y Gestión',
                'titulo_es' => 'Gestión Administrativa',
                'titulo_en' => 'Administrative Management',
                'requisitos_es' => 'Título de Graduado en Educación Secundaria Obligatoria o prueba de acceso.',
                'requisitos_en' => 'Compulsory Secondary Education certificate or access exam.',
                'duracion_es' => '2 cursos (2.000 horas)',
                'duracion_en' => '2 years (2,000 hours)',
                'salidas_es' => 'Gestión administrativa en empresas, asesorías y administraciones públicas.',
                'salidas_en' => 'Administrative management in companies, consultancies and public administrations.',
                'orden' => 6,
            ],
        ];
    }

    /**
     * Módulos de los ciclos de FP. ESO y Bachillerato se organizan por materias,
     * no por módulos profesionales.
     *
     * @return list<array{ensenanza_slug:string,nombre_es:string,nombre_en:string,horas:int,orden:int}>
     */
    public static function modulos(): array
    {
        return [
            ['ensenanza_slug' => 'desarrollo-aplicaciones-web', 'nombre_es' => 'Desarrollo web en entorno cliente', 'nombre_en' => 'Client-side web development', 'horas' => 200, 'orden' => 1],
            ['ensenanza_slug' => 'desarrollo-aplicaciones-web', 'nombre_es' => 'Desarrollo web en entorno servidor', 'nombre_en' => 'Server-side web development', 'horas' => 240, 'orden' => 2],
            ['ensenanza_slug' => 'desarrollo-aplicaciones-web', 'nombre_es' => 'Despliegue de aplicaciones web', 'nombre_en' => 'Web application deployment', 'horas' => 120, 'orden' => 3],
            ['ensenanza_slug' => 'desarrollo-aplicaciones-web', 'nombre_es' => 'Diseño de interfaces web', 'nombre_en' => 'Web interface design', 'horas' => 160, 'orden' => 4],
            ['ensenanza_slug' => 'sistemas-microinformaticos-redes', 'nombre_es' => 'Montaje y mantenimiento de equipos', 'nombre_en' => 'Computer assembly and maintenance', 'horas' => 180, 'orden' => 1],
            ['ensenanza_slug' => 'sistemas-microinformaticos-redes', 'nombre_es' => 'Sistemas operativos monopuesto', 'nombre_en' => 'Single-user operating systems', 'horas' => 140, 'orden' => 2],
            ['ensenanza_slug' => 'sistemas-microinformaticos-redes', 'nombre_es' => 'Redes locales', 'nombre_en' => 'Local networks', 'horas' => 180, 'orden' => 3],
            ['ensenanza_slug' => 'sistemas-microinformaticos-redes', 'nombre_es' => 'Servicios de red', 'nombre_en' => 'Network services', 'horas' => 120, 'orden' => 4],
            ['ensenanza_slug' => 'instalaciones-electricas-automaticas', 'nombre_es' => 'Instalaciones eléctricas interiores', 'nombre_en' => 'Indoor electrical installations', 'horas' => 220, 'orden' => 1],
            ['ensenanza_slug' => 'instalaciones-electricas-automaticas', 'nombre_es' => 'Automatismos industriales', 'nombre_en' => 'Industrial automation', 'horas' => 180, 'orden' => 2],
            ['ensenanza_slug' => 'instalaciones-electricas-automaticas', 'nombre_es' => 'Instalaciones domóticas', 'nombre_en' => 'Home automation installations', 'horas' => 140, 'orden' => 3],
            ['ensenanza_slug' => 'gestion-administrativa', 'nombre_es' => 'Gestión de la documentación jurídica', 'nombre_en' => 'Legal documentation management', 'horas' => 120, 'orden' => 1],
            ['ensenanza_slug' => 'gestion-administrativa', 'nombre_es' => 'Técnica contable', 'nombre_en' => 'Accounting techniques', 'horas' => 180, 'orden' => 2],
            ['ensenanza_slug' => 'gestion-administrativa', 'nombre_es' => 'Gestión de recursos humanos', 'nombre_en' => 'Human resources management', 'horas' => 140, 'orden' => 3],
        ];
    }

    /** @return list<array{slug:string,nombre_es:string,nombre_en:string,descripcion_es:string,descripcion_en:string}> */
    public static function materiasOptativas(): array
    {
        return [
            [
                'slug' => 'robotica',
                'nombre_es' => 'Robótica',
                'nombre_en' => 'Robotics',
                'descripcion_es' => 'Diseño, construcción y programación de robots con placas y sensores.',
                'descripcion_en' => 'Design, construction and programming of robots with boards and sensors.',
            ],
            [
                'slug' => 'astronomia',
                'nombre_es' => 'Astronomía',
                'nombre_en' => 'Astronomy',
                'descripcion_es' => 'Observación del cielo, sistema solar y manejo de telescopios.',
                'descripcion_en' => 'Sky observation, solar system and telescope handling.',
            ],
            [
                'slug' => 'teatro',
                'nombre_es' => 'Teatro',
                'nombre_en' => 'Theatre',
                'descripcion_es' => 'Expresión corporal, voz y montaje de una obra de fin de curso.',
                'descripcion_en' => 'Body expression, voice and staging of an end-of-year play.',
            ],
            [
                'slug' => 'fotografia',
                'nombre_es' => 'Fotografía',
                'nombre_en' => 'Photography',
                'descripcion_es' => 'Composición, iluminación y edición digital de imágenes.',
                'descripcion_en' => 'Composition, lighting and digital image editing.',
            ],
            [
                'slug' => 'ajedrez',
                'nombre_es' => 'Ajedrez',
                'nombre_en' => 'Chess',
                'descripcion_es' => 'Táctica, estrategia y participación en torneos escolares.',
                'descripcion_en' => 'Tactics, strategy and participation in school tournaments.',
            ],
            [
                'slug' => 'cultura-cientifica',
                'nombre_es' => 'Cultura científica',
                'nombre_en' => 'Scientific culture',
                'descripcion_es' => 'Experimentos, divulgación y debates sobre ciencia y sociedad.',
                'descripcion_en' => 'Experiments, outreach and debates on science and society.',
            ],
        ];
    }

    /** @return list<array{materia_slug:string,ensenanza_slug:string,nivel:string}> */
    public static function ofertasOptativas(): array
    {
        return [
            ['materia_slug' => 'robotica', 'ensenanza_slug' => 'eso', 'nivel' => '3ESO'],
            ['materia_slug' => 'robotica', 'ensenanza_slug' => 'eso', 'nivel' => '4ESO'],
            ['materia_slug' => 'astronomia', 'ensenanza_slug' => 'eso', 'nivel' => '4ESO'],
            ['materia_slug' => 'cultura-cientifica', 'ensenanza_slug' => 'eso', 'nivel' => '3ESO'],
            ['materia_slug' => 'teatro', 'ensenanza_slug' => 'eso', 'nivel' => '2ESO'],
            ['materia_slug' => 'ajedrez', 'ensenanza_slug' => 'eso', 'nivel' => '1ESO'],
            ['materia_slug' => 'fotografia', 'ensenanza_slug' => 'bachillerato', 'nivel' => '1BACH'],
            ['materia_slug' => 'teatro', 'ensenanza_slug' => 'bachillerato', 'nivel' => '2BACH'],
            ['materia_slug' => 'robotica', 'ensenanza_slug' => 'desarrollo-aplicaciones-web', 'nivel' => '1FP'],
            ['materia_slug' => 'fotografia', 'ensenanza_slug' => 'desarrollo-aplicaciones-web', 'nivel' => '2FP'],
        ];
    }

    /**
     * Programas del centro agrupables por categoría (8–12 en el seed).
     *
     * @return list<array{slug:string,categoria:string,titulo_es:string,titulo_en:string,descripcion_es:string,descripcion_en:string,orden:int,departamentos:list<string>}>
     */
    public static function programas(): array
    {
        return [
            [
                'slug' => 'erasmus-plus',
                'categoria' => 'educativo',
                'titulo_es' => 'Erasmus+',
                'titulo_en' => 'Erasmus+',
                'descripcion_es' => 'Movilidad europea del alumnado y del profesorado con centros socios.',
                'descripcion_en' => 'European mobility for students and teachers with partner schools.',
                'orden' => 1,
                'departamentos' => ['ingles', 'frances'],
            ],
            [
                'slug' => 'seccion-bilingue',
                'categoria' => 'educativo',
                'titulo_es' => 'Sección bilingüe',
                'titulo_en' => 'Bilingual section',
                'descripcion_es' => 'Materias impartidas en inglés con auxiliares de conversación.',
                'descripcion_en' => 'Subjects taught in English with conversation assistants.',
                'orden' => 2,
                'departamentos' => ['ingles', 'geografia-historia'],
            ],
            [
                'slug' => 'fp-dual',
                'categoria' => 'educativo',
                'titulo_es' => 'Formación Profesional dual',
                'titulo_en' => 'Dual vocational training',
                'descripcion_es' => 'Formación en empresa alternada con la actividad en el aula.',
                'descripcion_en' => 'Company training alternating with classroom activity.',
                'orden' => 3,
                'departamentos' => ['informatica', 'electricidad', 'economia'],
            ],
            [
                'slug' => 'plan-lector',
                'categoria' => 'plan_centro',
                'titulo_es' => 'Plan lector',
                'titulo_en' => 'Reading plan',
                'descripcion_es' => 'Club de lectura, apadrinamiento lector y dinamización de la biblioteca.',
                'descripcion_en' => 'Reading club, reading buddies and library activities.',
                'orden' => 4,
                'departamentos' => ['lengua'],
            ],
            [
                'slug' => 'plan-digital',
                'categoria' => 'plan_centro',
                'titulo_es' => 'Plan digital de centro',
                'titulo_en' => 'Digital school plan',
                'descripcion_es' => 'Competencia digital, uso seguro de la red y aula virtual.',
                'descripcion_en' => 'Digital competence, safe internet use and virtual classroom.',
                'orden' => 5,
                'departamentos' => ['informatica', 'tecnologia'],
            ],
            [
                'slug' => 'escuela-sostenible',
                'categoria' => 'plan_centro',
                'titulo_es' => 'Escuela sostenible',
                'titulo_en' => 'Sustainable school',
                'descripcion_es' => 'Reciclaje, eficiencia energética y movilidad sostenible.',
                'descripcion_en' => 'Recycling, energy efficiency and sustainable mobility.',
                'orden' => 6,
                'departamentos' => ['biologia-geologia', 'fisica-quimica'],
            ],
            [
                'slug' => 'convivencia-positiva',
                'categoria' => 'plan_centro',
                'titulo_es' => 'Convivencia positiva',
                'titulo_en' => 'Positive coexistence',
                'descripcion_es' => 'Mediación entre iguales, tutoría entre compañeros y aula de convivencia.',
                'descripcion_en' => 'Peer mediation, peer tutoring and coexistence classroom.',
                'orden' => 7,
                'departamentos' => ['orientacion', 'filosofia'],
            ],
            [
                'slug' => 'huerto-escolar',
                'categoria' => 'actividad',
                'titulo_es' => 'Huerto escolar',
                'titulo_en' => 'School garden',
                'descripcion_es' => 'Cultivo ecológico, compostaje y talleres con las familias.',
                'descripcion_en' => 'Organic growing, composting and workshops with families.',
                'orden' => 8,
                'departamentos' => ['biologia-geologia'],
            ],
            [
                'slug' => 'olimpiadas-cientificas',
                'categoria' => 'actividad',
                'titulo_es' => 'Olimpiadas científicas',
                'titulo_en' => 'Science olympiads',
                'descripcion_es' => 'Preparación y participación en olimpiadas de matemáticas, física y química.',
                'descripcion_en' => 'Preparation and participation in mathematics, physics and chemistry olympiads.',
                'orden' => 9,
                'departamentos' => ['matematicas', 'fisica-quimica'],
            ],
            [
                'slug' => 'radio-escolar',
                'categoria' => 'otro',
                'titulo_es' => 'Radio escolar',
                'titulo_en' => 'School radio',
                'descripcion_es' => 'Podcast y programas en directo producidos por el alumnado.',
                'descripcion_en' => 'Podcasts and live shows produced by students.',
                'orden' => 10,
                'departamentos' => ['lengua', 'musica'],
            ],
        ];
    }

    // --- E4: noticias, páginas editoriales, documentos y enlaces ---

    /**
     * Noticias de demostración. Las fechas son relativas a $now para que el
     * listado público siempre tenga contenido vigente y pueda paginar.
     *
     * @return list<array{slug:string,titulo_es:string,titulo_en:string,resumen_es:string,resumen_en:string,cuerpo_es:string,categoria:string,destacado:int,publicado_en:string}>
     */
    public static function noticias(DateTimeImmutable $now): array
    {
        $base = $now->setTime(9, 0);
        $rows = [
            ['apertura-curso-2026-2027', 'Apertura del curso 2026/2027', 'Opening of the 2026/2027 school year',
                'El centro da la bienvenida a las familias y presenta las novedades del curso.',
                'The school welcomes families and presents the new school year.',
                "## Un curso con nuevos retos\n\nEl claustro ha preparado una programación que refuerza la lectura, la competencia digital y el acompañamiento tutorial.\n\nLas familias pueden consultar el calendario escolar y los horarios de atención en la secretaría del centro.",
                'institucional', 1, 2],
            ['jornada-puertas-abiertas', 'Jornada de puertas abiertas', 'Open day',
                'Visitas guiadas por las instalaciones y presentación de la oferta educativa.',
                'Guided tours and presentation of the educational offer.',
                "## Ven a conocernos\n\nLa jornada incluye visitas al laboratorio, los talleres de FP y la biblioteca, además de una charla informativa sobre el proceso de admisión.\n\nNo es necesario inscribirse previamente.",
                'institucional', 1, 5],
            ['feria-de-la-ciencia', 'Feria de la Ciencia', 'Science fair',
                'El alumnado de ESO y Bachillerato expone sus experimentos en el patio central.',
                'Secondary and baccalaureate students present their experiments in the central courtyard.',
                "## Ciencia hecha en el aula\n\nLos proyectos abordan la energía, el agua y la salud desde un enfoque práctico.\n\nEl jurado, formado por profesorado y familias, destacará las propuestas con mayor rigor y originalidad.",
                'academico', 0, 9],
            ['charla-fp-empresa', 'Charla sobre FP y empresa', 'Talk on vocational training and business',
                'Empresas de Lorca explican la formación en empresa a los ciclos formativos.',
                'Local companies explain in-company training to vocational students.',
                "## Puente entre el aula y la empresa\n\nLa sesión detalla cómo funciona la FP dual, qué perfiles demanda el tejido productivo de la comarca y cómo preparar una candidatura.\n\nAl finalizar habrá turno de preguntas.",
                'academico', 0, 14],
            ['concierto-de-invierno', 'Concierto de invierno', 'Winter concert',
                'El coro y la orquesta del centro ofrecen su concierto de fin de trimestre.',
                'The school choir and orchestra perform their end-of-term concert.',
                "## Música en el salón de actos\n\nEl programa combina piezas clásicas con arreglos de música popular.\n\nLa entrada es gratuita hasta completar aforo.",
                'cultural', 0, 20],
            ['ruta-por-el-patrimonio', 'Ruta por el patrimonio de Lorca', 'Lorca heritage route',
                'Salida didáctica al casco histórico y al castillo con el alumnado de 2.º de ESO.',
                'Educational trip to the historic centre and castle with 2nd year ESO students.',
                "## Historia a cielo abierto\n\nLa actividad recorre la judería, la colegiata de San Patricio y el castillo.\n\nEl alumnado prepara previamente un cuaderno de campo que completará durante la visita.",
                'academico', 0, 27],
            ['hackathon-daw', 'Hackathon de Desarrollo Web', 'Web development hackathon',
                'Maratón de desarrollo por equipos del ciclo de Desarrollo de Aplicaciones Web.',
                'Team development marathon for the Web Application Development course.',
                "## Cuarenta y ocho horas de código\n\nLos equipos parten de un reto propuesto por una empresa colaboradora y presentan su solución ante un jurado.\n\nSe valoran la accesibilidad, el rendimiento y la calidad del código.",
                'academico', 1, 35],
            ['entrega-de-notas', 'Entrega de notas de la evaluación', 'Report card day',
                'Las tutorías atienden a las familias tras la sesión de evaluación.',
                'Tutors meet families after the assessment session.',
                "## Acompañamiento a las familias\n\nAdemás de las calificaciones, las tutorías comparten orientaciones para el siguiente trimestre.\n\nSe recomienda solicitar cita previa si se necesita una entrevista más extensa.",
                'institucional', 0, 44],
            ['dia-de-la-paz', 'Día de la Paz', 'Peace day',
                'Actividades conjuntas de tutoría y un mural colaborativo en el patio.',
                'Joint tutor group activities and a collaborative mural in the courtyard.',
                "## Construir convivencia\n\nCada grupo aporta una pieza al mural con mensajes sobre el diálogo y la resolución pacífica de conflictos.\n\nLa jornada termina con la lectura de un manifiesto elaborado por el alumnado.",
                'cultural', 0, 55],
            ['torneo-de-debate', 'Torneo de debate', 'Debate tournament',
                'Equipos de Bachillerato defienden sus argumentos en el salón de actos.',
                'Baccalaureate teams defend their arguments in the assembly hall.',
                "## Pensamiento crítico en acción\n\nEl torneo sigue el formato de debate académico y aborda temas de actualidad.\n\nEl equipo ganador representará al centro en la fase comarcal.",
                'academico', 0, 70],
            ['semana-del-huerto', 'Semana del huerto escolar', 'School garden week',
                'Talleres de siembra, compostaje y cocina saludable con las familias.',
                'Sowing, composting and healthy cooking workshops with families.',
                "## Aprender con las manos\n\nEl huerto escolar cumple su tercer curso y este año incorpora un sistema de riego por goteo.\n\nLas familias pueden participar en los talleres de los sábados.",
                'cultural', 0, 90],
            ['reconocimiento-erasmus', 'Reconocimiento Erasmus+', 'Erasmus+ recognition',
                'El centro recibe un sello europeo por sus proyectos de movilidad.',
                'The school receives a European seal for its mobility projects.',
                "## Europa en el aula\n\nEl reconocimiento valora la calidad de los intercambios y su impacto en la comunidad educativa.\n\nDurante el acto se presentarán los resultados de los últimos proyectos.",
                'institucional', 0, 120],
        ];

        $out = [];
        foreach ($rows as [$slug, $titulo, $tituloEn, $resumen, $resumenEn, $cuerpo, $categoria, $destacado, $dias]) {
            $out[] = [
                'slug' => $slug,
                'titulo_es' => $titulo,
                'titulo_en' => $tituloEn,
                'resumen_es' => $resumen,
                'resumen_en' => $resumenEn,
                'cuerpo_es' => $cuerpo,
                'categoria' => $categoria,
                'destacado' => $destacado,
                'publicado_en' => $base->modify(sprintf('-%d days', $dias))->format('Y-m-d H:i:s'),
            ];
        }
        return $out;
    }

    /**
     * Páginas editoriales de Familias, Secretaría y Organización.
     *
     * @return list<array{slug:string,titulo_es:string,titulo_en:string,bloques:list<string>}>
     */
    public static function paginas(): array
    {
        return [
            [
                'slug' => 'horarios',
                'titulo_es' => 'Horarios',
                'titulo_en' => 'Timetables',
                'bloques' => [
                    "## Horario general del centro\n\nEl centro abre de **lunes a viernes de 8:00 a 14:30**. Las actividades extraescolares se desarrollan por la tarde según el calendario de cada departamento.",
                    "## Atención a familias\n\nLas tutorías se celebran los **martes de 16:30 a 18:30**. Se recomienda solicitar cita previa en secretaría para garantizar la disponibilidad del profesorado.",
                ],
            ],
            [
                'slug' => 'calendario',
                'titulo_es' => 'Calendario escolar',
                'titulo_en' => 'School calendar',
                'bloques' => [
                    "## Trimestres\n\nEl curso se organiza en tres trimestres. Las fechas de inicio y fin de cada uno se publican en la secretaría y en el tablón de anuncios.",
                    "## Días no lectivos\n\nLos festivos locales y autonómicos se recogen en el calendario oficial de la Consejería de Educación. El centro comunica cualquier cambio por los canales habituales.",
                ],
            ],
            [
                'slug' => 'criterios-evaluacion',
                'titulo_es' => 'Criterios de evaluación',
                'titulo_en' => 'Assessment criteria',
                'bloques' => [
                    "## Evaluación por competencias\n\nLos criterios de evaluación de cada materia se detallan en las programaciones didácticas de los departamentos, disponibles para las familias.",
                    "## Recuperaciones\n\nEl alumnado con materias pendientes dispone de un plan de recuperación con seguimiento tutorial. Las fechas se comunican al inicio de cada trimestre.",
                ],
            ],
            [
                'slug' => 'atencion',
                'titulo_es' => 'Atención a familias',
                'titulo_en' => 'Family support',
                'bloques' => [
                    "## Canales de atención\n\nLa secretaría atiende presencialmente en horario de mañana y por teléfono. El correo electrónico del centro es el canal preferente para consultas generales.",
                    "## Tutorías\n\nCada grupo tiene un tutor o tutora que acompaña al alumnado y a su familia durante el curso. La cita se solicita a través de la secretaría o del aula virtual.",
                ],
            ],
            [
                'slug' => 'tutoriales',
                'titulo_es' => 'Tutoriales de plataformas',
                'titulo_en' => 'Platform tutorials',
                'bloques' => [
                    "## Aula virtual\n\nEl aula virtual centraliza materiales, tareas y calificaciones. En el tutorial se explican el acceso, la entrega de tareas y la consulta de notas.",
                    "## Comunicación con el centro\n\nLas familias reciben las comunicaciones oficiales por la plataforma corporativa. Si tienes problemas de acceso, contacta con la secretaría.",
                ],
            ],
            [
                'slug' => 'convivencia',
                'titulo_es' => 'Guía de convivencia',
                'titulo_en' => 'Coexistence guide',
                'bloques' => [
                    "## Normas de convivencia\n\nEl plan de convivencia recoge los derechos y deberes de la comunidad educativa, así como las medidas preventivas y de mediación.",
                    "## Mediación entre iguales\n\nEl alumnado mediador recibe formación específica y participa en la resolución de conflictos de forma voluntaria y confidencial.",
                ],
            ],
            [
                'slug' => 'cita-previa',
                'titulo_es' => 'Cita previa',
                'titulo_en' => 'Appointments',
                'bloques' => [
                    "## Cómo solicitar cita\n\nLas citas con secretaría se solicitan por teléfono o presencialmente. Para las tutorías, utiliza el aula virtual o contacta con el tutor o tutora.",
                    "## Documentación\n\nTrae el DNI o documento identificativo y, si procede, la documentación específica del trámite que vayas a realizar.",
                ],
            ],
            [
                'slug' => 'tramites',
                'titulo_es' => 'Trámites administrativos',
                'titulo_en' => 'Administrative procedures',
                'bloques' => [
                    "## Matrícula y traslados\n\nLa matrícula se formaliza en los plazos que publica la Consejería de Educación. Los traslados de expediente se solicitan en secretaría.",
                    "## Certificados y becas\n\nPuedes solicitar certificados de matrícula y de notas en secretaría. La tramitación de becas se realiza preferentemente por vía electrónica.",
                ],
            ],
        ];
    }

    /**
     * Archivos de ejemplo versionados en api/database/seed-files. El seed los
     * copia a storage/uploads para que las descargas funcionen en local.
     *
     * @return array<string,array{fichero:string,nombre_original:string,mime:string,descripcion_es:string}>
     */
    public static function archivosDemo(): array
    {
        return [
            'calendario' => [
                'fichero' => 'calendario-escolar.pdf',
                'nombre_original' => 'calendario-escolar-2026-2027.pdf',
                'mime' => 'application/pdf',
                'descripcion_es' => 'Calendario escolar del curso 2026/2027.',
            ],
            'convivencia' => [
                'fichero' => 'plan-convivencia.pdf',
                'nombre_original' => 'plan-de-convivencia.pdf',
                'mime' => 'application/pdf',
                'descripcion_es' => 'Plan de convivencia del centro.',
            ],
            'matricula' => [
                'fichero' => 'solicitud-matricula.pdf',
                'nombre_original' => 'solicitud-de-matricula.pdf',
                'mime' => 'application/pdf',
                'descripcion_es' => 'Formulario de solicitud de matrícula.',
            ],
            'atencion' => [
                'fichero' => 'horario-atencion.pdf',
                'nombre_original' => 'horario-de-atencion-a-familias.pdf',
                'mime' => 'application/pdf',
                'descripcion_es' => 'Horario de atención a familias en secretaría.',
            ],
            'salida' => [
                'fichero' => 'autorizacion-salida.pdf',
                'nombre_original' => 'autorizacion-de-salida.pdf',
                'mime' => 'application/pdf',
                'descripcion_es' => 'Autorización para actividades fuera del centro.',
            ],
            'programacion' => [
                'fichero' => 'programacion-daw.pdf',
                'nombre_original' => 'programacion-didactica-daw.pdf',
                'mime' => 'application/pdf',
                'descripcion_es' => 'Programación didáctica del ciclo de Desarrollo de Aplicaciones Web.',
            ],
        ];
    }

    /**
     * Documentos publicados. `archivo` referencia una clave de archivosDemo().
     *
     * @return list<array{titulo_es:string,titulo_en:string,descripcion_es:string,descripcion_en:string,categoria_slug:string,archivo:string,ensenanza_slug:string|null}>
     */
    public static function documentos(): array
    {
        return [
            [
                'titulo_es' => 'Calendario escolar 2026/2027',
                'titulo_en' => 'School calendar 2026/2027',
                'descripcion_es' => 'Fechas de inicio y fin de trimestre, festivos y periodos de evaluación.',
                'descripcion_en' => 'Term start and end dates, holidays and assessment periods.',
                'categoria_slug' => 'institucional',
                'archivo' => 'calendario',
                'ensenanza_slug' => null,
            ],
            [
                'titulo_es' => 'Programación didáctica de DAW',
                'titulo_en' => 'DAW teaching programme',
                'descripcion_es' => 'Objetivos, contenidos y criterios de evaluación del ciclo.',
                'descripcion_en' => 'Objectives, contents and assessment criteria for the course.',
                'categoria_slug' => 'institucional',
                'archivo' => 'programacion',
                'ensenanza_slug' => 'desarrollo-aplicaciones-web',
            ],
            [
                'titulo_es' => 'Plan de convivencia',
                'titulo_en' => 'Coexistence plan',
                'descripcion_es' => 'Normas, medidas preventivas y protocolo de mediación.',
                'descripcion_en' => 'Rules, preventive measures and mediation protocol.',
                'categoria_slug' => 'familias',
                'archivo' => 'convivencia',
                'ensenanza_slug' => null,
            ],
            [
                'titulo_es' => 'Autorización de salida',
                'titulo_en' => 'Trip authorisation',
                'descripcion_es' => 'Formulario para autorizar actividades fuera del centro.',
                'descripcion_en' => 'Form to authorise activities outside the school.',
                'categoria_slug' => 'familias',
                'archivo' => 'salida',
                'ensenanza_slug' => null,
            ],
            [
                'titulo_es' => 'Horario de atención a familias',
                'titulo_en' => 'Family support timetable',
                'descripcion_es' => 'Días y horas de atención presencial en secretaría.',
                'descripcion_en' => 'Days and times for in-person support at the office.',
                'categoria_slug' => 'horarios',
                'archivo' => 'atencion',
                'ensenanza_slug' => null,
            ],
            [
                'titulo_es' => 'Solicitud de matrícula',
                'titulo_en' => 'Enrolment application',
                'descripcion_es' => 'Formulario oficial para formalizar la matrícula.',
                'descripcion_en' => 'Official form to complete enrolment.',
                'categoria_slug' => 'secretaria',
                'archivo' => 'matricula',
                'ensenanza_slug' => null,
            ],
        ];
    }

    /** @return list<array{grupo:string,titulo_es:string,titulo_en:string,url:string,orden:int}> */
    public static function enlaces(): array
    {
        return [
            ['grupo' => 'plataformas', 'titulo_es' => 'Aula virtual', 'titulo_en' => 'Virtual classroom', 'url' => 'https://aula.iesramonarcas.example', 'orden' => 1],
            ['grupo' => 'plataformas', 'titulo_es' => 'Correo corporativo', 'titulo_en' => 'School email', 'url' => 'https://correo.iesramonarcas.example', 'orden' => 2],
            ['grupo' => 'plataformas', 'titulo_es' => 'PASEN', 'titulo_en' => 'PASEN', 'url' => 'https://pasen.iesramonarcas.example', 'orden' => 3],
            ['grupo' => 'familias', 'titulo_es' => 'AMPA del centro', 'titulo_en' => 'Parents association', 'url' => 'https://ampa.iesramonarcas.example', 'orden' => 1],
            ['grupo' => 'familias', 'titulo_es' => 'Consejería de Educación', 'titulo_en' => 'Regional education department', 'url' => 'https://educacion.murcia.example', 'orden' => 2],
            ['grupo' => 'secretaria', 'titulo_es' => 'Sede electrónica', 'titulo_en' => 'Electronic office', 'url' => 'https://sede.murcia.example', 'orden' => 1],
            ['grupo' => 'secretaria', 'titulo_es' => 'Becas y ayudas', 'titulo_en' => 'Grants and aid', 'url' => 'https://becas.educacion.example', 'orden' => 2],
            ['grupo' => 'institucional', 'titulo_es' => 'Portal de transparencia', 'titulo_en' => 'Transparency portal', 'url' => 'https://transparencia.murcia.example', 'orden' => 1],
        ];
    }

    /** @return list<array{slug:string,nombre_es:string,nombre_en:string,orden:int}> */
    public static function categoriasDocumentos(): array
    {
        return [
            ['slug' => 'institucional', 'nombre_es' => 'Documentos institucionales', 'nombre_en' => 'Institutional documents', 'orden' => 1],
            ['slug' => 'familias', 'nombre_es' => 'Documentos para familias', 'nombre_en' => 'Family documents', 'orden' => 2],
            ['slug' => 'horarios', 'nombre_es' => 'Horarios', 'nombre_en' => 'Timetables', 'orden' => 3],
            ['slug' => 'secretaria', 'nombre_es' => 'Secretaría', 'nombre_en' => 'Secretary', 'orden' => 4],
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
