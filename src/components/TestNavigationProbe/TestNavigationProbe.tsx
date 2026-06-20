'use client';

import { useSyncExternalStore } from 'react';
import {
  getNavigationSnapshot,
  subscribeNavigation,
} from '../../hooks/navigationStore.ts';

export function TestNavigationProbe() {
  const { pathname, searchParams } = useSyncExternalStore(
    subscribeNavigation,
    getNavigationSnapshot,
    getNavigationSnapshot
  );
  const query = searchParams.toString();
  const href = query ? `${pathname}?${query}` : pathname;

  return <p data-testid="current-location">{href}</p>;
}
