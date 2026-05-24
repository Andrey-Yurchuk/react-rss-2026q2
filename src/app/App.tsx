import { BrowserRouter } from 'react-router-dom';
import { AppErrorBoundary } from '../components/AppErrorBoundary/index.ts';
import { ThemeToggle } from '../components/ThemeToggle/index.ts';
import { ThemeProvider } from '../context/ThemeContext.tsx';
import { AppRoutes } from '../routes/AppRoutes';

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
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
  );
}
