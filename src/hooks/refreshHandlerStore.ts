let refreshHandler: (() => void) | undefined;

export function registerRefreshHandler(handler: () => void) {
  refreshHandler = handler;
}

export function clearRefreshHandler() {
  refreshHandler = undefined;
}

export function triggerRefreshHandler() {
  refreshHandler?.();
}
