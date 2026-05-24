import { describe, expect, it } from 'vitest';
import type { SelectedPokemonItem } from '../store/selectedItemsStore';
import {
  buildSelectedItemsFilename,
  escapeCsvField,
  serializeSelectedItemsToCsv,
} from './csv';

describe('escapeCsvField', () => {
  it('returns an empty string for null and undefined', () => {
    expect(escapeCsvField(null)).toBe('');
    expect(escapeCsvField(undefined)).toBe('');
  });

  it('returns plain string for values without CSV special characters', () => {
    expect(escapeCsvField('pikachu')).toBe('pikachu');
    expect(escapeCsvField(25)).toBe('25');
  });

  it('wraps fields containing comma in double quotes', () => {
    expect(escapeCsvField('Types: grass, poison')).toBe(
      '"Types: grass, poison"'
    );
  });

  it('doubles embedded quotes and wraps the field', () => {
    expect(escapeCsvField('Say "hi"')).toBe('"Say ""hi"""');
  });

  it('wraps fields containing line breaks', () => {
    expect(escapeCsvField('Line 1\nLine 2')).toBe('"Line 1\nLine 2"');
    expect(escapeCsvField('Line 1\r\nLine 2')).toBe('"Line 1\r\nLine 2"');
  });
});

describe('serializeSelectedItemsToCsv', () => {
  it('writes header row and the provided rows', () => {
    const items: SelectedPokemonItem[] = [
      {
        id: 25,
        name: 'pikachu',
        description: 'Types: electric. Height: 4, weight: 60.',
        detailsUrl: 'https://pokeapi.co/api/v2/pokemon/25',
      },
    ];

    expect(serializeSelectedItemsToCsv(items)).toBe(
      [
        'id,name,description,detailsUrl',
        '25,pikachu,"Types: electric. Height: 4, weight: 60.",https://pokeapi.co/api/v2/pokemon/25',
      ].join('\r\n')
    );
  });

  it('returns only the header row for an empty selection', () => {
    expect(serializeSelectedItemsToCsv([])).toBe(
      'id,name,description,detailsUrl'
    );
  });

  it('escapes quotes inside fields by doubling them', () => {
    const items: SelectedPokemonItem[] = [
      {
        id: 1,
        name: 'odd"name',
        description: 'has "quote" inside',
        detailsUrl: 'https://example.com/1',
      },
    ];

    expect(serializeSelectedItemsToCsv(items)).toBe(
      [
        'id,name,description,detailsUrl',
        '1,"odd""name","has ""quote"" inside",https://example.com/1',
      ].join('\r\n')
    );
  });

  it('escapes line breaks inside fields', () => {
    const items: SelectedPokemonItem[] = [
      {
        id: 2,
        name: 'multi',
        description: 'Line 1\nLine 2',
        detailsUrl: 'https://example.com/2',
      },
    ];

    expect(serializeSelectedItemsToCsv(items)).toBe(
      [
        'id,name,description,detailsUrl',
        '2,multi,"Line 1\nLine 2",https://example.com/2',
      ].join('\r\n')
    );
  });

  it('serializes multiple items separated by CRLF', () => {
    const items: SelectedPokemonItem[] = [
      {
        id: 25,
        name: 'pikachu',
        description: 'Plain description.',
        detailsUrl: 'https://example.com/25',
      },
      {
        id: 1,
        name: 'bulbasaur',
        description: 'Another description.',
        detailsUrl: 'https://example.com/1',
      },
    ];

    expect(serializeSelectedItemsToCsv(items)).toBe(
      [
        'id,name,description,detailsUrl',
        '25,pikachu,Plain description.,https://example.com/25',
        '1,bulbasaur,Another description.,https://example.com/1',
      ].join('\r\n')
    );
  });
});

describe('buildSelectedItemsFilename', () => {
  it('builds a count-based filename', () => {
    expect(buildSelectedItemsFilename(1)).toBe('1_items.csv');
    expect(buildSelectedItemsFilename(15)).toBe('15_items.csv');
    expect(buildSelectedItemsFilename(0)).toBe('0_items.csv');
  });
});
