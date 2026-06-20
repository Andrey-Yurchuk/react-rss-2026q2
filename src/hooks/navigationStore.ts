type NavigationSnapshot = {
  pathname: string;
  searchParams: URLSearchParams;
};

let snapshot: NavigationSnapshot = {
  pathname: '/',
  searchParams: new URLSearchParams('page=1'),
};

const listeners = new Set<() => void>();

export function subscribeNavigation(onStoreChange: () => void) {
  listeners.add(onStoreChange);
  return () => {
    listeners.delete(onStoreChange);
  };
}

export function getNavigationSnapshot(): NavigationSnapshot {
  return snapshot;
}

export function applyNavigationHref(href: string) {
  const [pathnamePart, queryPart = ''] = href.split('?');
  snapshot = {
    pathname: pathnamePart || '/',
    searchParams: new URLSearchParams(queryPart),
  };
  listeners.forEach((listener) => listener());
}

export function getMockNavigationHref() {
  const query = snapshot.searchParams.toString();
  return query ? `${snapshot.pathname}?${query}` : snapshot.pathname;
}

export function resetMockNavigation(href = '/?page=1') {
  applyNavigationHref(href);
}
