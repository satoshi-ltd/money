const RANK = ['accent', 'text', 'textSecondary', 'textMuted'];

// Colour ranks, it does not identify: accent leads and the rest walk one ink down, never cycling back.
export const rankInk = (colors = {}, index = 0) => colors[RANK[Math.min(index, RANK.length - 1)]];
