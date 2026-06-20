import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { POKEMON_SEARCH_STORAGE_KEY } from '../../constants';
import { seedLocalStorage } from '../../test-utils/mocks';
import { render, screen } from '../../test-utils/render';
import { Search } from './Search';

describe('Search', () => {
  it('hydrates normalized value from localStorage on mount', () => {
    const onStorageHydrated = vi.fn();
    seedLocalStorage(POKEMON_SEARCH_STORAGE_KEY, '  PiKaChu ');

    render(
      <Search
        value=""
        onChange={vi.fn()}
        onSearch={vi.fn()}
        onStorageHydrated={onStorageHydrated}
      />
    );

    expect(onStorageHydrated).toHaveBeenCalledWith('pikachu');
  });

  it('calls onChange and onSearch when the form is submitted', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const onSearch = vi.fn();

    render(
      <Search
        value="pikachu"
        onChange={onChange}
        onSearch={onSearch}
        onStorageHydrated={vi.fn()}
      />
    );

    await user.clear(screen.getByLabelText(/search pok.mon by exact name/i));
    await user.type(
      screen.getByLabelText(/search pok.mon by exact name/i),
      'bulbasaur'
    );
    await user.click(screen.getByRole('button', { name: /search/i }));

    expect(onChange).toHaveBeenCalled();
    expect(onSearch).toHaveBeenCalledTimes(1);
  });
});
