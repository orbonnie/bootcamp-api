import {Request, Response, NextFunction} from 'express'

// @desc     Get all bootcamps
// @route    GET /api/v1/bootcamps
// @access   Public
export const getBootcamps = (req: Request, res: Response, next: NextFunction) => {
    res.status(200).json({success: true, msg: "view all bootcamps"})
}

// @desc     Get single bootcamp
// @route    GET /api/v1/bootcamp:id
// @access   Public
export const getBootcamp = (req: Request, res: Response, next: NextFunction) => {
    res.status(200).json({success: true, msg: `view bootcamp ${req.params.id}`})
}

// @desc     Create new bootcamp
// @route    POST /api/v1/bootcamp
// @access   Private
export const createBootcamp = (req: Request, res: Response, next: NextFunction) => {
    res.status(201).json({success: true, msg: "create a bootcamp"})
}

// @desc     Update a bootcamp
// @route    PUT /api/v1/bootcamp:id
// @access   Private
export const updateBootcamp = (req: Request, res: Response, next: NextFunction) => {
    res.status(201).json({success: true, msg: `update bootcamp ${req.params.id}`})
}

// @desc     Delete bootcamp
// @route    DELETE /api/v1/bootcamp:id
// @access   Private
export const deleteBootcamp = (req: Request, res: Response, next: NextFunction) => {
    res.status(200).json({success: true, msg: `delete bootcamp ${req.params.id}`})
}

