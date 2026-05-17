import { describe, expect, it } from 'vitest';
import { render, screen } from '../../test-utils/render';
import { CardList } from './CardList';

describe('CardList', () => {
  it('renders all cards when items are provided', () => {
    render(
      <CardList
        items={[
          {
            name: 'pikachu',
            description: 'Types: electric. Height: 4, weight: 60.',
          },
          {
            name: 'bulbasaur',
            description: 'Types: grass, poison. Height: 7, weight: 69.',
          },
        ]}
      />
    );

    expect(screen.getByRole('heading', { name: 'pikachu' })).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'bulbasaur' })
    ).toBeInTheDocument();
    expect(screen.queryByText('No results to show.')).not.toBeInTheDocument();
  });

  it('shows empty state when items are empty', () => {
    render(<CardList items={[]} />);

    expect(screen.getByText('No results to show.')).toBeInTheDocument();
  });
});
