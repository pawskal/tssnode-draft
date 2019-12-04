import { NextFunction } from "express-serve-static-core"
import { Request, Response } from "express";

export class RequestContext {
  public finished: boolean = false;
  public statusCode: number = 200;
  constructor(
    public request: Request,
    public response: Response,
    public next: NextFunction
  ) {}
}