import {
  buildSelectedItemsFilename,
  serializeSelectedItemsToCsv,
} from '../../../utils/csv.ts';
import type { SelectedPokemonItem } from '../../../store/selectedItemsStore.ts';

type SelectedPokemonPayload = {
  items?: unknown;
};

export type CsvValidationResult =
  | { ok: true; items: SelectedPokemonItem[]; csv: string; filename: string }
  | { ok: false; message: string };

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim() !== '';
}

function parseSelectedPokemonItem(value: unknown): SelectedPokemonItem | null {
  if (typeof value !== 'object' || value === null) {
    return null;
  }

  const candidate = value as Record<string, unknown>;
  const idCandidate = candidate.id;
  const nameCandidate = candidate.name;
  const descriptionCandidate = candidate.description;
  const detailsUrlCandidate = candidate.detailsUrl;

  if (
    typeof idCandidate !== 'number' ||
    !Number.isInteger(idCandidate) ||
    idCandidate <= 0
  ) {
    return null;
  }

  if (
    !isNonEmptyString(nameCandidate) ||
    !isNonEmptyString(descriptionCandidate)
  ) {
    return null;
  }

  if (!isNonEmptyString(detailsUrlCandidate)) {
    return null;
  }

  try {
    const parsedUrl = new URL(detailsUrlCandidate);
    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
      return null;
    }
  } catch {
    return null;
  }

  return {
    id: idCandidate,
    name: nameCandidate,
    description: descriptionCandidate,
    detailsUrl: detailsUrlCandidate,
  };
}

export function validateCsvPayload(payload: unknown): CsvValidationResult {
  if (typeof payload !== 'object' || payload === null) {
    return { ok: false, message: 'Request body must be a JSON object.' };
  }

  const { items } = payload as SelectedPokemonPayload;
  if (!Array.isArray(items) || items.length === 0) {
    return { ok: false, message: 'Selected items are required.' };
  }

  const parsedItems: SelectedPokemonItem[] = [];
  for (const rawItem of items) {
    const parsedItem = parseSelectedPokemonItem(rawItem);
    if (parsedItem === null) {
      return {
        ok: false,
        message: 'Selected items contain invalid data.',
      };
    }
    parsedItems.push(parsedItem);
  }

  return {
    ok: true,
    items: parsedItems,
    csv: serializeSelectedItemsToCsv(parsedItems),
    filename: buildSelectedItemsFilename(parsedItems.length),
  };
}
