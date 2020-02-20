import { Type } from "@pskl/di-core";
import { IControllerDefinition, IGuard, IGuardDefinition, IMethod, IPropertyDescriptor, IRequestOptions, TypeFunction, IHttpController } from "../types";
import { HttpMethods } from "..";
import { ControllerResolver } from "./injectionHelper";
import { RequestHandler } from "express-serve-static-core";
export declare class HttpMeta {
    static noop: () => any;
    private static instance;
    static getHandler(controllerResolver: ControllerResolver<IGuard, unknown>, method: IMethod): RequestHandler;
    controllers: Map<string, IControllerDefinition>;
    guards: Map<string, IGuardDefinition<IGuard, unknown>>;
    constructor();
    GuardDecorator<T extends IGuard, K>(type: Type<T>, options?: K): TypeFunction<IHttpController>;
    ControllerDecorator(basePath: string): TypeFunction<IHttpController>;
    RouteDecorator<T>(method: HttpMethods, path: string, requestOptions?: IRequestOptions<T>): Function;
    defineRoute<T>(method: HttpMethods, target: Type<IHttpController>, defaultPath: string, fname: string, descriptor: IPropertyDescriptor, requestOptions?: IRequestOptions<T>): void;
    normalizePath(defaultPath: string): string;
}
