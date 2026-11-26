import { Suspense, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router';
import { useNavigation } from '../../hooks/useNavigation';
import type { LayoutContext } from '../../lib/navigation';
import { Loading } from '../ui/AsyncState';
import { Footer } from './Footer';
import { Header } from './Header';

export function SiteLayout() {
  const navigation = useNavigation();
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [pathname]);

  return (
    <>
      <a className="skip-link" href="#contenido">
        Saltar al contenido
      </a>
      <Header navigation={navigation} />
      <main id="contenido" tabIndex={-1}>
        <Suspense
          fallback={
            <div className="container">
              <Loading />
            </div>
          }
        >
          <Outlet context={{ navigation } satisfies LayoutContext} />
        </Suspense>
      </main>
      <Footer navigation={navigation} />
    </>
  );
}
