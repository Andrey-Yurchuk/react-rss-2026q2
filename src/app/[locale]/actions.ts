'use server';

import { redirect } from 'next/navigation';
import { buildSearchRedirectHref } from './searchRedirect.ts';

export async function submitPokemonSearch(locale: string, formData: FormData) {
  redirect(buildSearchRedirectHref(locale, formData));
}
