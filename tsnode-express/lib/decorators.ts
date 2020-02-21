import { Type } from "@pskl/di-core";

import {
  HttpMethods,
  IGuard,
  TypeFunction, 
  IHttpController,
  RouteFunction
} from "./types";

import { httpMeta } from "./core";

export const Controller = <T extends IHttpController>(name: string): TypeFunction<T> =>
  httpMeta.ControllerDecorator.call(httpMeta, name);

export const Get = <T>(path: string, requestOptions?: T): RouteFunction<IHttpController> =>
  httpMeta.RouteDecorator.call(httpMeta, HttpMethods.GET, path, requestOptions);

export const Post = <T>(path: string, requestOptions?: T): RouteFunction<IHttpController> =>
  httpMeta.RouteDecorator.call(httpMeta, HttpMethods.POST, path, requestOptions);

export const Put = <T>(path: string, requestOptions?: T): RouteFunction<IHttpController> =>
  httpMeta.RouteDecorator.call(httpMeta, HttpMethods.PUT, path, requestOptions);

export const Patch = <T>(path: string, requestOptions?: T): RouteFunction<IHttpController> =>
  httpMeta.RouteDecorator.call(httpMeta, HttpMethods.PATCH, path, requestOptions);

export const Delete = <T>(path: string, requestOptions?: T): RouteFunction<IHttpController> =>
  httpMeta.RouteDecorator.call(httpMeta, HttpMethods.DELETE, path, requestOptions);

export const Guard = <T extends IGuard, K>(type: Type<T>, options?: K): TypeFunction<IHttpController> =>
  httpMeta.GuardDecorator.call(httpMeta, type, options);
