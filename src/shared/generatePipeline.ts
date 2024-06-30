/* eslint-disable @typescript-eslint/no-explicit-any */
import { ObjectId } from 'mongodb';

export default function generatePipeline(
  initialPipeline: any[],
  conditions?: any,
  skip?: number,
  fields?: string,
  sort?: string,
  limit?: number,
  nestedFilter: any = 'false',
  ...others: any
) {
  const pipeline = initialPipeline;

  if (conditions) {
    // object id and date detect
    const objectIdSuffixes = [
      '_id',
      'createdBy',
      'updatedBy',
      'supplier',
      'product',
      'category',
      'group',
    ]; // Suffixes for ObjectId
    const dateSuffixes = [
      'createdAt',
      'updatedAt',
      'expenseDate',
      'expiryDate',
    ]; // Suffixes for Date

    if (conditions.$and && conditions.$and[0]?.$and) {
      let filterData = conditions.$and[0]?.$and;
      filterData = filterData.map((obj: any) => {
        const updatedObj: Record<string, any> = {};
        for (const [key, value] of Object.entries(obj)) {
          if (objectIdSuffixes.some(suffix => key.endsWith(suffix))) {
            updatedObj[key] = new ObjectId(value as ObjectId);
          } else if (dateSuffixes.some(suffix => key.endsWith(suffix))) {
            if (typeof value === 'object') {
              const dateObj: Record<string, any> = {};
              for (const [key, val] of Object.entries(value!)) {
                dateObj[key] = new Date(val as Date);
              }
              updatedObj[key] = dateObj;
            } else {
              updatedObj[key] = value;
            }
          } else if (typeof value === 'object') {
            const filterObj: Record<string, any> = {};
            for (const [key, val] of Object.entries(value!)) {
              if (
                key === '$lt' ||
                key === '$lte' ||
                key === '$gt' ||
                key === '$gte'
              ) {
                filterObj[key] = parseFloat(val);
              } else if (key === '$in') {
                if (Array.isArray(val)) {
                  filterObj[key] = val;
                } else {
                  filterObj[key] = val.split(' ');
                }
              } else if (key === '$exists') {
                if (typeof val === 'string') {
                  const myBoolean = val.toLowerCase() === 'true';
                  filterObj[key] = myBoolean;
                } else {
                  filterObj[key] = val;
                }
              } else {
                filterObj[key] = val;
              }
            }
            updatedObj[key] = filterObj;
          } else {
            updatedObj[key] = value;
          }
        }
        return updatedObj;
      });

      conditions.$and[0].$and = filterData;
    }

    if (nestedFilter === 'true') {
      pipeline.push({ $match: conditions });
    } else {
      pipeline.unshift({ $match: conditions });
    }
  }

  if (sort) {
    const inputArray: string[] = sort.split(' ');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const resultObject = inputArray.reduce((acc: any, item) => {
      // Remove the leading '-' from the property name
      const propertyName = item.replace(/^-/, '');

      // Set the property value based on whether it starts with '-'
      const propertyValue = item.startsWith('-') ? -1 : 1;

      // If property value is 1, convert it to a number
      acc[propertyName] = propertyValue;

      return acc;
    }, {});

    pipeline.push({ $sort: resultObject });
  }

  if (skip! > 0) {
    pipeline.push({ $skip: skip as number });
  }

  if (limit! > 0) {
    pipeline.push({ $limit: limit as number });
  }

  if (fields) {
    const inputArray: string[] = fields.split(' ');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const resultObject = inputArray.reduce((acc: any, item) => {
      // Remove the leading '-' from the property name
      const propertyName = item.replace(/^-/, '');

      // Set the property value based on whether it starts with '-'
      const propertyValue = item.startsWith('-') ? 0 : 1;

      // If property value is 1, convert it to a number
      acc[propertyName] = propertyValue;

      return acc;
    }, {});

    pipeline.push({ $project: resultObject });
  }

  if (others) {
    pipeline.push(...others);
  }

  return pipeline;
}
