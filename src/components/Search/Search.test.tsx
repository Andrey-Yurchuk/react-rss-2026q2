import userEvent from '@testing-library/user-event';
import type { ComponentProps } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { POKEMON_SEARCH_STORAGE_KEY } from '../../constants';
import { seedLocalStorage } from '../../test-utils/mocks';
import { render, screen } from '../../test-utils/render';
import { Search } from './Search';

function createProps(overrides?: Partial<ComponentProps<typeof Search>>) {
  return {
    value: '',
    onChange: vi.fn(),
    onSearch: vi.fn(),
    onStorageHydrated: vi.fn(),
    ...overrides,
  };
}

describe('Search', () => {
  it('renders search input and submit button', () => {
    const props = createProps();
    render(<Search {...props} />);

    expect(
      screen.getByLabelText(/search pok.mon by exact name/i)
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument();
  });

  it('hydrates search term from localStorage on mount', () => {
    seedLocalStorage(POKEMON_SEARCH_STORAGE_KEY, '  PiKaChu ');
    const props = createProps();

    render(<Search {...props} />);

    expect(props.onStorageHydrated).toHaveBeenCalledTimes(1);
    expect(props.onStorageHydrated).toHaveBeenCalledWith('pikachu');
  });

  it('hydrates empty term when localStorage has no value', () => {
    const props = createProps();

    render(<Search {...props} />);

    expect(props.onStorageHydrated).toHaveBeenCalledTimes(1);
    expect(props.onStorageHydrated).toHaveBeenCalledWith('');
  });

  it('calls onChange when user types in input', async () => {
    const user = userEvent.setup();
    const props = createProps();

    render(<Search {...props} />);

    await user.type(screen.getByLabelText(/search pok.mon by exact name/i), 'pi');

    expect(props.onChange).toHaveBeenCalledTimes(2);
    expect(props.onChange).toHaveBeenNthCalledWith(1, 'p');
    expect(props.onChange).toHaveBeenNthCalledWith(2, 'i');
  });

  it('calls onSearch when form is submitted', async () => {
    const user = userEvent.setup();
    const props = createProps();

    render(<Search {...props} />);

    await user.click(screen.getByRole('button', { name: /search/i }));

    expect(props.onSearch).toHaveBeenCalledTimes(1);
  });
});
