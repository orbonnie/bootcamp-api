import { Request, Response, NextFunction } from "express";
import Bootcamp from "../models/Bootcamp";
import asyncHandler from "../utils/asyncHandler";
import ErrorResponse from "../utils/errorResponse";
import chalk from "chalk";
import geocoder from "../utils/geocoder";

// @desc     Get all bootcamps
// @route    GET /api/v1/bootcamps
// @access   Public
export const getBootcamps = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {

    res
      .status(200)
      .json(res.advancedResults);
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
