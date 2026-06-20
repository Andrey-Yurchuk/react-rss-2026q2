import { describe, expect, it } from 'vitest';
import { POST } from './route.ts';

describe('POST /api/selected-pokemon.csv', () => {
  it('returns CSV response for valid payload', async () => {
    const request = new Request('http://localhost/api/selected-pokemon.csv', {
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
            detailsUrl: 'https://pokeapi.co/api/v2/pokemon/25',
          },
        ],
      }),
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('text/csv; charset=utf-8');
    expect(response.headers.get('Content-Disposition')).toBe(
      'attachment; filename="1_items.csv"'
    );
    await expect(response.text()).resolves.toBe(
      [
        'id,name,description,detailsUrl',
        '25,pikachu,"Types: electric, fly. Height: 4, weight: 60.",https://pokeapi.co/api/v2/pokemon/25',
      ].join('\r\n')
    );
  });

  it('returns 400 for empty payload', async () => {
    const request = new Request('http://localhost/api/selected-pokemon.csv', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ items: [] }),
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: 'Selected items are required.',
    });
  });

  it('returns 400 for malformed json body', async () => {
    const request = new Request('http://localhost/api/selected-pokemon.csv', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: '{',
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: 'Invalid JSON payload.',
    });
  });
});
