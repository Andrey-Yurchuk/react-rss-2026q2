import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '../../test-utils/render';
import { Card } from './Card';

const pikachu = {
  id: 25,
  name: 'pikachu',
  description: 'Types: electric. Height: 4, weight: 60.',
};

describe('Card', () => {
  it('renders pokemon name and description', () => {
    render(<Card item={pikachu} />);

    expect(screen.getByRole('heading', { name: 'pikachu' })).toBeInTheDocument();
    expect(
      screen.getByText('Types: electric. Height: 4, weight: 60.')
    ).toBeInTheDocument();
  });

  it('calls onSelect when the card is clicked', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();

    render(<Card item={pikachu} onSelect={onSelect} />);

    await user.click(screen.getByRole('button', { name: /view details for pikachu/i }));

    expect(onSelect).toHaveBeenCalledWith(25);
  });

  it('calls onSelect when Enter or Space is pressed', () => {
    const onSelect = vi.fn();

    render(<Card item={pikachu} selected onSelect={onSelect} />);
    const card = screen.getByRole('button', { name: /view details for pikachu/i });

    fireEvent.keyDown(card, { key: 'Enter' });
    fireEvent.keyDown(card, { key: ' ' });

    expect(onSelect).toHaveBeenCalledTimes(2);
    expect(onSelect).toHaveBeenCalledWith(25);
  });
});
