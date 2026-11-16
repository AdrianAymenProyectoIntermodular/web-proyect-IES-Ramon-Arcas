import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { Link } from 'react-router';
import { Logo } from '../components/brand/Logo';
import { EventPanel } from '../components/events/EventPanel';
import { Reveal, SplitText } from '../components/ui/Reveal';
import { useConfig } from '../context/ConfigContext';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import styles from './HomePage.module.css';

const QUICK_LINKS = [
  { to: '/ensenanzas', title: 'Enseñanzas', text: 'ESO, Bachillerato y Formación Profesional.' },
  { to: '/organizacion/departamentos', title: 'Departamentos', text: 'Conoce los departamentos didácticos.' },
  { to: '/familias', title: 'Familias', text: 'Documentos, tutoriales y atención a familias.' },
  { to: '/secretaria', title: 'Secretaría', text: 'Cita previa, matrícula y certificados.' },
] as const;

const SEALS = ['Erasmus+', 'eTwinning', 'Plan Digital', 'Formación Profesional'] as const;

function HeroSun() {
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();
  const rotate = useTransform(scrollY, [0, 800], [0, 120]);
  const scale = useTransform(scrollY, [0, 800], [1, 0.85]);
  return (
    <motion.div className={styles.sun} style={reduce ? undefined : { rotate, scale }} aria-hidden="true">
      <Logo variant="icon" alt="" />
    </motion.div>
  );
}

export function HomePage() {
  useDocumentTitle();
  const { nombre_centro, localizacion } = useConfig();

  return (
    <>
      <section className={styles.hero}>
        <div className={`container ${styles.heroInner}`}>
          <div className={styles.heroText}>
            <span className="eyebrow">{localizacion}</span>
            <h1 className={styles.title}>
              <SplitText text={nombre_centro ?? 'IES Ramón Arcas Meca'} />
            </h1>
            <Reveal delay={0.5}>
              <p className={styles.lead}>
                Educación Secundaria, Bachillerato y Formación Profesional en Lorca desde 1933.
              </p>
              <div className={styles.actions}>
                <Link to="/ensenanzas" className="button">
                  Nuestra oferta educativa
                </Link>
                <Link to="/organizacion/historia" className="button button--outline">
                  Nuestra historia
                </Link>
              </div>
            </Reveal>
          </div>
          <HeroSun />
        </div>
      </section>

      <section className="section" aria-labelledby="accesos">
        <div className="container">
          <h2 id="accesos" className="visually-hidden">
            Accesos rápidos
          </h2>
          <ul className={styles.quick}>
            {QUICK_LINKS.map((link, i) => (
              <Reveal as="li" key={link.to} delay={i * 0.08}>
                <Link to={link.to} className={styles.quickCard}>
                  <span className={styles.quickIndex} aria-hidden="true">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className={styles.quickTitle}>{link.title}</span>
                  <span className={styles.quickText}>{link.text}</span>
                </Link>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      <section className="section section--alt" aria-labelledby="agenda">
        <div className="container">
          <Reveal>
            <span className="eyebrow">Actualidad</span>
            <h2 id="agenda" className={styles.sectionTitle}>
              Próximos eventos
            </h2>
          </Reveal>
          <EventPanel limit={4} />
        </div>
      </section>

      <section className="section" aria-labelledby="sellos">
        <div className="container">
          <Reveal>
            <h2 id="sellos" className={styles.sectionTitle}>
              Programas y sellos del centro
            </h2>
          </Reveal>
          <ul className={styles.seals}>
            {SEALS.map((seal, i) => (
              <Reveal as="li" key={seal} delay={i * 0.06} className={styles.seal}>
                {seal}
              </Reveal>
            ))}
          </ul>
          <Link to="/programas">Ver todos los programas →</Link>
        </div>
      </section>
    </>
  );
}
