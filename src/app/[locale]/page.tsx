import { setRequestLocale } from 'next-intl/server';
import { PokemonHomeView } from '../../components/PokemonHomeView/index.ts';
import { redirect } from '../../i18n/navigation.ts';
import { getPokemonListErrorMessage } from '../../queries/pokemonQueries.ts';
import { loadPokemonResults } from '../../services/pokemonApi.ts';
import {
  buildHomeSearchHref,
  hasPageSearchParam,
  parseHomeSearchParams,
  type HomeSearchParamsInput,
} from '../../utils/homeSearchParams.ts';

type HomePageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<HomeSearchParamsInput>;
};

export default async function HomePage({
  params,
  searchParams,
}: HomePageProps) {
  const { locale } = await params;
  const resolvedSearchParams = await searchParams;
  setRequestLocale(locale);

  const normalizedParams = parseHomeSearchParams(resolvedSearchParams);

  if (!hasPageSearchParam(resolvedSearchParams)) {
    redirect({
      href: buildHomeSearchHref(normalizedParams),
      locale,
    });
  }

  let items: Awaited<ReturnType<typeof loadPokemonResults>>['items'] = [];
  let totalCount = 0;
  let errorMessage: string | null = null;

  try {
    const result = await loadPokemonResults(
      normalizedParams.query,
      normalizedParams.page
    );
    items = result.items;
    totalCount = result.totalCount;
  } catch (error) {
    errorMessage = getPokemonListErrorMessage(error);
  }

  return (
    <PokemonHomeView
      page={normalizedParams.page}
      query={normalizedParams.query}
      detailsId={normalizedParams.detailsId}
      items={items}
      totalCount={totalCount}
      errorMessage={errorMessage}
    />
  );
}
