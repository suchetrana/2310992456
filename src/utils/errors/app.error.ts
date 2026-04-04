export interface AppError extends Error {
  statusCode: number;
  message: string;
  success: boolean;
}
export class InternalServerError extends Error implements AppError {
  statusCode: number;
  success: boolean;
  constructor(message: string) {
    super(message);
    this.name = "InternalServerError";
    this.statusCode = 500;
    this.success = false;
  }
}
export class BadRequestError extends Error implements AppError {
    statusCode: number;
    success: boolean;
    constructor(message: string) {
        super(message);
        this.name = "BadRequestError";  
        this.statusCode = 400;
        this.success = false;
    }   
}
export class FileNotFoundError extends Error implements AppError {
    statusCode: number;
    success: boolean;
    constructor(message: string) {
        super(message);
        this.name = "FileNotFoundError";
        this.statusCode = 404;
        this.success = false;
    }   
}