import type { SelectedPokemonItem } from '../store/selectedItemsStore';

const CSV_FIELD_NEEDS_QUOTES = /["\n\r,]/;

const SELECTED_ITEM_COLUMNS = [
  'id',
  'name',
  'description',
  'detailsUrl',
] as const satisfies ReadonlyArray<keyof SelectedPokemonItem>;

export function escapeCsvField(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }
  const stringValue = String(value);
  if (CSV_FIELD_NEEDS_QUOTES.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
}

export function serializeSelectedItemsToCsv(
  items: readonly SelectedPokemonItem[]
): string {
  const header = SELECTED_ITEM_COLUMNS.join(',');
  const rows = items.map((item) =>
    SELECTED_ITEM_COLUMNS.map((column) => escapeCsvField(item[column])).join(',')
  );
  return [header, ...rows].join('\r\n');
}

export function buildSelectedItemsFilename(count: number): string {
  return `${count}_items.csv`;
}
