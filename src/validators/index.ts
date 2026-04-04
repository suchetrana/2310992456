import { z } from "zod";
import type { NextFunction, Request, Response } from "express";


export const validRequestBody = (schema: z.ZodTypeAny) => {
  return async (req: Request, res: Response, next: NextFunction)  => {
    try {
      await schema.parseAsync(req.body);
      console.log("Request body valid");
      next();
    } catch (error) {
      console.error("Request body invalid");
      res.status(400).json({ error: "Invalid request body" });
    }
  };
};

export const validRequestParams = (schema: z.ZodTypeAny) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync(req.params);
      console.log("Request params valid");
      next();
    } catch (error) {
      console.error("Request params invalid");
      res.status(400).json({ error: "Invalid route params" });
    }
  };
};
