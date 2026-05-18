import { LIST_PAGE_SIZE, POKEAPI_POKEMON_URL } from '../constants';

export type PokemonCardModel = {
  id: number;
  name: string;
  description: string;
};

export type PokemonListPageResult = {
  items: PokemonCardModel[];
  totalCount: number;
};

type PokemonTypeEntry = {
  type: { name: string };
};

type PokemonDetailJson = {
  id: number;
  name: string;
  height: number;
  weight: number;
  types: PokemonTypeEntry[];
};

type ListResultItem = {
  name: string;
  url: string;
};

type ListJson = {
  count: number;
  results: ListResultItem[];
};

export class ApiRequestError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiRequestError';
    this.status = status;
  }
}

function messageForStatus(status: number): string {
  if (status === 404) {
    return 'No Pokemon found for that name.';
  }
  if (status >= 500) {
    return 'The server returned an error. Please try again later.';
  }
  if (status >= 400) {
    return 'The request could not be completed.';
  }
  return 'Something went wrong.';
}

function isPokemonResourceSlug(value: string): boolean {
  return /^[a-z0-9-]+$/.test(value);
}

function mapCard(detail: PokemonDetailJson): PokemonCardModel {
  const types = detail.types.map((t) => t.type.name).join(', ');
  const description = `Types: ${types}. Height: ${detail.height}, weight: ${detail.weight}.`;
  return {
    id: detail.id,
    name: detail.name,
    description,
  };
}

export function totalPagesForCount(totalCount: number): number {
  return Math.max(1, Math.ceil(totalCount / LIST_PAGE_SIZE));
}

export async function loadPokemonListPage(
  page: number
): Promise<PokemonListPageResult> {
  const safePage = Number.isFinite(page) && page >= 1 ? page : 1;
  const offset = (safePage - 1) * LIST_PAGE_SIZE;
  const listRes = await fetch(
    `${POKEAPI_POKEMON_URL}?limit=${LIST_PAGE_SIZE}&offset=${offset}`
  );
  if (!listRes.ok) {
    throw new ApiRequestError(messageForStatus(listRes.status), listRes.status);
  }
  const listJson = (await listRes.json()) as ListJson;
  const items = await Promise.all(
    listJson.results.map(async (item) => {
      const res = await fetch(item.url);
      if (!res.ok) {
        throw new ApiRequestError(messageForStatus(res.status), res.status);
      }
      const detail = (await res.json()) as PokemonDetailJson;
      return mapCard(detail);
    })
  );
  return { items, totalCount: listJson.count };
}

export async function loadPokemonByName(
  name: string
): Promise<PokemonCardModel[]> {
  const normalized = name.trim().toLowerCase();
  const res = await fetch(
    `${POKEAPI_POKEMON_URL}/${encodeURIComponent(normalized)}`
  );
  if (!res.ok) {
    throw new ApiRequestError(messageForStatus(res.status), res.status);
  }
  const detail = (await res.json()) as PokemonDetailJson;
  return [mapCard(detail)];
}

export async function loadPokemonById(id: number): Promise<PokemonCardModel> {
  const res = await fetch(`${POKEAPI_POKEMON_URL}/${id}`);
  if (!res.ok) {
    throw new ApiRequestError(messageForStatus(res.status), res.status);
  }
  const detail = (await res.json()) as PokemonDetailJson;
  return mapCard(detail);
}

export async function loadPokemonResults(
  normalizedQuery: string,
  page: number
): Promise<PokemonListPageResult> {
  if (normalizedQuery === '') {
    return loadPokemonListPage(page);
  }
  if (!isPokemonResourceSlug(normalizedQuery)) {
    throw new ApiRequestError(
      'For Pokemon search, use a Pokedex number or an English name (Latin letters, digits, and hyphens only)',
      400
    );
  }
  const items = await loadPokemonByName(normalizedQuery);
  return { items, totalCount: items.length };
}
