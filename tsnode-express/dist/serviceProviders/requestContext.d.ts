import { NextFunction } from "express-serve-static-core";
import { Request, Response } from "express";
export declare class RequestContext {
    request: Request;
    response: Response;
    next: NextFunction;
    finished: boolean;
    statusCode: number;
    constructor(request: Request, response: Response, next: NextFunction);
}
