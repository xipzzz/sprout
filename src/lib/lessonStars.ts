/** Lock B ending: a finished level always lands on 3, 4, or 5 stars. */
export function starsForAccuracy(correct: number, total: number): 3 | 4 | 5 {
  if (total <= 0) return 3;
  const ratio = correct / total;
  if (ratio >= 0.9) return 5;
  if (ratio >= 0.6) return 4;
  return 3;
}
