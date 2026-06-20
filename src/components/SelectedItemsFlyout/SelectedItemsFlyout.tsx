import { useTranslations } from 'next-intl';

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
  const t = useTranslations('SelectedFlyout');

  if (selectedCount === 0) {
    return null;
  }

  return (
    <section className="selected-flyout" aria-label={t('label')}>
      <p className="selected-flyout__count" aria-live="polite">
        {t('count', { count: selectedCount })}
      </p>
      <div className="selected-flyout__actions">
        <button
          type="button"
          className="selected-flyout__button selected-flyout__button--secondary"
          onClick={onUnselectAll}
        >
          {t('unselectAll')}
        </button>
        <button
          type="button"
          className="selected-flyout__button"
          onClick={onDownload}
        >
          {t('download')}
        </button>
      </div>
    </section>
  );
}
