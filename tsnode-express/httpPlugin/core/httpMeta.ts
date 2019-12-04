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
  private static instance: HttpMeta;
  public static getHandler(controllerResolver: ControllerResolver<IGuard, unknown>, method: IMethod): RequestHandler {
    console.log('(((((((((')
    return async function handler (req: IRequest, res: IResponse, next: NextFunction) {
      try {
        // await new Promise(r => {
        //   setTimeout(() => {
        //     console.log('(((((((((')
        //   }, 2000)
        // })
          // tslint:disable-next-line: no-var-keyword
          var requestContext: RequestContext = new RequestContext(req, res, next)
          const { controllerDefinition, guardDefinition } = controllerResolver
          // controllerResolver.inject(requestContext, new HeadersTest)
          controllerResolver.inject(requestContext, requestContext)
           if(guardDefinition) {
            const guard: IGuard = await controllerResolver.resolve(guardDefinition.guard.name, requestContext)
            const options = new RouteMeta(controllerDefinition, method)
            const data = await guard.verify(req, options);
            data && controllerResolver.inject(requestContext, data)
            console.log(data, '&&&&')
            // Object.assign(requestParams, data)
          }
          const instance = await controllerResolver.resolve(controllerDefinition.definition.name, requestContext);
          const requestParams = new RequestArguments(req);
          res.on("finish", () => {
            instance && instance.onDestroy ? instance.onDestroy() : instance.noop();
            requestContext.finished = true;
          });
          instance && instance.onInit ? instance.onInit() : instance.noop();
          const origin: (options: IRequestParams) => any = method.handler || instance.noop;
          res.result = await origin.call(instance, requestParams) || {};
      } catch (e) {
        next(e);
      } finally {
          process.nextTick(() => requestContext.finished
            ? void 0
            : res.status(requestContext.statusCode).send(res.result));
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
