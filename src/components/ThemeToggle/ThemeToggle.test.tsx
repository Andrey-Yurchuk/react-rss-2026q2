import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import { render, screen, within } from '../../test-utils/render';
import { ThemeProvider } from '../../context/ThemeContext.tsx';
import { ThemeToggle } from './ThemeToggle';

describe('ThemeToggle', () => {
  afterEach(() => {
    document.documentElement.removeAttribute('data-theme');
  });

  it('renders an accessible group of Light and Dark buttons', () => {
    render(
      <ThemeProvider initialTheme="light">
        <ThemeToggle />
      </ThemeProvider>
    );

    const group = screen.getByRole('group', { name: /theme/i });
    expect(group).toBeInTheDocument();
    expect(within(group).getByRole('button', { name: /light/i })).toBeInTheDocument();
    expect(within(group).getByRole('button', { name: /dark/i })).toBeInTheDocument();
  });

  it('marks the currently active option as pressed', () => {
    render(
      <ThemeProvider initialTheme="dark">
        <ThemeToggle />
      </ThemeProvider>
    );

    expect(screen.getByRole('button', { name: /dark/i })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    expect(screen.getByRole('button', { name: /light/i })).toHaveAttribute(
      'aria-pressed',
      'false'
    );
  });

  it('switches active theme when user clicks the inactive option', async () => {
    const user = userEvent.setup();
    render(
      <ThemeProvider initialTheme="light">
        <ThemeToggle />
      </ThemeProvider>
    );

    await user.click(screen.getByRole('button', { name: /dark/i }));

    expect(screen.getByRole('button', { name: /dark/i })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    expect(screen.getByRole('button', { name: /light/i })).toHaveAttribute(
      'aria-pressed',
      'false'
    );
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
  });
});
