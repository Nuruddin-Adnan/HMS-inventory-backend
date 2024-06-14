import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError';
import { IGenericResponse } from '../../../interfaces/common';
import { IFilters, IQueries } from '../../../interfaces/queryFilters';
import searcher from '../../../shared/searcher';
import { IShelve } from './shelve.interface';
import { shelveSearchableFields } from './shelve.constant';
import { Shelve } from './shelve.model';

const createShelve = async (payload: IShelve): Promise<IShelve> => {
  const result = await Shelve.create(payload);
  return result;
};

const getAllShelves = async (
  filters: IFilters,
  queries: IQueries,
): Promise<IGenericResponse<IShelve[]>> => {
  const conditions = searcher(filters, shelveSearchableFields);

  const { limit = 0, skip, fields, sort } = queries;

  const resultQuery = Shelve.find(conditions)
    .skip(skip as number)
    .select(fields as string)
    .sort(sort)
    .limit(limit as number);

  const [result, total] = await Promise.all([
    resultQuery.exec(),
    Shelve.countDocuments(conditions),
  ]);

  const page = Math.ceil(total / limit);

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  };
};

const getSingleShelve = async (id: string): Promise<IShelve | null> => {
  if (!id) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Please provide a valid id');
  }

  const result = await Shelve.findById(id)
    .populate('createdBy')
    .populate('updatedBy');

  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Shelve Not found');
  }

  return result;
};

const updateShelve = async (
  id: string,
  payload: Partial<IShelve>,
): Promise<IShelve | null> => {
  if (!id) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Please provide a valid id');
  }

  const targetedData = await Shelve.findById(id);

  if (!targetedData) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Shelve Not found');
  }

  const result = await Shelve.findOneAndUpdate({ _id: id }, payload, {
    new: true,
  });

  return result;
};

const deleteShelve = async (id: string): Promise<IShelve | null> => {
  if (!id) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Shelve Not found');
  }
  const result = await Shelve.findOneAndDelete({ _id: id });
  return result;
};

export const ShelveService = {
  createShelve,
  getAllShelves,
  getSingleShelve,
  updateShelve,
  deleteShelve,
};
