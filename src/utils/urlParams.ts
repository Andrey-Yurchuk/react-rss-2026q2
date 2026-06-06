export function parsePageParam(raw: string | null): number {
  if (raw === null) {
    return 1;
  }
  const page = Number.parseInt(raw, 10);
  return Number.isFinite(page) && page >= 1 ? page : 1;
}
