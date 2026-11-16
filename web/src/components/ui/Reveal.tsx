import { motion, useReducedMotion } from 'motion/react';
import type { ReactNode } from 'react';

interface RevealProps {
  children: ReactNode;
  delay?: number;
  /** Desplazamiento inicial en px (eje Y). */
  offset?: number;
  className?: string;
  as?: 'div' | 'li' | 'section' | 'article';
}

/** Aparición al entrar en pantalla, una sola vez. Sin animación si el usuario la ha reducido. */
export function Reveal({ children, delay = 0, offset = 28, className, as = 'div' }: RevealProps) {
  const reduce = useReducedMotion();
  if (reduce) {
    const Tag = as;
    return <Tag className={className}>{children}</Tag>;
  }
  const MotionTag = motion[as];
  return (
    <MotionTag
      className={className}
      initial={{ opacity: 0, y: offset }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -10% 0px' }}
      transition={{ duration: 0.7, delay, ease: [0.05, 0.7, 0.1, 1] }}
    >
      {children}
    </MotionTag>
  );
}

interface SplitTextProps {
  text: string;
  className?: string;
  /** Retardo entre palabras en segundos. */
  stagger?: number;
}

/**
 * Tipografía cinética: cada palabra sube desde una máscara.
 * El texto completo queda en un único nodo accesible (aria-label) para lectores de pantalla.
 */
export function SplitText({ text, className, stagger = 0.06 }: SplitTextProps) {
  const reduce = useReducedMotion();
  const words = text.split(/\s+/).filter(Boolean);
  if (reduce) return <span className={className}>{text}</span>;
  return (
    <span className={className} aria-label={text} role="text">
      {words.map((word, i) => (
        <span key={`${word}-${i}`} aria-hidden="true" style={{ display: 'inline-block', overflow: 'hidden', verticalAlign: 'top' }}>
          <motion.span
            style={{ display: 'inline-block', willChange: 'transform' }}
            initial={{ y: '110%' }}
            animate={{ y: '0%' }}
            transition={{ duration: 0.8, delay: 0.15 + i * stagger, ease: [0.05, 0.7, 0.1, 1] }}
          >
            {word}
            {i < words.length - 1 ? '\u00a0' : ''}
          </motion.span>
        </span>
      ))}
    </span>
  );
}
