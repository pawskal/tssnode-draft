import { Type } from "@pskl/di-core";

import { IControllerDefinition,
  IGuard,
  IGuardDefinition,
  IMethod,
  IPropertyDescriptor,
  IRequestOptions,
  IRoutes,
  TypeFunction,
  IRequest,
  IResponse,
  IRequestParams,
  IHttpController,
} from "../types";


import { HttpMethods } from "..";
import { ControllerResolver } from "./injectionHelper";
import { RequestHandler, NextFunction } from "express-serve-static-core";
import { RequestContext } from "../serviceProviders/requestContext";
import { RouteMeta, RequestArguments } from "../core";

export class HttpMeta {
  public static noop: () => any = () => {}
  private static instance: HttpMeta;
  public static getHandler(controllerResolver: ControllerResolver<IGuard, unknown>, method: IMethod): RequestHandler {
    return async function handler (req: IRequest, res: IResponse, next: NextFunction) {
      const requestContext: RequestContext = new RequestContext(req, res, next)
      controllerResolver.inject(requestContext, requestContext)
      const { controllerDefinition, guardDefinition } = controllerResolver

      controllerResolver.inject(requestContext, new RouteMeta(controllerDefinition, method))
      let instance: IHttpController;
      res.on("finish", () => {
        instance && typeof instance.onDestroy === 'function' && instance.onDestroy()
        requestContext.finished = true;
      });
      try {
        
          if(guardDefinition) {
          const guard: IGuard = await controllerResolver.resolve(guardDefinition.guard.name, requestContext)
          const data = await guard.verify(req, guardDefinition.options);
          data && controllerResolver.inject(requestContext, data)
        }
        instance = await controllerResolver.resolve(controllerDefinition.definition.name, requestContext);
        const requestParams = new RequestArguments(req);
        
        typeof instance.onInit === 'function' && await instance.onInit();
        const origin: (options: IRequestParams) => any = method.handler || HttpMeta.noop;
        res.result = await origin.call(instance, requestParams) || {};
      } catch (e) {
        requestContext.finished = true
        next(e);
      } finally {
          process.nextTick(() => {
            requestContext.finished
            ? void 0
            : res.status(requestContext.statusCode).send(res.result)});
      }
    };
  }
  public controllers: Map<string, IControllerDefinition> = new Map<string, IControllerDefinition>();
  public guards: Map<string, IGuardDefinition<IGuard, unknown>> = new Map<string, IGuardDefinition<IGuard, unknown>>();
  
  constructor() {
    return HttpMeta.instance || (HttpMeta.instance = this);
  }

  public GuardDecorator<T extends IGuard, K>(type: Type<T>, options?: K): TypeFunction<IHttpController> {
    return (target: Type<IHttpController>): void => {
      this.guards.set(target.name, {
        guard: type,
        options,
      });
    };
  }

  public ControllerDecorator(basePath: string): TypeFunction<IHttpController> {
    return (target: Type<IHttpController>): void => {
      const controller: IControllerDefinition = this.controllers.get(target.name)!;
      Object.assign(controller, {
        basePath: this.normalizePath(basePath),
        definition: target,
      });
    };
  }

  public RouteDecorator<T>(method: HttpMethods, path: string, requestOptions?: IRequestOptions<T>): Function {
    return (target: Type<any>, fname: string, descriptor: IPropertyDescriptor): void =>
      this.defineRoute(method, target, path, fname, descriptor, requestOptions);
  }

  public defineRoute<T>(method: HttpMethods, target: Type<IHttpController>,
                        defaultPath: string, fname: string,
                        descriptor: IPropertyDescriptor, requestOptions?: IRequestOptions<T>): void {
    if (!this.controllers.has(target.constructor.name)) {
      this.controllers.set(target.constructor.name, {
        basePath: "",
        routes: new Map<string, IRoutes>(),
        definition: target,
      });
    }

    const path: string = this.normalizePath(defaultPath);

    const controller: IControllerDefinition = this.controllers.get(target.constructor.name)!;
    const route: IRoutes = controller.routes.get(path) || {};

    const methodDefinition: IMethod = route[method] || {} as IMethod;
    Object.assign(methodDefinition, {
      name: fname,
      handler: descriptor.value,
      guard: requestOptions && requestOptions.useGuard,
      path,
      method,
      requestOptions,
    });
    route[method] = methodDefinition;
    controller.routes.set(path, route);
  }

  public normalizePath(defaultPath: string): string {
    if (defaultPath.endsWith("/") && !defaultPath.startsWith("/")) {
      return `/${defaultPath}`.slice(0, -1);
    } else if (defaultPath.endsWith("/")) {
      return defaultPath.slice(0, -1);
    } else if (!defaultPath.startsWith("/")) {
      return `/${defaultPath}`;
    } else {
      return defaultPath;
    }
  }
}
