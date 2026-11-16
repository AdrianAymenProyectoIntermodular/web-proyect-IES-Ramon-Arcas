import { useEffect } from 'react';

export const SITE_NAME = 'IES Ramón Arcas Meca';

export function formatTitle(title?: string): string {
  return title && title.trim() !== '' ? `${title} · ${SITE_NAME}` : `${SITE_NAME} · Lorca`;
}

export function useDocumentTitle(title?: string): void {
  useEffect(() => {
    document.title = formatTitle(title);
  }, [title]);
}
