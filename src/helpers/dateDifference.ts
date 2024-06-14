export default function dateDifference(
  dateStr1: string,
  dateStr2: string,
): number {
  // Convert date strings to Date objects
  const date1: Date = new Date(dateStr1);
  const date2: Date = new Date(dateStr2);

  // Calculate the difference in milliseconds
  const differenceInMilliseconds: number = date2.getTime() - date1.getTime();

  // Convert milliseconds to days
  const differenceInDays: number =
    differenceInMilliseconds / (1000 * 60 * 60 * 24);

  return differenceInDays;
}
