import { IFilters } from '../interfaces/queryFilters';

const searcher = (filters: IFilters, arrayOfSearchFields: string[]) => {
  const { search, ...filtersData } = filters;
  const andConditions = [];

  if (Object.keys(filtersData).length) {
    andConditions.push({
      $and: Object.entries(filtersData).map(([field, value]) => {
        return {
          [field]: value,
        };
      }),
    });
  }

  // the search should be push last
  if (search) {
    andConditions.push({
      $or: arrayOfSearchFields.map((field: string) => ({
        [field]: {
          $regex: search,
          $options: 'i',
        },
      })),
    });
  }

  const conditions = andConditions.length > 0 ? { $and: andConditions } : {};

  return conditions;
};

export default searcher;
