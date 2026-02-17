import {Request, Response, NextFunction} from 'express';

const advancedResults = (model: any, populate: any) => async (req: Request, res: Response, next: NextFunction) => {
  let query;

  // Copy req query
  const reqQuery = {...req.query};

  // Fields to exclude
  const removeFields = ['select', 'sort', 'limit', 'page'];

  removeFields.forEach(param => delete reqQuery[param]);

  // Create query string w/ comparison operators
  let queryStr = JSON.stringify(reqQuery);
  queryStr = queryStr.replace(
    /\b(gt|gte|lt|lte|in)\b/g,
    match => `$${match}`,
  );

  query = model.find(JSON.parse(queryStr));

  // Select Fields
  if(req.query.select) {
    const selectFields = req.query.select as string;
    const fields = selectFields.split(',').join(' ');
    query = query.select(fields);
  }

  // Sort Fields
  if(req.query.sort) {
    const sortFields = req.query.sort as string;
    const fields = sortFields.split(',').join(' ');
    query = query.sort(fields);
  } else {
    query = query.sort('name');
  }

  // Pagination
  const page = parseInt(req.query.page as string, 10) || 1;
  const limit = parseInt(req.query.limit as string, 10) || 25;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await model.countDocuments();

  query = query.skip(startIndex).limit(limit);

  if(populate) {
    query = query.populate(populate);
  }

  // Execute query
  const results = await query;

  // Pagination results
  const pagination: Pagination = {};

  if(endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit
    }
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit
    }
  }

  res.advancedResults = {
    success: true,
    count: results.length,
    pagination,
    data: results
  };

  next();
}

export default advancedResults;