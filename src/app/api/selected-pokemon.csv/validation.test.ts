import { describe, expect, it } from 'vitest';
import { validateCsvPayload } from './validation.ts';

describe('validateCsvPayload', () => {
  it('returns serialized CSV for valid payload', () => {
    const result = validateCsvPayload({
      items: [
        {
          id: 25,
          name: 'pikachu',
          description: 'Types: electric, fly. Height: 4, weight: 60.',
          detailsUrl: 'https://pokeapi.co/api/v2/pokemon/25',
        },
      ],
    });

    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }

    expect(result.filename).toBe('1_items.csv');
    expect(result.csv).toBe(
      [
        'id,name,description,detailsUrl',
        '25,pikachu,"Types: electric, fly. Height: 4, weight: 60.",https://pokeapi.co/api/v2/pokemon/25',
      ].join('\r\n')
    );
  });

  it('rejects empty payload', () => {
    expect(validateCsvPayload({ items: [] })).toEqual({
      ok: false,
      message: 'Selected items are required.',
    });
  });

  it('rejects invalid item shape', () => {
    expect(
      validateCsvPayload({
        items: [{ id: '25', name: 'pikachu' }],
      })
    ).toEqual({
      ok: false,
      message: 'Selected items contain invalid data.',
    });
  });
});
