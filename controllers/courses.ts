import { Request, Response, NextFunction, response } from "express";
import Course from '../models/Course';
import Bootcamp from "../models/Bootcamp";
import asyncHandler from "../utils/asyncHandler";
import ErrorResponse from "../utils/errorResponse";

// @desc     Get all courses
// @route    GET /api/v1/courses
// @route    GET /api/v1/bootcamps/:bootcampId/courses
// @access   Public
export const getCourses = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  if (req.params.bootcampId) {
    const bootcampId = req.params.bootcampId!;
    const bootcamp = await Bootcamp.findById(bootcampId);

    if (!bootcamp) {
      return next(
        new ErrorResponse(
          `Bootcamp not found with id of ${bootcampId}`,
          404,
        ),
      );
    }
    const courses = await Course.find({bootcamp: bootcampId});
    res.status(200).json({success: true, count: courses.length, data: courses});

  } else {
    res.status(200).json(res.advancedResults);
  }
});


// @desc     Get single course
// @route    GET /api/v1/courses/:id
// @access   Public
export const getCourse = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const course = await Course.findById(req.params.id).populate({
    path: 'bootcamp',
    select: 'name description'
  });

  if(!course) {
    return next(new ErrorResponse('No course found with that id', 404));
  }

  res.status(200).json({success: true, data:course});
});


// @desc     Create a course
// @route    POST /api/v1/bootcamps/:bootcampId/courses
// @access   Private
export const addCourse = asyncHandler(async(req: Request, res: Response, next: NextFunction) => {
  req.body.bootcamp = req.params.bootcampId;

  const bootcamp = Bootcamp.findById(req.params.bootcampId);

  if(!bootcamp) {
    return next(new ErrorResponse('No bootcamp found', 404));
  }

  const course = await Course.create(req.body);

  res.status(201).json({
    success: true,
    data: course
  });
});


// @desc     Update a course
// @route    PUT /api/v1/courses/:id
// @access   Private
export const updateCourse = asyncHandler(async(req: Request, res: Response, next: NextFunction) => {
  const course = await Course.findByIdAndUpdate(req.params.id, req.body, {
    returnDocument: 'after',
    runValidators: true
  });

  if(!course) {
    return next(new ErrorResponse('Course not found', 404));
  }

  res.status(200).json({success: true, data: course});
});

// @desc     Delete a course
// @route    DELETE /api/v1/courses/:id
// @access   Private
export const deleteCourse = asyncHandler(async(req: Request, res: Response, next: NextFunction) => {
  let course

  course = await Course.findById(req.params.id);

  if(!course) {
    return next(new ErrorResponse('Course not found', 404));
  };

  course = await course.deleteOne();

  res.status(200).json({success: true, data: course});
});
