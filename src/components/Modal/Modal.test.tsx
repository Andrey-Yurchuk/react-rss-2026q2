import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '../../test-utils/render';
import { Modal } from './Modal';

function ModalHarness() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setIsOpen(true)}>
        Open modal
      </button>
      <Modal
        isOpen={isOpen}
        title="Profile form"
        onClose={() => setIsOpen(false)}
      >
        <p>Modal content</p>
      </Modal>
    </>
  );
}

describe('Modal', () => {
  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <Modal isOpen={false} title="Hidden modal" onClose={vi.fn()}>
        <p>Hidden content</p>
      </Modal>
    );

    expect(within(container).queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders the dialog through a portal when isOpen is true', () => {
    const { container } = render(
      <Modal isOpen title="Visible modal" onClose={vi.fn()}>
        <p>Visible content</p>
      </Modal>
    );

    const dialog = screen.getByRole('dialog');

    expect(within(container).queryByRole('dialog')).not.toBeInTheDocument();
    expect(dialog).toBeInTheDocument();
    expect(document.body).toContainElement(dialog);
    expect(screen.getByText('Visible content')).toBeInTheDocument();
  });

  it('exposes dialog accessibility attributes and links the title', () => {
    render(
      <Modal isOpen title="Accessible modal" onClose={vi.fn()}>
        <p>Accessible content</p>
      </Modal>
    );

    const dialog = screen.getByRole('dialog');
    const title = screen.getByRole('heading', { name: /accessible modal/i });

    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby', title.id);
  });

  it('calls onClose when Escape is pressed', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(
      <Modal isOpen title="Escape modal" onClose={onClose}>
        <p>Escape content</p>
      </Modal>
    );

    await user.keyboard('{Escape}');

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when the backdrop is clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(
      <Modal isOpen title="Backdrop modal" onClose={onClose}>
        <p>Backdrop content</p>
      </Modal>
    );

    await user.click(screen.getByTestId('modal-backdrop'));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not call onClose when dialog content is clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(
      <Modal isOpen title="Inside modal" onClose={onClose}>
        <p>Inside content</p>
      </Modal>
    );

    await user.click(screen.getByText('Inside content'));

    expect(onClose).not.toHaveBeenCalled();
  });

  it('moves focus into the modal when it opens', async () => {
    const user = userEvent.setup();

    render(<ModalHarness />);

    await user.click(screen.getByRole('button', { name: /open modal/i }));

    expect(screen.getByRole('button', { name: /close dialog/i })).toHaveFocus();
  });

  it('returns focus to the trigger after closing with Escape', async () => {
    const user = userEvent.setup();

    render(<ModalHarness />);

    const trigger = screen.getByRole('button', { name: /open modal/i });
    await user.click(trigger);
    await user.keyboard('{Escape}');

    expect(trigger).toHaveFocus();
  });

  it('returns focus to the trigger after the modal unmounts', async () => {
    const user = userEvent.setup();

    render(<ModalHarness />);

    const trigger = screen.getByRole('button', { name: /open modal/i });
    await user.click(trigger);
    await user.click(screen.getByRole('button', { name: /close dialog/i }));

    expect(trigger).toHaveFocus();
  });

  it('keeps Tab focus inside the dialog', async () => {
    const user = userEvent.setup();

    render(
      <Modal isOpen title="Trap modal" onClose={vi.fn()}>
        <button type="button">First action</button>
        <button type="button">Second action</button>
      </Modal>
    );

    const closeButton = screen.getByRole('button', { name: /close dialog/i });
    const firstAction = screen.getByRole('button', { name: /first action/i });
    const secondAction = screen.getByRole('button', {
      name: /second action/i,
    });

    expect(closeButton).toHaveFocus();

    await user.tab();
    expect(firstAction).toHaveFocus();

    await user.tab();
    expect(secondAction).toHaveFocus();

    await user.tab();
    expect(closeButton).toHaveFocus();

    await user.tab({ shift: true });
    expect(secondAction).toHaveFocus();
  });
});
