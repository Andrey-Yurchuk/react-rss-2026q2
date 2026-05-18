import { describe, expect, it } from 'vitest';
import { render, screen } from '../../test-utils/render';
import { Card } from './Card';

describe('Card', () => {
  it('renders pokemon name and description', () => {
    render(
      <Card
        item={{
          id: 25,
          name: 'pikachu',
          description: 'Types: electric. Height: 4, weight: 60.',
        }}
      />
    );

    expect(screen.getByRole('heading', { name: 'pikachu' })).toBeInTheDocument();
    expect(
      screen.getByText('Types: electric. Height: 4, weight: 60.')
    ).toBeInTheDocument();
  });
});
