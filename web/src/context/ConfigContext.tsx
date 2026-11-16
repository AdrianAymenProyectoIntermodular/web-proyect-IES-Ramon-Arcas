import { createContext, useContext, type ReactNode } from 'react';
import { getConfiguracion } from '../api/endpoints';
import type { Configuracion } from '../api/types';
import { useApi } from '../hooks/useApi';
import { DEFAULT_CONFIG } from './defaults';

const ConfigContext = createContext<Configuracion>(DEFAULT_CONFIG);

export function ConfigProvider({ children }: { children: ReactNode }) {
  const state = useApi((signal) => getConfiguracion(signal), []);
  const value = state.status === 'success' ? { ...DEFAULT_CONFIG, ...state.data } : DEFAULT_CONFIG;
  return <ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components -- hook acoplado a su provider
export function useConfig(): Configuracion {
  return useContext(ConfigContext);
}
