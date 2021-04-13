import { Request, Response } from 'express';
import { PathParams } from 'express-serve-static-core';
import { IncomingHttpHeaders } from 'http';
import { Type } from '@pskl/di-core';

export enum HttpMethods {
  GET = 'get',
  HEAD = 'head',
  POST = 'post',
  PUT = 'put',
  DELETE = 'delete',
  PATCH = 'patch',
  OPTIONS = 'options',
}

export type IRequestHandler = (options: IRequestParams) => any

export interface IHttpController extends IOnInit, IOnDestroy {}

export type IRequestParams<B = {}, Q = {}, P = {}> = {
  body: B;
  params: P;
  query: Q;
  headers: IncomingHttpHeaders;
};

export type IRequest<B = {}, Q = {}, P = {}> = IRequestParams<B, Q, P> & Request;

export interface IGuard<N = unknown> {
   verify<T>(req: IRequest<T>, options: N): any;
}

export type IProviderDefinition<T> = {
  name: string;
  instance: T;
}

export type IResponse<T = unknown> = {
  result?: T;
} &  Response

export type IGuardDefinition<T extends IGuard, K = unknown> = {
  guard: Type<T>;
  options?: K;
}

export type IRequestArguments = {} & IRequestParams

export type IControllerDefinition = {
  basePath: PathParams;
  routes: Map<string, IRoutes>;
  definition: Type<IHttpController>;
}

export type IMethod<T = unknown> = {
  name: string;
  handler: IRequestHandler;
  path: string;
  method: HttpMethods;
  requestOptions: T;
}

export type IRoutes = {
  [x in HttpMethods]?: IMethod;
};

export interface IOnInit {
  onInit?(): void | Promise<void>;
}

export interface IOnDestroy {
  onDestroy?(): void | Promise<void>;
}

export type IPropertyDescriptor = {
  value: IRequestHandler;
} &  PropertyDecorator

export type IControllerResolver<T extends IGuard, K = unknown> = {
  controller: IControllerDefinition;
  guard: IGuardDefinition<T, K>;
}

export type RouteFunction<T> = (target: Type<T>, fname: string, descriptor: IPropertyDescriptor) => void;
