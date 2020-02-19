import { Request, Response } from 'express';
import { PathParams } from 'express-serve-static-core';
import { IncomingHttpHeaders } from 'http';
import { Type } from '@pskl/di-core/interfaces';
import { RouteMeta } from './serviceProviders/routeMeta';

export enum HttpMethods {
  GET = 'get',
  HEAD = 'head',
  POST = 'post',
  PUT = 'put',
  DELETE = 'delete',
  PATCH = 'patch',
  OPTIONS = 'options',
}

export interface IHttpController extends IOnInit, IOnDestroy {}

export type IRequestParams<B = {}, Q = {}, P = {}> = {
  body: B;
  // [s: string]: keyof T;
  params: P;
  query: Q;
  headers: IncomingHttpHeaders;
};

export type IRequest<B = {}, Q = {}, P = {}> = IRequestParams<B, Q, P> & Request;

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

export interface IRequestArguments extends IRequestParams {}

export interface IControllerDefinition {
  basePath: PathParams;
  routes: Map<string, IRoutes>;
  definition: Type<IHttpController>;
}

export type IRequestOptions<T> = T & IUseGuard;

export interface IMethod<T = unknown> extends IUseGuard {
  name: string;
  handler: (options: IRequestParams) => any;
  path: string;
  method: HttpMethods;
  requestOptions: IRequestOptions<T>;
}

export type IRoutes = {
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

export type TypeFunction<T> = (target: Type<T>) => void;

export type RouteFunction<T> = (target: Type<T>, fname: string, descriptor: IPropertyDescriptor) => void;
