/// <reference types="node" />
import { Request, Response } from 'express';
import { PathParams } from 'express-serve-static-core';
import { IncomingHttpHeaders } from 'http';
import { Type } from '@pskl/di-core';
export declare enum HttpMethods {
    GET = "get",
    HEAD = "head",
    POST = "post",
    PUT = "put",
    DELETE = "delete",
    PATCH = "patch",
    OPTIONS = "options"
}
export interface IHttpController extends IOnInit, IOnDestroy {
}
export declare type IRequestParams<B = {}, Q = {}, P = {}> = {
    body: B;
    params: P;
    query: Q;
    headers: IncomingHttpHeaders;
};
export declare type IRequest<B = {}, Q = {}, P = {}> = IRequestParams<B, Q, P> & Request;
export interface IGuard<N = unknown, K = unknown> {
    verify<T>(req: IRequest<T>, options: N): K;
}
export interface IUseGuard {
    useGuard?: boolean;
}
export interface IProviderDefinition<T> {
    name: string;
    instance: T;
}
export interface IResponse<T = unknown> extends Response {
    result?: T;
}
export interface IGuardDefinition<T extends IGuard, K = unknown> {
    guard: Type<T>;
    options?: K;
}
export interface IRequestArguments extends IRequestParams {
}
export interface IControllerDefinition {
    basePath: PathParams;
    routes: Map<string, IRoutes>;
    definition: Type<IHttpController>;
}
export declare type IRequestOptions<T> = T & IUseGuard;
export interface IMethod<T = unknown> extends IUseGuard {
    name: string;
    handler: (options: IRequestParams) => any;
    path: string;
    method: HttpMethods;
    requestOptions: IRequestOptions<T>;
}
export declare type IRoutes = {
    [x in HttpMethods]?: IMethod;
};
export interface IOnInit {
    onInit?(): void;
}
export interface IOnDestroy {
    onDestroy?(): void;
}
export interface IPropertyDescriptor extends PropertyDecorator {
    value: (options: IRequestParams) => any;
}
export interface IControllerResolver<T extends IGuard, K = unknown> {
    controller: IControllerDefinition;
    guard: IGuardDefinition<T, K>;
}
export declare type TypeFunction<T> = (target: Type<T>) => void;
export declare type RouteFunction<T> = (target: Type<T>, fname: string, descriptor: IPropertyDescriptor) => void;
