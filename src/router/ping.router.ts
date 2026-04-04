import express from "express";
import type {  NextFunction , Request, Response} from "express";
import { pingHandler } from "../controller/ping.controller.js";
import { validRequestParams } from "../validators/index.js";
import { pingSchema } from "../validators/ping.validator.js";
import e from "express";
import { pingErrHandlerAsync, pingErrHandlerAsyncNext, pingErrHandlerAsyncTryCatch, pingErrHandlerWithCustom } from "../controller/ping-err.controller.js";


const pingRouter = express.Router();


function middleware1(req: Request, res: Response, next: NextFunction) {
    console.log("middleware 1");
    next();
}
function middleware2(req: Request, res: Response, next: NextFunction) {
    console.log("middleware 2");
    next();
}

pingRouter.get('/ping/:user_id', validRequestParams(pingSchema), pingHandler);
// error handling in express
// pingRouter.get('/ping-err', pingErrHandlerAsync);
pingRouter.get('/ping-err', pingErrHandlerWithCustom);
export default pingRouter;