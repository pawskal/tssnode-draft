import { Request, Response, NextFunction, RouterOptions } from 'express';
import { PathParams, IRouterHandler, IRouterMatcher, ApplicationRequestHandler, RequestHandler } from 'express-serve-static-core';
import { Type } from '../../tsnode-core/lib/interfaces';
import { HttpController, RouteMeta } from './helpers';
import { IncomingHttpHeaders } from 'http';

export enum HttpMethods {
  GET = 'get',
  HEAD = 'head',
  POST = 'post',
  PUT = 'put',
  DELETE = 'delete',
  PATCH = 'patch',
  OPTIONS = 'options'
}

export type IRequestParams<B = {}, Q = {}, P = {}, T = {}> =  T & {
  body: B;
  // [s: string]: keyof T;
  params: P;
  query: Q;
  headers: IncomingHttpHeaders;
};

export type IRequest<B = {}, Q = {}, P = {}, T = {}> = IRequestParams<B, Q, P, T> & Request

export interface IGuard {
   verify<T>(req: IRequest<T>, options: RouteMeta): any
}

export interface IUseGuard {
  useGuard?: boolean
}

export interface IProviderDefinition<T> {
  name: string;
  instance: T;
}

export interface IResponse<T = unknown> extends Response {
  result?: T;
}

export interface IAuthDefinition<T> {
  auth: boolean;
  options: T;
}

export interface IControllerDefinition<T extends IGuard = never> {
  basePath: PathParams;
  routes: Map<string, IRoutes>;
  guard?: Type<T>;
  definition: Type<HttpController>;
}

export type IRequestOptions<T> = T & IUseGuard

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
  value: (options: IRequestParams) => any
}

export type TypeFunction<T> = (target: Type<T>) => void

export type RouteFunction<T> = (target: Type<T>, fname: string, descriptor: IPropertyDescriptor) => void