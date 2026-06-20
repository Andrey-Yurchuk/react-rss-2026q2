'use client';

import type { ReactNode } from 'react';
import { AppErrorBoundary } from '../AppErrorBoundary/index.ts';
import { ThemeToggle } from '../ThemeToggle/index.ts';

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="app-shell">
      <div className="app-shell__topbar">
        <ThemeToggle />
      </div>
      <AppErrorBoundary>{children}</AppErrorBoundary>
    </div>
  );
}
