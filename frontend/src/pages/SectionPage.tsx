import { Link, useOutletContext } from 'react-router';
import { PageHeader } from '../components/ui/PageHeader';
import { Reveal } from '../components/ui/Reveal';
import type { LayoutContext } from '../lib/navigation';
import { NotFoundPage } from './NotFoundPage';
import styles from './SectionPage.module.css';

/** Portada de un apartado del menú (/organizacion, /familias...): lista sus subapartados. */
export function SectionPage({ path }: { path: string }) {
  const { navigation } = useOutletContext<LayoutContext>();
  const section = navigation.find((item) => item.to === path);
  if (!section) return <NotFoundPage />;

  return (
    <>
      <PageHeader title={section.label} />
      <section className="section">
        <div className="container">
          <ul className={styles.list}>
            {section.children.map((child, i) => (
              <Reveal as="li" key={child.to} delay={Math.min(i, 8) * 0.05}>
                <Link to={child.to} className={styles.link}>
                  <span>{child.label}</span>
                  <span aria-hidden="true">→</span>
                </Link>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
