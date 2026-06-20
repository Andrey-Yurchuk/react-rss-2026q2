import userEvent from '@testing-library/user-event';
import { useSyncExternalStore } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { POKEAPI_POKEMON_URL, POKEMON_SEARCH_STORAGE_KEY } from '../../constants';
import { getNavigationSnapshot, subscribeNavigation } from '../../hooks/navigationStore.ts';
import { Link } from '../../i18n/navigation.ts';
import { useSelectedItemsStore } from '../../store/selectedItemsStore';
import { seedLocalStorage } from '../../test-utils/mocks';
import { TestNavigationProbe } from '../TestNavigationProbe/index.ts';
import {
  renderWithRouter,
  screen,
  waitFor,
} from '../../test-utils/render';
import { PokemonHomeTestHarness } from '../../test-utils/pokemonHomeHarness.tsx';
import { resetMockNavigation } from '../../test-utils/navigationStore.ts';

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

function TestHomeAboutSwitch() {
  const { pathname } = useSyncExternalStore(
    subscribeNavigation,
    getNavigationSnapshot,
    getNavigationSnapshot
  );

  return pathname === '/about' ? <MockAboutPage /> : <PokemonHomeTestHarness />;
}

function MockAboutPage() {
  return (
    <main className="static-page static-page--about">
      <h1>Pokedex browser</h1>
      <a href="https://github.com/Andrey-Yurchuk">Andrey Yurchuk</a>
      <a href="https://rs.school/courses/reactjs">RS School ReactJS course</a>
      <Link href="/?page=1">Back to Pokemon search</Link>
    </main>
  );
}

beforeEach(() => {
  loadPokemonResultsMock.mockReset();
  loadPokemonByIdMock.mockReset();
  useSelectedItemsStore.setState({ selectedItems: [] });
  localStorage.removeItem(POKEMON_SEARCH_STORAGE_KEY);
});

function renderPokemonHome(href = '/?page=1') {
  resetMockNavigation(href);
  return renderWithRouter(<PokemonHomeTestHarness />, { href });
}

function renderPokemonHomeWithAboutSwitch(href = '/?page=1') {
  resetMockNavigation(href);
  return renderWithRouter(
    <>
      <TestHomeAboutSwitch />
      <TestNavigationProbe />
    </>,
    { href }
  );
}

describe('PokemonHomeView', () => {
  describe('results query behavior', () => {
  it('hydrates search input from localStorage without changing the URL query', async () => {
    seedLocalStorage(POKEMON_SEARCH_STORAGE_KEY, '  PIKACHU ');
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

    renderPokemonHome();

    await waitFor(() => expect(countResultsCalls('', 1)).toBe(1));
    expect(
      screen.getByLabelText(/search pok.mon by exact name/i)
    ).toHaveValue('pikachu');
    expect(screen.getByTestId('current-location')).toHaveTextContent('/?page=1');
  });

  it('shows API error message when request fails with ApiRequestError', async () => {
    loadPokemonResultsMock.mockRejectedValueOnce(
      new ApiRequestError('No Pokemon found for that name.', 404)
    );

    renderPokemonHome();

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

    renderPokemonHome();
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

    renderPokemonHome('/?page=1');

    expect(await screen.findByRole('heading', { name: 'pokemon-1' })).toBeInTheDocument();
    expect(countResultsCalls('', 1)).toBe(1);
    expect(localStorage.getItem(POKEMON_SEARCH_STORAGE_KEY)).toBeNull();

    await user.click(screen.getByRole('link', { name: /next/i }));

    await waitFor(() => expect(countResultsCalls('', 2)).toBe(1));
    expect(localStorage.getItem(POKEMON_SEARCH_STORAGE_KEY)).toBeNull();
  });

  it('loads previous page results after navigating back', async () => {
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
    renderPokemonHome('/?page=1');

    await waitFor(() => expect(loadPokemonResultsMock).toHaveBeenCalledWith('', 1));
    expect(await screen.findByRole('heading', { name: 'pokemon-1' })).toBeInTheDocument();

    await user.click(screen.getByRole('link', { name: /next/i }));

    await waitFor(() => expect(loadPokemonResultsMock).toHaveBeenCalledWith('', 2));
    expect(await screen.findByRole('heading', { name: 'pokemon-2' })).toBeInTheDocument();

    await user.click(screen.getByRole('link', { name: /previous/i }));

    expect(await screen.findByRole('heading', { name: 'pokemon-1' })).toBeInTheDocument();

    expect(countResultsCalls('', 1)).toBe(2);
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
    renderPokemonHome('/?page=1');

    await waitFor(() => expect(loadPokemonResultsMock).toHaveBeenCalledWith('', 1));
    expect(await screen.findByRole('heading', { name: 'pokemon-1' })).toBeInTheDocument();

    await user.click(screen.getByRole('link', { name: /next/i }));

    await waitFor(() => expect(loadPokemonResultsMock).toHaveBeenCalledWith('', 2));
    expect(screen.getByRole('heading', { name: 'pokemon-2' })).toBeInTheDocument();
    expect(countResultsCalls('', 1)).toBe(1);
    expect(countResultsCalls('', 2)).toBe(1);
  });

  it('shows generic error when list request fails unexpectedly', async () => {
    loadPokemonResultsMock.mockRejectedValueOnce(new Error('network down'));

    renderPokemonHome();

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Unable to reach the Pokemon API. Check your connection.'
    );
  });
  });

  it('opens details in the details panel and closes them while preserving the page', async () => {
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

    renderPokemonHome('/?page=2');

    expect(screen.queryByRole('complementary', { name: /pokemon details/i })).not
      .toBeInTheDocument();
    await screen.findByRole('heading', { name: 'pikachu' });

    await user.click(screen.getByRole('link', { name: /view details/i }));

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

    renderPokemonHome('/?page=1&details=1');

    expect(await screen.findByText('Pokedex #1')).toBeInTheDocument();
    await user.click(screen.getByRole('link', { name: /next/i }));

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

    renderPokemonHome();

    expect(screen.queryByRole('navigation', { name: /results pagination/i })).not
      .toBeInTheDocument();

    expect(await screen.findByText('Page 1 of 2')).toBeInTheDocument();
  });

  it('adds page=1 to the URL on first visit when page param is missing', async () => {
    loadPokemonResultsMock.mockResolvedValue({ items: [], totalCount: 0 });

    renderPokemonHome('/');

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

    renderPokemonHome('/?page=1');

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

    renderPokemonHome('/?page=1');

    await screen.findByRole('heading', { name: 'pikachu' });
    await user.click(
      screen.getByRole('link', { name: /view details/i })
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

    renderPokemonHome('/?page=1');

    expect(await screen.findByRole('heading', { name: 'pokemon-1' })).toBeInTheDocument();
    await user.click(screen.getByRole('checkbox', { name: /select pokemon-1/i }));
    expect(useSelectedItemsStore.getState().selectedItems.map((i) => i.id)).toEqual([1]);

    await user.click(screen.getByRole('link', { name: /next/i }));
    expect(await screen.findByRole('heading', { name: 'pokemon-2' })).toBeInTheDocument();
    expect(useSelectedItemsStore.getState().selectedItems.map((i) => i.id)).toEqual([1]);
    expect(
      screen.getByRole('checkbox', { name: /select pokemon-2/i })
    ).not.toBeChecked();

    await user.click(screen.getByRole('link', { name: /previous/i }));
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

    renderPokemonHome('/?page=1');

    await screen.findByRole('heading', { name: 'pikachu' });
    await user.click(screen.getByRole('checkbox', { name: /select pikachu/i }));

    await user.click(
      screen.getByRole('link', { name: /view details/i })
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

    renderPokemonHome('/?page=1');

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

    renderPokemonHomeWithAboutSwitch('/?page=1');

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
    expect(countResultsCalls('', 1)).toBe(2);
  });

  it('downloads selected items as CSV via server route response', async () => {
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
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(
        [
          'id,name,description,detailsUrl',
          '25,pikachu,"Types: electric, fly. Height: 4, weight: 60.",https://pokeapi.co/api/v2/pokemon/25',
        ].join('\r\n'),
        {
          status: 200,
          headers: {
            'Content-Type': 'text/csv; charset=utf-8',
            'Content-Disposition': 'attachment; filename="1_items.csv"',
          },
        }
      )
    );
    vi.stubGlobal('fetch', fetchMock);

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

    renderPokemonHome('/?page=1');

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

    expect(fetchMock).toHaveBeenCalledWith('/api/selected-pokemon.csv', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        items: [
          {
            id: 25,
            name: 'pikachu',
            description: 'Types: electric, fly. Height: 4, weight: 60.',
            detailsUrl: `${POKEAPI_POKEMON_URL}/25`,
          },
        ],
      }),
    });
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
    vi.unstubAllGlobals();
  });

  it('shows inline error when csv download request fails', async () => {
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
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>().mockResolvedValue(
        new Response(JSON.stringify({ error: 'Download failed.' }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        })
      )
    );

    renderPokemonHome('/?page=1');
    await screen.findByRole('heading', { name: 'pikachu' });
    await user.click(screen.getByRole('checkbox', { name: /select pikachu/i }));
    await user.click(screen.getByRole('button', { name: /download/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Download failed.');
    vi.unstubAllGlobals();
  });
});
