import type { NextFunction, Request, Response } from "express";
import type { AppError } from "../utils/errors/app.error.js";


export const genericErrorHandler = (err: AppError, req: Request, res:Response, next: NextFunction) => {
    res.status(err.statusCode).json({
        message: err.message,
        success: false,
    });
}  