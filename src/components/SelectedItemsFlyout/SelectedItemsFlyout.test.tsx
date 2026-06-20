import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '../../test-utils/render';
import { SelectedItemsFlyout } from './SelectedItemsFlyout';

describe('SelectedItemsFlyout', () => {
  it('renders nothing when selectedCount is zero', () => {
    const { container } = render(
      <SelectedItemsFlyout
        selectedCount={0}
        onUnselectAll={vi.fn()}
        onDownload={vi.fn().mockResolvedValue(undefined)}
      />
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('renders count text and action buttons when at least one item is selected', () => {
    render(
      <SelectedItemsFlyout
        selectedCount={3}
        onUnselectAll={vi.fn()}
        onDownload={vi.fn().mockResolvedValue(undefined)}
      />
    );

    expect(screen.getByText('3 items selected')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /unselect all/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /download/i })
    ).toBeInTheDocument();
  });

  it('uses singular item label when exactly one item is selected', () => {
    render(
      <SelectedItemsFlyout
        selectedCount={1}
        onUnselectAll={vi.fn()}
        onDownload={vi.fn().mockResolvedValue(undefined)}
      />
    );

    expect(screen.getByText('1 item selected')).toBeInTheDocument();
  });

  it('invokes onUnselectAll when the unselect button is clicked', async () => {
    const user = userEvent.setup();
    const onUnselectAll = vi.fn();
    const onDownload = vi.fn().mockResolvedValue(undefined);

    render(
      <SelectedItemsFlyout
        selectedCount={2}
        onUnselectAll={onUnselectAll}
        onDownload={onDownload}
      />
    );

    await user.click(screen.getByRole('button', { name: /unselect all/i }));

    expect(onUnselectAll).toHaveBeenCalledTimes(1);
    expect(onDownload).not.toHaveBeenCalled();
  });

  it('invokes onDownload when the download button is clicked', async () => {
    const user = userEvent.setup();
    const onUnselectAll = vi.fn();
    const onDownload = vi.fn().mockResolvedValue(undefined);

    render(
      <SelectedItemsFlyout
        selectedCount={2}
        onUnselectAll={onUnselectAll}
        onDownload={onDownload}
      />
    );

    await user.click(screen.getByRole('button', { name: /download/i }));

    expect(onDownload).toHaveBeenCalledTimes(1);
    expect(onUnselectAll).not.toHaveBeenCalled();
  });

  it('exposes a landmark region with an accessible name', () => {
    render(
      <SelectedItemsFlyout
        selectedCount={1}
        onUnselectAll={vi.fn()}
        onDownload={vi.fn().mockResolvedValue(undefined)}
      />
    );

    expect(
      screen.getByRole('region', { name: /selected pokemon/i })
    ).toBeInTheDocument();
  });

  it('shows download error message and downloading state', () => {
    render(
      <SelectedItemsFlyout
        selectedCount={1}
        onUnselectAll={vi.fn()}
        onDownload={vi.fn().mockResolvedValue(undefined)}
        isDownloading
        downloadError="Download failed."
      />
    );

    expect(screen.getByRole('button', { name: /downloading/i })).toBeDisabled();
    expect(screen.getByRole('alert')).toHaveTextContent('Download failed.');
  });
});
