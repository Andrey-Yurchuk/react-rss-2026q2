import { QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { AppErrorBoundary } from '../components/AppErrorBoundary/index.ts';
import { ThemeToggle } from '../components/ThemeToggle/index.ts';
import { ThemeProvider } from '../context/ThemeContext.tsx';
import { AppRoutes } from '../routes/AppRoutes';
import { createAppQueryClient } from '../services/queryClient.ts';

const ROUTER_BASENAME = import.meta.env.BASE_URL.replace(/\/$/, '') || '/';
const queryClient = createAppQueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <BrowserRouter basename={ROUTER_BASENAME}>
          <div className="app-shell">
            <div className="app-shell__topbar">
              <ThemeToggle />
            </div>
            <AppErrorBoundary>
              <AppRoutes />
            </AppErrorBoundary>
          </div>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
