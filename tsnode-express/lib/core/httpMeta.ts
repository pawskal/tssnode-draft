import { Type, TypeFunction } from "@pskl/di-core";

import { 
  IControllerDefinition,
  IGuard,
  IGuardDefinition,
  IMethod,
  IPropertyDescriptor,
  IRoutes,
  IRequest,
  IResponse,
  IHttpController,
  HttpMethods,
} from "../types";


import { ControllerResolver } from "./injectionHelper";
import { RequestHandler, NextFunction } from "express-serve-static-core";
import { CurrentContext, RouteMeta } from "../providers";
import { RequestArguments } from "./requestArguments";

export class HttpMeta {
  public static noop: () => any = () => {}
  private static instance: HttpMeta;
  public static getHandler(controllerResolver: ControllerResolver<IGuard, unknown>, method: IMethod): RequestHandler {
    return async function handler (req: IRequest, res: IResponse, next: NextFunction) {
      const currentContext: CurrentContext = new CurrentContext(req, res, next)
      controllerResolver.inject(currentContext, currentContext)
      const { controllerDefinition, guardDefinition } = controllerResolver

      controllerResolver.inject(currentContext, new RouteMeta(controllerDefinition, method))
      let instance: IHttpController;
      res.on("finish", () => {
        instance && typeof instance.onDestroy === 'function' && instance.onDestroy()
        currentContext.finished = true;
      });
      try {
        if(guardDefinition) {
          const guard: IGuard = await controllerResolver.resolve(guardDefinition.guard.name, currentContext)
          const data = await guard.verify(req, guardDefinition.options);
          data && controllerResolver.inject(currentContext, data)
        }
        instance = await controllerResolver.resolve(controllerDefinition.definition.name, currentContext);
        const requestParams = new RequestArguments(req);
        
        typeof instance.onInit === 'function' && await instance.onInit();
        const origin = method.handler || HttpMeta.noop;
        res.result = await origin.call(instance, requestParams) || {};
      } catch (e) {
        currentContext.finished = true
        next(e);
      } finally {
          process.nextTick(() => {
            currentContext.finished
            ? void 0
            : res.status(currentContext.statusCode).send(res.result)});
      }
    };
  }
  public controllers: Map<string, IControllerDefinition> = new Map<string, IControllerDefinition>();
  public guards: Map<string, IGuardDefinition<IGuard>> = new Map<string, IGuardDefinition<IGuard>>();
  
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

  public RouteDecorator<T>(method: HttpMethods, path: string, requestOptions?: T): Function {
    return (target: Type<any>, fname: string, descriptor: IPropertyDescriptor): void =>
      this.defineRoute(method, target, path, fname, descriptor, requestOptions);
  }

  public defineRoute<T>(method: HttpMethods, target: Type<IHttpController>,
                        defaultPath: string, fname: string,
                        descriptor: IPropertyDescriptor, requestOptions?: T): void {
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
