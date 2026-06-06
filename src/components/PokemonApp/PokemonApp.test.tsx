import userEvent from '@testing-library/user-event';
import { Route, Routes, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { POKEAPI_POKEMON_URL, POKEMON_SEARCH_STORAGE_KEY } from '../../constants';
import { PROFILE_COUNTRIES } from '../../constants/profileForm';
import {
  selectSubmissions,
  useFormSubmissionsStore,
} from '../../store/formSubmissionsStore';
import { useSelectedItemsStore } from '../../store/selectedItemsStore';
import { seedLocalStorage } from '../../test-utils/mocks';
import {
  fireEvent,
  renderWithRouter,
  screen,
  waitFor,
} from '../../test-utils/render';
import { AboutPage } from '../../pages/AboutPage/index.ts';
import { PokemonDetailsPanel } from '../PokemonDetailsPanel/index.ts';
import { PokemonApp } from './PokemonApp';

vi.mock('../../services/pokemonApi', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../services/pokemonApi')>();
  return {
    ...actual,
    loadPokemonResults: vi.fn(),
    loadPokemonById: vi.fn(),
  };
});

import {
  ApiRequestError,
  loadPokemonById,
  loadPokemonResults,
} from '../../services/pokemonApi';

const loadPokemonResultsMock = vi.mocked(loadPokemonResults);
const loadPokemonByIdMock = vi.mocked(loadPokemonById);

function countResultsCalls(query: string, page: number) {
  return loadPokemonResultsMock.mock.calls.filter(
    ([actualQuery, actualPage]) => actualQuery === query && actualPage === page
  ).length;
}

beforeEach(() => {
  loadPokemonResultsMock.mockReset();
  loadPokemonByIdMock.mockReset();
  useSelectedItemsStore.setState({ selectedItems: [] });
  localStorage.removeItem(POKEMON_SEARCH_STORAGE_KEY);
});

function renderPokemonApp(route = '/?page=1') {
  return renderWithRouter(<PokemonApp />, { route });
}

function LocationProbe() {
  const location = useLocation();
  return <p data-testid="current-location">{location.pathname}{location.search}</p>;
}

function renderPokemonAppRoutes(route = '/?page=1') {
  return renderWithRouter(
    <>
      <Routes>
        <Route path="/" element={<PokemonApp />}>
          <Route index element={<PokemonDetailsPanel />} />
        </Route>
      </Routes>
      <LocationProbe />
    </>,
    { route }
  );
}

function renderPokemonAppWithAboutRoute(route = '/?page=1') {
  return renderWithRouter(
    <>
      <Routes>
        <Route path="/" element={<PokemonApp />}>
          <Route index element={<PokemonDetailsPanel />} />
        </Route>
        <Route path="/about" element={<AboutPage />} />
      </Routes>
      <LocationProbe />
    </>,
    { route }
  );
}

describe('PokemonApp', () => {
  describe('results query behavior', () => {
  it('loads initial data from hydrated localStorage value', async () => {
    seedLocalStorage(POKEMON_SEARCH_STORAGE_KEY, '  PIKACHU ');
    loadPokemonResultsMock.mockResolvedValueOnce({
      items: [
        {
          id: 25,
          name: 'pikachu',
          description: 'Types: electric. Height: 4, weight: 60.',
        },
      ],
      totalCount: 1,
    });

    renderPokemonApp();

    await waitFor(() => {
      expect(loadPokemonResultsMock).toHaveBeenCalledWith('pikachu', 1);
    });
    expect(await screen.findByRole('heading', { name: 'pikachu' })).toBeInTheDocument();
  });

  it('shows loading state while request is pending', async () => {
    let resolveRequest: (value: {
      items: Array<{ id: number; name: string; description: string }>;
      totalCount: number;
    }) => void = () => undefined;
    const pendingRequest = new Promise<{
      items: Array<{ id: number; name: string; description: string }>;
      totalCount: number;
    }>((resolve) => {
      resolveRequest = resolve;
    });
    loadPokemonResultsMock.mockReturnValueOnce(pendingRequest);

    renderPokemonApp();

    expect(screen.getByText('Loading…')).toBeInTheDocument();
    resolveRequest({ items: [], totalCount: 0 });
    await waitFor(() =>
      expect(screen.queryByText('Loading…')).not.toBeInTheDocument()
    );
  });

  it('shows API error message when request fails with ApiRequestError', async () => {
    loadPokemonResultsMock.mockRejectedValueOnce(
      new ApiRequestError('No Pokemon found for that name.', 404)
    );

    renderPokemonApp();

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'No Pokemon found for that name.'
    );
  });

  it('normalizes search query, saves it to localStorage and avoids duplicate request', async () => {
    const user = userEvent.setup();
    loadPokemonResultsMock.mockImplementation(async (query) => ({
      items:
        query === 'pikachu'
          ? [
              {
                id: 25,
                name: 'pikachu',
                description: 'Types: electric. Height: 4, weight: 60.',
              },
            ]
          : [],
      totalCount: query === 'pikachu' ? 1 : 0,
    }));

    renderPokemonApp();
    await waitFor(() => expect(countResultsCalls('', 1)).toBe(1));

    await user.clear(screen.getByLabelText(/search pok.mon by exact name/i));
    await user.type(
      screen.getByLabelText(/search pok.mon by exact name/i),
      '  PiKaChu '
    );
    await user.click(screen.getByRole('button', { name: /search/i }));

    await waitFor(() => expect(countResultsCalls('pikachu', 1)).toBe(1));
    expect(localStorage.getItem(POKEMON_SEARCH_STORAGE_KEY)).toBe('pikachu');

    await user.click(screen.getByRole('button', { name: /search/i }));

    expect(countResultsCalls('pikachu', 1)).toBe(1);
  });

  it('does not persist search query to localStorage when only paginating', async () => {
    const user = userEvent.setup();
    loadPokemonResultsMock.mockImplementation(async (_query, pageNum) => ({
      items: [
        {
          id: pageNum,
          name: `pokemon-${pageNum}`,
          description: `Page ${pageNum} item.`,
        },
      ],
      totalCount: 40,
    }));

    renderPokemonApp('/?page=1');

    expect(await screen.findByRole('heading', { name: 'pokemon-1' })).toBeInTheDocument();
    expect(countResultsCalls('', 1)).toBe(1);
    expect(localStorage.getItem(POKEMON_SEARCH_STORAGE_KEY)).toBeNull();

    await user.click(screen.getByRole('button', { name: /next/i }));

    await waitFor(() => expect(countResultsCalls('', 2)).toBe(1));
    expect(localStorage.getItem(POKEMON_SEARCH_STORAGE_KEY)).toBeNull();
  });

  it('manually refreshes the current results query', async () => {
    loadPokemonResultsMock.mockResolvedValue({
      items: [
        {
          id: 1,
          name: 'bulbasaur',
          description: 'Types: grass, poison. Height: 7, weight: 69.',
        },
      ],
      totalCount: 40,
    });

    const user = userEvent.setup();
    renderPokemonApp();

    await waitFor(() => expect(loadPokemonResultsMock).toHaveBeenCalledWith('', 1));
    expect(await screen.findByRole('heading', { name: 'bulbasaur' })).toBeInTheDocument();

    expect(countResultsCalls('', 1)).toBe(1);

    await user.click(screen.getByRole('button', { name: /refresh results/i }));

    await waitFor(() => expect(countResultsCalls('', 1)).toBe(2));
    expect(await screen.findByRole('heading', { name: 'bulbasaur' })).toBeInTheDocument();
  });

  it('reuses cached results when returning to a previously visited page', async () => {
    loadPokemonResultsMock.mockImplementation(async (_query, pageNum) => ({
      items: [
        {
          id: pageNum,
          name: `pokemon-${pageNum}`,
          description: `Page ${pageNum} item.`,
        },
      ],
      totalCount: 40,
    }));

    const user = userEvent.setup();
    renderPokemonApp('/?page=1');

    await waitFor(() => expect(loadPokemonResultsMock).toHaveBeenCalledWith('', 1));
    expect(await screen.findByRole('heading', { name: 'pokemon-1' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /next/i }));

    await waitFor(() => expect(loadPokemonResultsMock).toHaveBeenCalledWith('', 2));
    expect(await screen.findByRole('heading', { name: 'pokemon-2' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /previous/i }));

    expect(await screen.findByRole('heading', { name: 'pokemon-1' })).toBeInTheDocument();

    expect(countResultsCalls('', 1)).toBe(1);
    expect(countResultsCalls('', 2)).toBe(1);
  });

  it('loads results when page changes in URL', async () => {
    loadPokemonResultsMock.mockImplementation(async (_query, pageNum) => ({
      items: [
        {
          id: pageNum,
          name: `pokemon-${pageNum}`,
          description: `Page ${pageNum} item.`,
        },
      ],
      totalCount: 40,
    }));

    const user = userEvent.setup();
    renderPokemonApp('/?page=1');

    await waitFor(() => expect(loadPokemonResultsMock).toHaveBeenCalledWith('', 1));
    expect(await screen.findByRole('heading', { name: 'pokemon-1' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /next/i }));

    await waitFor(() => expect(loadPokemonResultsMock).toHaveBeenCalledWith('', 2));
    expect(screen.getByRole('heading', { name: 'pokemon-2' })).toBeInTheDocument();
    expect(countResultsCalls('', 1)).toBe(1);
    expect(countResultsCalls('', 2)).toBe(1);
  });

  it('shows Refreshing… while manually refreshing cached results', async () => {
    let resolveRefresh: (value: {
      items: Array<{ id: number; name: string; description: string }>;
      totalCount: number;
    }) => void = () => undefined;
    loadPokemonResultsMock.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveRefresh = resolve;
        })
    );

    const user = userEvent.setup();
    renderPokemonApp();

    await waitFor(() => expect(countResultsCalls('', 1)).toBe(1));
    resolveRefresh({
      items: [
        {
          id: 1,
          name: 'bulbasaur',
          description: 'Types: grass, poison. Height: 7, weight: 69.',
        },
      ],
      totalCount: 40,
    });
    expect(await screen.findByRole('heading', { name: 'bulbasaur' })).toBeInTheDocument();

    loadPokemonResultsMock.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveRefresh = resolve;
        })
    );

    await user.click(screen.getByRole('button', { name: /refresh results/i }));

    expect(screen.getByText('Refreshing…')).toBeInTheDocument();
    resolveRefresh({
      items: [
        {
          id: 1,
          name: 'bulbasaur',
          description: 'Types: grass, poison. Height: 7, weight: 69.',
        },
      ],
      totalCount: 40,
    });
    await waitFor(() =>
      expect(screen.queryByText('Refreshing…')).not.toBeInTheDocument()
    );
    expect(countResultsCalls('', 1)).toBe(2);
  });

  it('shows generic error when list request fails unexpectedly', async () => {
    loadPokemonResultsMock.mockRejectedValueOnce(new Error('network down'));

    renderPokemonApp();

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Unable to reach the Pokemon API. Check your connection.'
    );
  });
  });

  it('opens details in the Outlet and closes them while preserving the page', async () => {
    const user = userEvent.setup();
    loadPokemonResultsMock.mockResolvedValue({
      items: [
        {
          id: 25,
          name: 'pikachu',
          description: 'Types: electric. Height: 4, weight: 60.',
        },
      ],
      totalCount: 40,
    });
    let resolveDetails: (value: {
      id: number;
      name: string;
      description: string;
    }) => void = () => undefined;
    loadPokemonByIdMock.mockReturnValue(
      new Promise((resolve) => {
        resolveDetails = resolve;
      })
    );

    renderPokemonAppRoutes('/?page=2');

    expect(screen.queryByRole('complementary', { name: /pokemon details/i })).not
      .toBeInTheDocument();
    await screen.findByRole('heading', { name: 'pikachu' });

    await user.click(screen.getByRole('button', { name: /view details for pikachu/i }));

    expect(screen.getByText('Loading details…')).toBeInTheDocument();
    resolveDetails({
      id: 25,
      name: 'pikachu',
      description: 'Types: electric. Height: 4, weight: 60.',
    });
    expect(await screen.findByText('Pokedex #25')).toBeInTheDocument();
    expect(screen.getByTestId('current-location')).toHaveTextContent(
      '/?page=2&details=25'
    );

    await user.click(screen.getByRole('button', { name: /close/i }));

    await waitFor(() =>
      expect(screen.queryByRole('complementary', { name: /pokemon details/i })).not
        .toBeInTheDocument()
    );
    expect(screen.getByTestId('current-location')).toHaveTextContent('/?page=2');
  });

  it('keeps the details panel open when changing page', async () => {
    const user = userEvent.setup();
    loadPokemonResultsMock.mockImplementation(async (_query, pageNum) => ({
      items: [
        {
          id: pageNum,
          name: `pokemon-${pageNum}`,
          description: `Page ${pageNum} item.`,
        },
      ],
      totalCount: 40,
    }));
    loadPokemonByIdMock.mockResolvedValue({
      id: 1,
      name: 'bulbasaur',
      description: 'Types: grass, poison. Height: 7, weight: 69.',
    });

    renderPokemonAppRoutes('/?page=1&details=1');

    expect(await screen.findByText('Pokedex #1')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /next/i }));

    await waitFor(() => expect(loadPokemonResultsMock).toHaveBeenCalledWith('', 2));
    expect(screen.getByText('Pokedex #1')).toBeInTheDocument();
    expect(screen.getByTestId('current-location')).toHaveTextContent(
      '/?page=2&details=1'
    );
  });

  it('shows pagination only after items are loaded', async () => {
    loadPokemonResultsMock.mockResolvedValueOnce({
      items: [
        {
          id: 1,
          name: 'bulbasaur',
          description: 'Types: grass, poison. Height: 7, weight: 69.',
        },
      ],
      totalCount: 40,
    });

    renderPokemonApp();

    expect(screen.queryByRole('navigation', { name: /results pagination/i })).not
      .toBeInTheDocument();

    expect(await screen.findByText('Page 1 of 2')).toBeInTheDocument();
  });

  it('resets page to 1 in the URL when search input changes', async () => {
    const user = userEvent.setup();
    loadPokemonResultsMock.mockResolvedValue({
      items: [
        {
          id: 2,
          name: 'pokemon-2',
          description: 'Page 2 item.',
        },
      ],
      totalCount: 40,
    });

    renderPokemonAppRoutes('/?page=2');

    await screen.findByRole('heading', { name: 'pokemon-2' });
    await user.type(screen.getByLabelText(/search pok.mon by exact name/i), 'a');

    await waitFor(() =>
      expect(screen.getByTestId('current-location')).toHaveTextContent('/?page=1')
    );
  });

  it('closes details when clicking the main results panel', async () => {
    loadPokemonResultsMock.mockResolvedValue({
      items: [
        {
          id: 25,
          name: 'pikachu',
          description: 'Types: electric. Height: 4, weight: 60.',
        },
      ],
      totalCount: 40,
    });
    loadPokemonByIdMock.mockResolvedValue({
      id: 25,
      name: 'pikachu',
      description: 'Types: electric. Height: 4, weight: 60.',
    });

    renderPokemonAppRoutes('/?page=2&details=25');

    expect(await screen.findByText('Pokedex #25')).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole('main', { name: /main pokemon results panel/i })
    );

    await waitFor(() =>
      expect(screen.queryByRole('complementary', { name: /pokemon details/i })).not
        .toBeInTheDocument()
    );
    expect(screen.getByTestId('current-location')).toHaveTextContent('/?page=2');
  });

  it('adds page=1 to the URL on first visit when page param is missing', async () => {
    loadPokemonResultsMock.mockResolvedValue({ items: [], totalCount: 0 });

    renderPokemonAppRoutes('/');

    await waitFor(() =>
      expect(screen.getByTestId('current-location')).toHaveTextContent('/?page=1')
    );
  });

  it('toggles Zustand selection on checkbox click without opening details', async () => {
    const user = userEvent.setup();
    loadPokemonResultsMock.mockResolvedValue({
      items: [
        {
          id: 25,
          name: 'pikachu',
          description: 'Types: electric. Height: 4, weight: 60.',
        },
      ],
      totalCount: 1,
    });

    renderPokemonAppRoutes('/?page=1');

    expect(await screen.findByRole('heading', { name: 'pikachu' })).toBeInTheDocument();
    expect(useSelectedItemsStore.getState().selectedItems).toEqual([]);

    await user.click(screen.getByRole('checkbox', { name: /select pikachu/i }));

    expect(useSelectedItemsStore.getState().selectedItems).toEqual([
      {
        id: 25,
        name: 'pikachu',
        description: 'Types: electric. Height: 4, weight: 60.',
        detailsUrl: `${POKEAPI_POKEMON_URL}/25`,
      },
    ]);
    expect(screen.getByTestId('current-location')).toHaveTextContent('/?page=1');
    expect(
      screen.queryByRole('complementary', { name: /pokemon details/i })
    ).not.toBeInTheDocument();
    expect(loadPokemonByIdMock).not.toHaveBeenCalled();
  });

  it('opens details on card body click without modifying Zustand selection', async () => {
    const user = userEvent.setup();
    loadPokemonResultsMock.mockResolvedValue({
      items: [
        {
          id: 25,
          name: 'pikachu',
          description: 'Types: electric. Height: 4, weight: 60.',
        },
      ],
      totalCount: 1,
    });
    loadPokemonByIdMock.mockResolvedValue({
      id: 25,
      name: 'pikachu',
      description: 'Types: electric. Height: 4, weight: 60.',
    });

    renderPokemonAppRoutes('/?page=1');

    await screen.findByRole('heading', { name: 'pikachu' });
    await user.click(
      screen.getByRole('button', { name: /view details for pikachu/i })
    );

    expect(await screen.findByText('Pokedex #25')).toBeInTheDocument();
    expect(screen.getByTestId('current-location')).toHaveTextContent(
      '/?page=1&details=25'
    );
    expect(useSelectedItemsStore.getState().selectedItems).toEqual([]);
    expect(
      screen.getByRole('checkbox', { name: /select pikachu/i })
    ).not.toBeChecked();
  });

  it('keeps checkbox selection across page navigation', async () => {
    const user = userEvent.setup();
    loadPokemonResultsMock.mockImplementation(async (_query, pageNum) => ({
      items: [
        {
          id: pageNum,
          name: `pokemon-${pageNum}`,
          description: `Page ${pageNum} item.`,
        },
      ],
      totalCount: 40,
    }));

    renderPokemonAppRoutes('/?page=1');

    expect(await screen.findByRole('heading', { name: 'pokemon-1' })).toBeInTheDocument();
    await user.click(screen.getByRole('checkbox', { name: /select pokemon-1/i }));
    expect(useSelectedItemsStore.getState().selectedItems.map((i) => i.id)).toEqual([1]);

    await user.click(screen.getByRole('button', { name: /next/i }));
    expect(await screen.findByRole('heading', { name: 'pokemon-2' })).toBeInTheDocument();
    expect(useSelectedItemsStore.getState().selectedItems.map((i) => i.id)).toEqual([1]);
    expect(
      screen.getByRole('checkbox', { name: /select pokemon-2/i })
    ).not.toBeChecked();

    await user.click(screen.getByRole('button', { name: /previous/i }));
    expect(await screen.findByRole('heading', { name: 'pokemon-1' })).toBeInTheDocument();
    expect(
      screen.getByRole('checkbox', { name: /select pokemon-1/i })
    ).toBeChecked();
  });

  it('keeps checkbox selection across details open/close', async () => {
    const user = userEvent.setup();
    loadPokemonResultsMock.mockResolvedValue({
      items: [
        {
          id: 25,
          name: 'pikachu',
          description: 'Types: electric. Height: 4, weight: 60.',
        },
      ],
      totalCount: 1,
    });
    loadPokemonByIdMock.mockResolvedValue({
      id: 25,
      name: 'pikachu',
      description: 'Types: electric. Height: 4, weight: 60.',
    });

    renderPokemonAppRoutes('/?page=1');

    await screen.findByRole('heading', { name: 'pikachu' });
    await user.click(screen.getByRole('checkbox', { name: /select pikachu/i }));

    await user.click(
      screen.getByRole('button', { name: /view details for pikachu/i })
    );
    expect(await screen.findByText('Pokedex #25')).toBeInTheDocument();
    expect(useSelectedItemsStore.getState().selectedItems.map((i) => i.id)).toEqual([25]);
    expect(
      screen.getByRole('checkbox', { name: /select pikachu/i })
    ).toBeChecked();

    await user.click(screen.getByRole('button', { name: /close/i }));
    await waitFor(() =>
      expect(
        screen.queryByRole('complementary', { name: /pokemon details/i })
      ).not.toBeInTheDocument()
    );
    expect(useSelectedItemsStore.getState().selectedItems.map((i) => i.id)).toEqual([25]);
    expect(
      screen.getByRole('checkbox', { name: /select pikachu/i })
    ).toBeChecked();
  });

  it('shows flyout with count after selecting items and clears it via Unselect all', async () => {
    const user = userEvent.setup();
    loadPokemonResultsMock.mockResolvedValue({
      items: [
        {
          id: 25,
          name: 'pikachu',
          description: 'Types: electric. Height: 4, weight: 60.',
        },
        {
          id: 1,
          name: 'bulbasaur',
          description: 'Types: grass, poison. Height: 7, weight: 69.',
        },
      ],
      totalCount: 2,
    });

    renderPokemonAppRoutes('/?page=1');

    await screen.findByRole('heading', { name: 'pikachu' });
    expect(
      screen.queryByRole('region', { name: /selected pokemon/i })
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole('checkbox', { name: /select pikachu/i }));

    const flyout = await screen.findByRole('region', {
      name: /selected pokemon/i,
    });
    expect(flyout).toHaveTextContent('1 item selected');
    expect(
      screen.getByRole('button', { name: /download/i })
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole('checkbox', { name: /select bulbasaur/i })
    );

    expect(
      screen.getByRole('region', { name: /selected pokemon/i })
    ).toHaveTextContent('2 items selected');

    await user.click(screen.getByRole('button', { name: /unselect all/i }));

    await waitFor(() =>
      expect(
        screen.queryByRole('region', { name: /selected pokemon/i })
      ).not.toBeInTheDocument()
    );
    expect(useSelectedItemsStore.getState().selectedItems).toEqual([]);
  });

  it('keeps Zustand selection when navigating to /about and back', async () => {
    const user = userEvent.setup();
    loadPokemonResultsMock.mockResolvedValue({
      items: [
        {
          id: 25,
          name: 'pikachu',
          description: 'Types: electric. Height: 4, weight: 60.',
        },
      ],
      totalCount: 1,
    });

    renderPokemonAppWithAboutRoute('/?page=1');

    await screen.findByRole('heading', { name: 'pikachu' });
    await user.click(screen.getByRole('checkbox', { name: /select pikachu/i }));
    expect(useSelectedItemsStore.getState().selectedItems.map((i) => i.id)).toEqual([25]);

    await user.click(screen.getByRole('link', { name: /about/i }));
    await waitFor(() =>
      expect(screen.getByTestId('current-location')).toHaveTextContent('/about')
    );
    expect(screen.queryByRole('heading', { name: 'pikachu' })).not.toBeInTheDocument();
    expect(useSelectedItemsStore.getState().selectedItems.map((i) => i.id)).toEqual([25]);

    await user.click(screen.getByRole('link', { name: /back to pokemon search/i }));

    expect(await screen.findByRole('heading', { name: 'pikachu' })).toBeInTheDocument();
    expect(useSelectedItemsStore.getState().selectedItems.map((i) => i.id)).toEqual([25]);
    expect(
      screen.getByRole('checkbox', { name: /select pikachu/i })
    ).toBeChecked();
    expect(countResultsCalls('', 1)).toBe(1);
  });

  it('downloads selected items as CSV via the Download button using native browser APIs', async () => {
    const user = userEvent.setup();
    loadPokemonResultsMock.mockResolvedValue({
      items: [
        {
          id: 25,
          name: 'pikachu',
          description: 'Types: electric, fly. Height: 4, weight: 60.',
        },
      ],
      totalCount: 1,
    });

    if (typeof URL.createObjectURL !== 'function') {
      URL.createObjectURL = () => '';
    }
    if (typeof URL.revokeObjectURL !== 'function') {
      URL.revokeObjectURL = () => undefined;
    }
    const createObjectURLSpy = vi
      .spyOn(URL, 'createObjectURL')
      .mockReturnValue('blob:test-csv-url');
    const revokeObjectURLSpy = vi
      .spyOn(URL, 'revokeObjectURL')
      .mockImplementation(() => undefined);
    const clickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => undefined);

    renderPokemonAppRoutes('/?page=1');

    await screen.findByRole('heading', { name: 'pikachu' });
    await user.click(screen.getByRole('checkbox', { name: /select pikachu/i }));

    const createdAnchors: HTMLAnchorElement[] = [];
    const originalCreateElement = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation(((tag: string) => {
      const element = originalCreateElement(tag);
      if (tag.toLowerCase() === 'a') {
        createdAnchors.push(element as HTMLAnchorElement);
      }
      return element;
    }) as typeof document.createElement);

    await user.click(screen.getByRole('button', { name: /download/i }));

    expect(createObjectURLSpy).toHaveBeenCalledTimes(1);
    const blob = createObjectURLSpy.mock.calls[0][0] as Blob;
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toBe('text/csv;charset=utf-8');
    await expect(blob.text()).resolves.toBe(
      [
        'id,name,description,detailsUrl',
        '25,pikachu,"Types: electric, fly. Height: 4, weight: 60.",https://pokeapi.co/api/v2/pokemon/25',
      ].join('\r\n')
    );

    expect(createdAnchors).toHaveLength(1);
    const anchor = createdAnchors[0];
    expect(anchor.download).toBe('1_items.csv');
    expect(anchor.getAttribute('href')).toBe('blob:test-csv-url');
    expect(clickSpy).toHaveBeenCalledTimes(1);
    expect(document.body.contains(anchor)).toBe(false);
    expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:test-csv-url');

    expect(
      screen.getByRole('region', { name: /selected pokemon/i })
    ).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /unselect all/i }));
    await waitFor(() =>
      expect(
        screen.queryByRole('region', { name: /selected pokemon/i })
      ).not.toBeInTheDocument()
    );
    expect(useSelectedItemsStore.getState().selectedItems).toEqual([]);
  });

  describe('profile form modals', () => {
    function resetFormSubmissionsStore() {
      useFormSubmissionsStore.setState({
        countries: [...PROFILE_COUNTRIES],
        submissions: [],
        lastSubmissionId: null,
      });
    }

    function createPngFile(size = 4, name = 'avatar.png'): File {
      return new File([new Uint8Array(size)], name, { type: 'image/png' });
    }

    function assignFileToInput(input: HTMLInputElement, file: File) {
      const fileList = Object.assign([file], {
        item: (index: number) => fileList[index] ?? null,
      });

      Object.defineProperty(input, 'files', {
        configurable: true,
        value: fileList,
      });
    }

    async function fillReactHookProfileForm(
      user: ReturnType<typeof userEvent.setup>
    ) {
      await user.type(screen.getByLabelText('Name'), 'Bob');
      await user.type(screen.getByLabelText('Age'), '31');
      await user.type(screen.getByLabelText('Email'), 'bob@example.com');
      await user.selectOptions(screen.getByLabelText('Gender'), 'male');
      await user.click(
        screen.getByLabelText('I accept the Terms and Conditions')
      );
      await user.upload(
        screen.getByLabelText('Profile image'),
        createPngFile(4, 'bob.png')
      );
      await user.type(screen.getByLabelText('Password'), 'Secret1@');
      await user.type(screen.getByLabelText('Confirm password'), 'Secret1@');
      await user.type(screen.getByLabelText('Country'), 'France');
    }

    async function fillUncontrolledProfileForm(
      user: ReturnType<typeof userEvent.setup>
    ) {
      await user.type(screen.getByLabelText('Name'), 'Alice');
      await user.type(screen.getByLabelText('Age'), '28');
      await user.type(screen.getByLabelText('Email'), 'alice@example.com');
      await user.selectOptions(screen.getByLabelText('Gender'), 'female');
      await user.click(
        screen.getByLabelText('I accept the Terms and Conditions')
      );

      const imageInput = screen.getByLabelText(
        'Profile image'
      ) as HTMLInputElement;
      assignFileToInput(imageInput, createPngFile());

      await user.type(screen.getByLabelText('Password'), 'Secret1@');
      await user.type(screen.getByLabelText('Confirm password'), 'Secret1@');
      await user.type(screen.getByLabelText('Country'), 'Poland');
    }

    beforeEach(() => {
      resetFormSubmissionsStore();
    });

    it('shows two profile form launcher buttons on the main page', () => {
      renderPokemonApp();

      expect(
        screen.getByRole('button', {
          name: /open uncontrolled profile form/i,
        })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', {
          name: /open react hook form profile/i,
        })
      ).toBeInTheDocument();
    });

    it('opens the uncontrolled profile form in a dialog', async () => {
      const user = userEvent.setup();

      renderPokemonApp();

      await user.click(
        screen.getByRole('button', {
          name: /open uncontrolled profile form/i,
        })
      );

      const dialog = screen.getByRole('dialog');
      expect(
        screen.getByRole('heading', { name: /uncontrolled profile form/i })
      ).toBeInTheDocument();
      expect(dialog).toContainElement(
        document.getElementById('uncontrolled-profile-name')
      );
    });

    it('opens the React Hook Form profile form in a dialog', async () => {
      const user = userEvent.setup();

      renderPokemonApp();

      await user.click(
        screen.getByRole('button', {
          name: /open react hook form profile/i,
        })
      );

      const dialog = screen.getByRole('dialog');
      expect(
        screen.getByRole('heading', { name: /react hook form profile/i })
      ).toBeInTheDocument();
      expect(dialog).toContainElement(
        document.getElementById('rhf-profile-name')
      );
    });

    it('closes the modal with Escape and returns focus to the trigger button', async () => {
      const user = userEvent.setup();

      renderPokemonApp();

      const trigger = screen.getByRole('button', {
        name: /open uncontrolled profile form/i,
      });
      await user.click(trigger);

      expect(screen.getByRole('dialog')).toBeInTheDocument();

      await user.keyboard('{Escape}');

      await waitFor(() =>
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      );
      expect(trigger).toHaveFocus();
    });

    it('closes the modal with the close button and returns focus to the trigger button', async () => {
      const user = userEvent.setup();

      renderPokemonApp();

      const trigger = screen.getByRole('button', {
        name: /open react hook form profile/i,
      });
      await user.click(trigger);

      await user.click(screen.getByRole('button', { name: /close dialog/i }));

      await waitFor(() =>
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      );
      expect(trigger).toHaveFocus();
    });

    it('keeps search input and results rendering working after opening and closing a modal', async () => {
      const user = userEvent.setup();
      loadPokemonResultsMock.mockResolvedValue({
        items: [
          {
            id: 25,
            name: 'pikachu',
            description: 'Types: electric. Height: 4, weight: 60.',
          },
        ],
        totalCount: 1,
      });

      renderPokemonApp();

      await waitFor(() =>
        expect(screen.getByRole('heading', { name: 'pikachu' })).toBeInTheDocument()
      );

      await user.click(
        screen.getByRole('button', {
          name: /open uncontrolled profile form/i,
        })
      );
      expect(screen.getByRole('dialog')).toBeInTheDocument();

      await user.keyboard('{Escape}');
      await waitFor(() =>
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      );

      const searchInput = screen.getByLabelText(/search pok.mon by exact name/i);
      await user.clear(searchInput);
      await user.type(searchInput, 'pikachu');
      await user.click(screen.getByRole('button', { name: /search/i }));

      expect(await screen.findByRole('heading', { name: 'pikachu' })).toBeInTheDocument();
      expect(countResultsCalls('pikachu', 1)).toBe(1);
    });

    it('closes the modal and stores a submission after a successful uncontrolled form submit', async () => {
      const user = userEvent.setup();

      renderPokemonApp();

      await user.click(
        screen.getByRole('button', {
          name: /open uncontrolled profile form/i,
        })
      );

      await fillUncontrolledProfileForm(user);
      await user.click(screen.getByRole('button', { name: /submit profile/i }));

      await waitFor(() =>
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      );

      const [submission] = selectSubmissions(useFormSubmissionsStore.getState());

      expect(submission).toMatchObject({
        source: 'uncontrolled',
        name: 'Alice',
        age: 28,
        email: 'alice@example.com',
        gender: 'female',
        termsAccepted: true,
        imageName: 'avatar.png',
        country: 'Poland',
      });
      expect(submission.imageBase64).toMatch(/^data:image\/png;base64,/);
      expect(submission).not.toHaveProperty('password');

      expect(
        screen.getByRole('region', { name: /profile form submissions/i })
      ).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Alice' })).toBeInTheDocument();
      expect(screen.getByText('alice@example.com')).toBeInTheDocument();
      expect(screen.getByText('Uncontrolled form')).toBeInTheDocument();
      expect(
        screen.getByRole('img', {
          name: 'Profile photo for Alice (avatar.png)',
        })
      ).toHaveAttribute('src', submission.imageBase64);
    });

    it('closes the modal and shows a React Hook Form submission in history after valid submit', async () => {
      const user = userEvent.setup();

      renderPokemonApp();

      await user.click(
        screen.getByRole('button', {
          name: /open react hook form profile/i,
        })
      );

      await fillReactHookProfileForm(user);

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /submit profile/i })
        ).toBeEnabled();
      });

      await user.click(screen.getByRole('button', { name: /submit profile/i }));

      await waitFor(() =>
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      );

      const [submission] = selectSubmissions(useFormSubmissionsStore.getState());

      expect(submission).toMatchObject({
        source: 'react-hook-form',
        name: 'Bob',
        email: 'bob@example.com',
        gender: 'male',
        country: 'France',
        imageName: 'bob.png',
      });
      expect(submission).not.toHaveProperty('password');

      expect(screen.getByRole('heading', { name: 'Bob' })).toBeInTheDocument();
      expect(screen.getByText('bob@example.com')).toBeInTheDocument();
      expect(screen.getByText('React Hook Form')).toBeInTheDocument();
    });
  });
});
