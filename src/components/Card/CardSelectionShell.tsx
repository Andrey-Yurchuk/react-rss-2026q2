'use client';

import type { ReactNode } from 'react';
import { useSelectedItemsStore } from '../../store/selectedItemsStore';

type CardSelectionShellProps = {
  itemId: number;
  detailsSelected: boolean;
  children: ReactNode;
};

export function CardSelectionShell({
  itemId,
  detailsSelected,
  children,
}: CardSelectionShellProps) {
  const selectionChecked = useSelectedItemsStore((state) =>
    state.selectedItems.some((selectedItem) => selectedItem.id === itemId)
  );

  const classNames = ['card'];
  if (detailsSelected) {
    classNames.push('card--selected');
  }
  if (selectionChecked) {
    classNames.push('card--selection-checked');
  }

  return (
    <article
      className={classNames.join(' ')}
      aria-current={detailsSelected ? 'true' : undefined}
    >
      {children}
    </article>
  );
}
