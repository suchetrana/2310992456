import type { Request, Response, NextFunction } from "express";
import fs from "fs";
import { FileNotFoundError, InternalServerError } from "../utils/errors/app.error.js";

/**
 * Error handler for ping endpoint
 * @param req incoming request
 * @param res sending response
 * @param next calling next middleware fn to handle error
 */

// case 1: synchronous error

export const pingErrHandler = () => {
  throw new Error("Synchronous error in ping endpoint");
};
// case 2 : asynchronous error: using default error handling in express
export const pingErrHandlerAsync = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  fs.readFile("non-existent-file.txt", "utf-8", (err, data) => {
    if (err) {
      next(err); // pass the error to the next middleware (error handler)
    } else {
      res.json({
        message: "File read successfully",
        success: true,
        data,
      });
    }
  });
};
// case 3 : asynchronous error: using try catch block and next to handle error
export const pingErrHandlerAsyncTryCatch = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    await fs.readFile(
      "non-existent-file.txt"
      , "utf-8",
      () => {}
    );
    res.status(200).json({
      message: "File read successfully",
      success: true,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Error reading file",
      success: false,
    });
  }
};

export const pingErrHandlerAsyncNext = async (req: Request, res: Response, next: NextFunction) => {
    
    // before express 5, express not call next fn automatically

    /** try {
        await fs.readFile("not-exist-file.txt");
        res.status(200).json({
            message: "File read successfully",
            success: true,
        });
    } catch (err) {
        next(err); // call our generic error handler middleware to handle this error
    }
    */

    // after express 5, express will automatically call next fn 
    // if we return a rejected promise from our route handler
    await fs.promises.readFile("not-exist-file.txt");
    res.status(200).json({
        message: "File read successfully",
        success: true,
    });
}

export const pingErrHandlerWithCustom = async (req: Request, res: Response, next: NextFunction) => {
    try {    
    await fs.promises.readFile("not-exist-file.txt");
        res.status(200).json({
            message: "File read successfully",
            success: true,
        });
    } catch (err) { 
        throw new FileNotFoundError("Error reading file"); // this error will be caught by our generic error handler middleware
    }
}