import { Type } from "@pskl/di-core";
import { IGuard, IRequestOptions, TypeFunction, IHttpController } from "./types";
export declare const Controller: <T extends IHttpController>(name: string) => TypeFunction<T>;
export declare const Get: <T>(path: string, requestOptions?: IRequestOptions<T> | undefined) => Function;
export declare const Post: <T>(path: string, requestOptions?: IRequestOptions<T> | undefined) => Function;
export declare const Put: <T>(path: string, requestOptions?: IRequestOptions<T> | undefined) => Function;
export declare const Patch: <T>(path: string, requestOptions?: IRequestOptions<T> | undefined) => Function;
export declare const Delete: <T>(path: string, requestOptions?: IRequestOptions<T> | undefined) => Function;
export declare const Guard: <T extends IGuard<unknown, unknown>, K>(type: Type<T>, options?: K | undefined) => TypeFunction<IHttpController>;
