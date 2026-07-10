export function shuffleArray<T>(items: T[]): T[] {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

export function pickRandomUnique<T>(
  pool: T[],
  count: number,
  key: (item: T) => string
): T[] {
  const shuffled = shuffleArray(pool);
  const seen = new Set<string>();
  const picked: T[] = [];

  for (const item of shuffled) {
    const id = key(item);
    if (seen.has(id)) continue;
    seen.add(id);
    picked.push(item);
    if (picked.length >= count) break;
  }

  return picked;
}

export function pickRandomExcluding<T>(
  pool: T[],
  excludeKeys: Set<string>,
  key: (item: T) => string
): T | null {
  const candidates = pool.filter((item) => !excludeKeys.has(key(item)));
  if (!candidates.length) return null;
  return candidates[Math.floor(Math.random() * candidates.length)] ?? null;
}
