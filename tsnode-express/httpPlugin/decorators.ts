import {
  HttpMethods,
  IControllerDefinition,
  IGuard,
  IGuardDefinition,
  IMethod,
  IPropertyDescriptor,
  IRequestOptions,
  IRoutes,
  TypeFunction, 
  IHttpController} from "./interfaces";

import { Type } from "@pslk/di-core/interfaces";
import { httpMeta } from "./core";

export const Controller = <T extends IHttpController>(name: string): TypeFunction<T> =>
  httpMeta.ControllerDecorator.call(httpMeta, name);

export const Get = <T>(path: string, requestOptions?: IRequestOptions<T>) =>
  httpMeta.RouteDecorator.call(httpMeta, HttpMethods.GET, path, requestOptions);

export const Post = <T>(path: string, requestOptions?: IRequestOptions<T>) =>
  httpMeta.RouteDecorator.call(httpMeta, HttpMethods.POST, path, requestOptions);

export const Put = <T>(path: string, requestOptions?: IRequestOptions<T>) =>
  httpMeta.RouteDecorator.call(httpMeta, HttpMethods.PUT, path, requestOptions);

export const Patch = <T>(path: string, requestOptions?: IRequestOptions<T>) =>
  httpMeta.RouteDecorator.call(httpMeta, HttpMethods.PATCH, path, requestOptions);

export const Delete = <T>(path: string, requestOptions?: IRequestOptions<T>) =>
  httpMeta.RouteDecorator.call(httpMeta, HttpMethods.DELETE, path, requestOptions);

export const Guard = <T extends IGuard, K>(type: Type<T>, options?: K) =>
  httpMeta.GuardDecorator.call(httpMeta, type, options);

// export const Before: Function = httpMeta.RouteDecorator.bind(httpMeta, 'before');

// export const After: Function = httpMeta.RouteDecorator.bind(httpMeta, 'after');
