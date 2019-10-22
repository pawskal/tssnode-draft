import { NextFunction } from "express-serve-static-core"
import { Request, Response } from "express";

export class RequestContext {
  constructor(
    public request: Request,
    public response: Response,
    public next: NextFunction
  ) {}
}