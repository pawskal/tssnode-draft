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
} from "../interfaces";

import { Type } from "../../../tsnode-core/lib/interfaces";

import { HttpMethods } from "..";
import { ControllerResolver } from "./injectionHelper";
import { RequestHandler, NextFunction } from "express-serve-static-core";
import { RequestContext } from "../serviceProviders/requestContext";
import { RouteMeta, RequestArguments } from ".";

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
        console.log(requestContext.statusCode, 'finish')
        console.log(requestContext.finished, 'finish')

      });
      try {
        
        // tslint:disable-next-line: no-var-keyword
        // controllerResolver.inject(requestContext, new HeadersTest)
          if(guardDefinition) {
          const guard: IGuard = await controllerResolver.resolve(guardDefinition.guard.name, requestContext)
          // const options = new RouteMeta(controllerDefinition, method)
          const data = await guard.verify(req, guardDefinition.options);
          data && controllerResolver.inject(requestContext, data)
          console.log( '&&&&')
          // Object.assign(requestParams, data)
        }
        instance = await controllerResolver.resolve(controllerDefinition.definition.name, requestContext);
        const requestParams = new RequestArguments(req);
        
        typeof instance.onInit === 'function' && await instance.onInit();
        const origin: (options: IRequestParams) => any = method.handler || HttpMeta.noop;
        res.result = await origin.call(instance, requestParams) || {};
        console.log(res.result)
      } catch (e) {
        console.log('catch error', '***********')
        requestContext.finished = true
        next(e);
      } finally {
          
          process.nextTick(() => {
            console.log(requestContext.finished, 'finally')
          console.log(requestContext.statusCode, 'finally')
          console.log(res.result)

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
