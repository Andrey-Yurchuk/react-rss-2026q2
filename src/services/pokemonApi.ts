import { LIST_PAGE_SIZE, POKEAPI_POKEMON_URL } from '../constants';

export type PokemonCardModel = {
  name: string;
  description: string;
};

type PokemonTypeEntry = {
  type: { name: string };
};

type PokemonDetailJson = {
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
    name: detail.name,
    description,
  };
}

export async function loadPokemonListPage(): Promise<PokemonCardModel[]> {
  const listRes = await fetch(
    `${POKEAPI_POKEMON_URL}?limit=${LIST_PAGE_SIZE}&offset=0`
  );
  if (!listRes.ok) {
    throw new ApiRequestError(messageForStatus(listRes.status), listRes.status);
  }
  const listJson = (await listRes.json()) as ListJson;
  const cards = await Promise.all(
    listJson.results.map(async (item) => {
      const res = await fetch(item.url);
      if (!res.ok) {
        throw new ApiRequestError(messageForStatus(res.status), res.status);
      }
      const detail = (await res.json()) as PokemonDetailJson;
      return mapCard(detail);
    })
  );
  return cards;
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

export async function loadPokemonResults(
  normalizedQuery: string
): Promise<PokemonCardModel[]> {
  if (normalizedQuery === '') {
    return loadPokemonListPage();
  }
  if (!isPokemonResourceSlug(normalizedQuery)) {
    throw new ApiRequestError(
      'For Pokemon search, use a Pokedex number or an English name (Latin letters, digits, and hyphens only)',
      400
    );
  }
  return loadPokemonByName(normalizedQuery);
}
