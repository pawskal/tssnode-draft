import { PathParams } from 'express-serve-static-core';
import { IControllerDefinition, IMethod, IRequestOptions } from '../types';
export declare class RouteMeta<T = unknown> {
    controllerName: string;
    method: string;
    basePath: PathParams;
    path: string;
    functionName: string;
    requestOptions: IRequestOptions<T>;
    constructor(controller: IControllerDefinition, method: IMethod<T>);
    readonly fullPath: string;
}
