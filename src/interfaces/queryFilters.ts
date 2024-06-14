export type IFilters = {
  sort?: string;
  page?: string;
  limit?: string;
  fields?: string;
  [key: string]: string | number | undefined;
};

export type IQueries = {
  fields?: string;
  sort?: string;
  skip?: number;
  limit?: number;
  [key: string]: string | number | undefined;
};
