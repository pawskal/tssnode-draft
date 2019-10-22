import { IControllerDefinition,
  IGuard,
  IGuardDefinition,
  IMethod,
  IPropertyDescriptor,
  IRequestOptions,
  IRoutes,
  TypeFunction,
} from "../interfaces";

import { Type } from "../../../tsnode-core/lib/interfaces";

import { HttpController } from "./httpController";

import { HttpMethods } from "..";

export class HttpMeta {
  private static instance: HttpMeta;
  public controllers: Map<string, IControllerDefinition> = new Map<string, IControllerDefinition>();
  public guards: Map<string, IGuardDefinition<IGuard, unknown>> = new Map<string, IGuardDefinition<IGuard, unknown>>();
  constructor() {
    return HttpMeta.instance || (HttpMeta.instance = this);
  }

  public GuardDecorator<T extends IGuard, K>(type: Type<T>, options?: K): TypeFunction<HttpController> {
    return (target: Type<HttpController>): void => {
      this.guards.set(target.name, {
        guard: type,
        options,
      });
    };
  }

  public ControllerDecorator(basePath: string): TypeFunction<HttpController> {
    return (target: Type<HttpController>): void => {
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

  public defineRoute<T>(method: HttpMethods, target: Type<HttpController>,
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
