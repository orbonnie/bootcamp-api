import { Request, Response, NextFunction } from "express";
import Bootcamp from "../models/Bootcamp";
import { asyncHandler } from "../utils/asyncHandler";
import { ErrorResponse } from "../utils/errorResponse";
import chalk from "chalk";
import geocoder from "../utils/geocoder";

// @desc     Get all bootcamps
// @route    GET /api/v1/bootcamps
// @access   Public
export const getBootcamps = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    let query;

    // Copy req query
    const reqQuery = {...req.query};

    // Fields to exclude
    const removeFields = ['select', 'sort', 'limit', 'page'];

    removeFields.forEach(param => delete reqQuery[param]);

    console.log(reqQuery);

    // Create query string w/ comparison operators
    let queryStr = JSON.stringify(reqQuery);
    queryStr = queryStr.replace(
      /\b(gt|gte|lt|lte|in)\b/g,
      match => `$${match}`,
    );

    query = Bootcamp.find(JSON.parse(queryStr));

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
    const total = await Bootcamp.countDocuments();

    query = query.skip(startIndex).limit(limit);

    // Execute query
    const bootcamps = await query;

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

    res
      .status(200)
      .json({ success: true, count: bootcamps.length, pagination, data: bootcamps });
  },
);

// @desc     Get single bootcamp
// @route    GET /api/v1/bootcamp:id
// @access   Public
export const getBootcamp = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const bootcamp = await Bootcamp.findById(req.params.id);

    if (!bootcamp) {
      return next(
        new ErrorResponse(
          `Bootcamp not found with id of ${req.params.id}`,
          404,
        ),
      );
    }

    res.status(200).json({ success: true, data: bootcamp });
  },
);

// @desc     Create new bootcamp
// @route    POST /api/v1/bootcamp
// @access   Private
export const createBootcamp = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const bootcamp = await Bootcamp.create(req.body);
    res.status(201).json({ success: true, data: bootcamp });
  },
);

// @desc     Update a bootcamp
// @route    PUT /api/v1/bootcamp:id
// @access   Private
export const updateBootcamp = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
      returnDocument: "after",
      runValidators: true,
    });

    const schemaFields = Object.keys(Bootcamp.schema.paths);
    const updateFields = Object.keys(req.body);
    const invalidFields = updateFields.filter(
      (field) => !schemaFields.includes(field),
    );

    console.log(
      chalk.whiteBright.bold(
        "These fields do not exist in the Bootcamp model:",
      ),
      chalk.red(`${invalidFields.join(", ")}`),
    );

    if (!bootcamp) {
      return next(
        new ErrorResponse(
          `Bootcamp not found with id of ${req.params.id}`,
          404,
        ),
      );
    }

    res.status(201).json({ success: true, data: bootcamp });
  },
);

// @desc     Delete bootcamp
// @route    DELETE /api/v1/bootcamp:id
// @access   Private
export const deleteBootcamp = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id);

    if (!bootcamp) {
      return next(
        new ErrorResponse(
          `Bootcamp not found with id of ${req.params.id}`,
          404,
        ),
      );
    }

    res.status(200).json({ success: true, data: bootcamp });
  },
);

// @desc     Get bootcamps within a radius
// @route    GET /api/v1/bootcamps/radius/:zipcode/:distance
// @access   Private

export const getBootcampsInRadius = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const zipcode = req.params.zipcode as string;
    const distance = parseInt(req.params.distance as string);

    const loc = await geocoder.geocode(zipcode);
    const lat = loc[0].latitude;
    const lng = loc[0].longitude;

    // Calc radius
    // Divide dist by radius of Earth
    // Earth Radius  = 3963 mi
    const radius = distance / 3936;

    const bootcamps = await Bootcamp.find({
      location: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
    });

    res.status(200).json({
      success: true,
      count: bootcamps.length,
      data: bootcamps,
    });
  },
);
