import { Request } from 'express';
import { IFilters, IQueries } from '../interfaces/queryFilters';

const queryFilters = (
  query: Record<string, string | undefined>,
  req: Request,
) => {
  let filters: IFilters = { ...query };
  const queries: IQueries = {};

  // sort, page, limit, fields -> exclude
  const excludeFields: string[] = ['sort', 'page', 'limit', 'fields', 'nestedFilter'];
  excludeFields.forEach((field: string) => delete filters[field]);

  // gt, gte, lt, lte
  let filtersString: string = JSON.stringify(filters);

  filtersString = filtersString.replace(
    /\b(gt|gte|lt|lte|exists|ne|in)\b/g,
    (match: string | boolean) => `$${match}`,
  );
  filters = JSON.parse(filtersString);

  if (req.query.fields) {
    const fields: string = (req.query.fields as string).split(',').join(' ');
    queries.fields = fields;
  }

  if (req.query.sort) {
    const sort: string = (req.query.sort as string).split(',').join(' ');
    queries.sort = sort;
  }

  if (req.query.page || req.query.limit) {
    const { page = '1', limit = '10' } = req.query as {
      page?: string;
      limit?: string;
    };
    const skip: number = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    queries.skip = skip;
    queries.limit = parseInt(limit, 10);
  }

  if (req.query.nestedFilter) {
    const nestedFilter: string = (req.query.nestedFilter as string).split(',').join(' ');
    queries.nestedFilter = nestedFilter;
  }

  return {
    filters,
    queries,
  };
};

export default queryFilters;
