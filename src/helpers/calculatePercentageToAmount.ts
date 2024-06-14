export default function calculatePercentageToAmount(
  percent: number,
  total: number,
): number {
  const result = ((percent / 100) * total).toFixed(2);
  return parseFloat(result);
}
