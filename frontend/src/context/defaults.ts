import type { Configuracion } from '../api/types';

/** Valores mostrados mientras carga o si la API no responde: la web nunca queda sin cabecera ni pie. */
export const DEFAULT_CONFIG: Configuracion = {
  nombre_centro: 'IES Ramón Arcas Meca',
  localizacion: 'Lorca, Murcia',
};
