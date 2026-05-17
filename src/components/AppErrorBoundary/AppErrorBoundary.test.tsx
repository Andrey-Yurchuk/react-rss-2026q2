import { describe, expect, it } from 'vitest';
import { createConsoleErrorSpy } from '../../test-utils/mocks';
import { render, screen } from '../../test-utils/render';
import { AppErrorBoundary } from './AppErrorBoundary';

function ThrowOnRender() {
  throw new Error('boom');
}

describe('AppErrorBoundary', () => {
  it('renders children when no error occurs', () => {
    render(
      <AppErrorBoundary>
        <p>Healthy child</p>
      </AppErrorBoundary>
    );

    expect(screen.getByText('Healthy child')).toBeInTheDocument();
  });

  it('renders fallback UI and logs when child throws', () => {
    const consoleErrorSpy = createConsoleErrorSpy();

    render(
      <AppErrorBoundary>
        <ThrowOnRender />
      </AppErrorBoundary>
    );

    expect(
      screen.getByRole('heading', { name: /something went wrong/i })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/the ui hit an unexpected error/i)
    ).toBeInTheDocument();
    expect(consoleErrorSpy).toHaveBeenCalled();
  });
});
