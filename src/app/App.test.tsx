import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { createConsoleErrorSpy } from '../test-utils/mocks';
import { render, screen } from '../test-utils/render';
import App from './App';

vi.mock('../services/pokemonApi', () => ({
  ApiRequestError: class ApiRequestError extends Error {
    status: number;

    constructor(message: string, status: number) {
      super(message);
      this.name = 'ApiRequestError';
      this.status = status;
    }
  },
  loadPokemonResults: vi.fn().mockResolvedValue({ items: [], totalCount: 0 }),
}));

describe('App', () => {
  it('shows Error Boundary fallback after trigger button click', async () => {
    const user = userEvent.setup();
    const consoleErrorSpy = createConsoleErrorSpy();

    render(<App />);
    await user.click(
      screen.getByRole('button', { name: /trigger error \(error boundary\)/i })
    );

    expect(
      screen.getByRole('heading', { name: /something went wrong/i })
    ).toBeInTheDocument();
    expect(consoleErrorSpy).toHaveBeenCalled();
  });
});
