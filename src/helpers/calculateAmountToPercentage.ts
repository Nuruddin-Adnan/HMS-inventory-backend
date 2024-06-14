export default function calculateAmountToPercentage(
  amount: number,
  total: number,
): number {
  const result = (amount / total) * 100;
  return parseFloat(result.toFixed(2));
}
