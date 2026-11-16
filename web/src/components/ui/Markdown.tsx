import ReactMarkdown from 'react-markdown';
import styles from './Markdown.module.css';

/**
 * Contenido editorial de `pagina_bloques`. react-markdown no interpreta HTML
 * embebido por defecto: no añadir `rehype-raw` sin sanitizar (XSS).
 */
export function Markdown({ source }: { source: string }) {
  return (
    <div className={styles.prose}>
      <ReactMarkdown skipHtml>{source}</ReactMarkdown>
    </div>
  );
}
