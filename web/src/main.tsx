import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router';
import { MotionConfig } from 'motion/react';
import { ConfigProvider } from './context/ConfigContext';
import { routes } from './routes';
import './styles/global.css';

const router = createBrowserRouter(routes);

const root = document.getElementById('root');
if (!root) throw new Error('No existe #root en index.html');

createRoot(root).render(
  <StrictMode>
    <MotionConfig reducedMotion="user">
      <ConfigProvider>
        <RouterProvider router={router} />
      </ConfigProvider>
    </MotionConfig>
  </StrictMode>,
);
