import { Request, Response, NextFunction } from 'express';
import chalk from 'chalk';
import ErrorResponse from '../utils/errorResponse';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  let error = err;

  // Bad object id
  if(err.name === 'CastError') {
      const msg = `Resource not found with id of ${err.value}`;
      error = new ErrorResponse(msg, 404);
  }

  // Duplicate entry on unique field
  if(err.code === 11000) {
    const msg = `${err.keyValue.name} already exists.`
    error = new ErrorResponse(msg, 400);
  }

  // Field validation error
  if(err.name === "ValidationError") {
    const msg: string = Object.values(err.errors).map((val: any) => val.message).join(', ');
    error = new ErrorResponse(msg, 400);
  }

  res.status(error.statusCode || 500).json({
      success: false,
      error: error.message || 'Server Error'
  });
};