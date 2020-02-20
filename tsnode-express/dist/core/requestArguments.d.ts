/// <reference types="node" />
import { Request } from 'express';
import { IncomingHttpHeaders } from 'http';
import { IRequestArguments } from '../types';
export declare class RequestArguments implements IRequestArguments {
    body: any;
    params: any;
    query: any;
    headers: IncomingHttpHeaders;
    constructor(req: Request);
}
