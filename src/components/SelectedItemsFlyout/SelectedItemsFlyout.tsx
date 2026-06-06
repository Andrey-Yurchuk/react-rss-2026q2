type SelectedItemsFlyoutProps = {
  selectedCount: number;
  onUnselectAll: () => void;
  onDownload: () => void;
};

export function SelectedItemsFlyout({
  selectedCount,
  onUnselectAll,
  onDownload,
}: SelectedItemsFlyoutProps) {
  if (selectedCount === 0) {
    return null;
  }

  const itemWord = selectedCount === 1 ? 'item' : 'items';

  return (
    <section className="selected-flyout" aria-label="Selected Pokemon">
      <p className="selected-flyout__count" aria-live="polite">
        {selectedCount} {itemWord} selected
      </p>
      <div className="selected-flyout__actions">
        <button
          type="button"
          className="selected-flyout__button selected-flyout__button--secondary"
          onClick={onUnselectAll}
        >
          Unselect all
        </button>
        <button
          type="button"
          className="selected-flyout__button"
          onClick={onDownload}
        >
          Download
        </button>
      </div>
    </section>
  );
}
