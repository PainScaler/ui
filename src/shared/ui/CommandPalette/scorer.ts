import type { PaletteAction } from "./types";

const LABEL_PREFIX = 3;
const LABEL_INCLUDE = 2;
const KEYWORD_INCLUDE = 1;
const DESCRIPTION_INCLUDE = 0.5;

export function scoreAction(action: PaletteAction, query: string): number {
  if (!query) return 0;
  const q = query.toLowerCase();
  const label = action.label.toLowerCase();

  let score = 0;
  if (label.startsWith(q)) score += LABEL_PREFIX;
  else if (label.includes(q)) score += LABEL_INCLUDE;

  if (action.keywords?.some((k) => k.toLowerCase().includes(q))) {
    score += KEYWORD_INCLUDE;
  }
  if (action.description?.toLowerCase().includes(q)) {
    score += DESCRIPTION_INCLUDE;
  }
  return score;
}

export function filterAndRank(
  actions: PaletteAction[],
  query: string,
): PaletteAction[] {
  const q = query.trim();
  if (!q) return actions;
  return actions
    .map((a) => ({ a, s: scoreAction(a, q) }))
    .filter(({ s }) => s > 0)
    .sort((x, y) => y.s - x.s)
    .map(({ a }) => a);
}
