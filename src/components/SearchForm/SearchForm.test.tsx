import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { POKEMON_SEARCH_STORAGE_KEY } from '../../constants';
import { getNavigationSnapshot } from '../../hooks/navigationStore.ts';
import { seedLocalStorage } from '../../test-utils/mocks';
import { render, screen } from '../../test-utils/render';
import { resetMockNavigation } from '../../test-utils/navigationStore.ts';
import { SearchForm } from './SearchForm';

describe('SearchForm', () => {
  it('renders search input and submit button', () => {
    render(<SearchForm defaultQuery="" onSubmit={vi.fn()} />);

    expect(
      screen.getByLabelText(/search pok.mon by exact name/i)
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument();
  });

  it('hydrates search term from localStorage when URL query is empty', () => {
    seedLocalStorage(POKEMON_SEARCH_STORAGE_KEY, '  PiKaChu ');

    render(<SearchForm defaultQuery="" onSubmit={vi.fn()} />);

    expect(
      screen.getByLabelText(/search pok.mon by exact name/i)
    ).toHaveValue('pikachu');
  });

  it('calls onSubmit with normalized query when form is submitted', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(<SearchForm defaultQuery="" onSubmit={onSubmit} />);

    await user.type(
      screen.getByLabelText(/search pok.mon by exact name/i),
      '  PiKaChu '
    );
    await user.click(screen.getByRole('button', { name: /search/i }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith('pikachu');
  });

  it('navigates through onSubmit callback with query params', async () => {
    const user = userEvent.setup();
    resetMockNavigation('/?page=1');

    render(
      <SearchForm
        defaultQuery=""
        onSubmit={(normalizedQuery) => {
          resetMockNavigation(`/?page=1&query=${normalizedQuery}`);
        }}
      />
    );

    await user.type(
      screen.getByLabelText(/search pok.mon by exact name/i),
      'pikachu'
    );
    await user.click(screen.getByRole('button', { name: /search/i }));

    expect(getNavigationSnapshot().searchParams.toString()).toBe(
      'page=1&query=pikachu'
    );
  });
});
