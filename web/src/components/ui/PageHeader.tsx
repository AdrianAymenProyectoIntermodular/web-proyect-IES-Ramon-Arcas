import type { ReactNode } from 'react';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { SplitText } from './Reveal';
import styles from './PageHeader.module.css';

interface PageHeaderProps {
  title: string;
  eyebrow?: string;
  children?: ReactNode;
}

export function PageHeader({ title, eyebrow, children }: PageHeaderProps) {
  useDocumentTitle(title);
  return (
    <header className={styles.header}>
      <div className="container">
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h1 className={styles.title}>
          <SplitText text={title} />
        </h1>
        {children && <div className={styles.lead}>{children}</div>}
      </div>
      <span className={styles.rule} aria-hidden="true" />
    </header>
  );
}
