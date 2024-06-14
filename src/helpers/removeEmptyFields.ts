/* eslint-disable @typescript-eslint/no-explicit-any */
type NonEmptyObject<T> = {
  [K in keyof T]: T[K] extends string | number ? T[K] : never;
};

export const removeEmptyFields = <T>(obj: T): NonEmptyObject<T> => {
  const newObj = {} as NonEmptyObject<T>;
  for (const key in obj) {
    const value = obj[key];
    if (
      (typeof value === 'string' && value !== '') ||
      (typeof value === 'number' && !isNaN(value)) ||
      (Array.isArray(value) && value.length > 0)
    ) {
      newObj[key] = value as any;
    }
  }
  return newObj;
};
