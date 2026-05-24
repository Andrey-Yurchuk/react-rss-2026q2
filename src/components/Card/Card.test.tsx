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
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
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

  it('renders checkbox with accessible name when onSelectionToggle is provided', () => {
    render(<Card item={pikachu} onSelectionToggle={vi.fn()} />);

    const checkbox = screen.getByRole('checkbox', { name: /select pikachu/i });
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).not.toBeChecked();
  });

  it('reflects selectionChecked in the checkbox state', () => {
    render(
      <Card
        item={pikachu}
        selectionChecked
        onSelectionToggle={vi.fn()}
      />
    );

    expect(
      screen.getByRole('checkbox', { name: /select pikachu/i })
    ).toBeChecked();
  });

  it('calls onSelectionToggle with the item when the checkbox is toggled', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const onSelectionToggle = vi.fn();

    render(
      <Card
        item={pikachu}
        onSelect={onSelect}
        onSelectionToggle={onSelectionToggle}
      />
    );

    await user.click(screen.getByRole('checkbox', { name: /select pikachu/i }));

    expect(onSelectionToggle).toHaveBeenCalledTimes(1);
    expect(onSelectionToggle).toHaveBeenCalledWith(pikachu);
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('does not open details when the checkbox is clicked', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const onSelectionToggle = vi.fn();

    render(
      <Card
        item={pikachu}
        onSelect={onSelect}
        onSelectionToggle={onSelectionToggle}
      />
    );

    await user.click(screen.getByRole('checkbox', { name: /select pikachu/i }));

    expect(onSelect).not.toHaveBeenCalled();
  });

  it('opens details on click outside the checkbox even when selection is enabled', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const onSelectionToggle = vi.fn();

    render(
      <Card
        item={pikachu}
        onSelect={onSelect}
        onSelectionToggle={onSelectionToggle}
      />
    );

    await user.click(screen.getByRole('heading', { name: 'pikachu' }));

    expect(onSelect).toHaveBeenCalledWith(25);
    expect(onSelectionToggle).not.toHaveBeenCalled();
  });

  it('does not open details when Space is pressed while the checkbox has focus', () => {
    const onSelect = vi.fn();
    const onSelectionToggle = vi.fn();

    render(
      <Card
        item={pikachu}
        onSelect={onSelect}
        onSelectionToggle={onSelectionToggle}
      />
    );

    const checkbox = screen.getByRole('checkbox', { name: /select pikachu/i });
    fireEvent.keyDown(checkbox, { key: ' ' });

    expect(onSelect).not.toHaveBeenCalled();
  });
});
