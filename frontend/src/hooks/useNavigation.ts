import { getMenu } from '../api/endpoints';
import { FALLBACK_NAVIGATION, fromApiMenu, type NavItem } from '../lib/navigation';
import { useApi } from './useApi';

/**
 * Menú principal editable desde el panel (menús ≠ contenido).
 * Mientras carga, o si la API falla o devuelve un menú vacío, se usa el de respaldo
 * para que la navegación nunca desaparezca.
 */
export function useNavigation(): NavItem[] {
  const state = useApi((signal) => getMenu('principal', signal), []);
  if (state.status !== 'success') return FALLBACK_NAVIGATION;
  const items = fromApiMenu(state.data.items);
  return items.length > 0 ? items : FALLBACK_NAVIGATION;
}
