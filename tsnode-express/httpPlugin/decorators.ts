import { HttpMethods, IRoutes, IControllerDefinition, IMethod, IGuard, IRequestOptions, IPropertyDescriptor, TypeFunction } from "./interfaces";

import { Type } from '../../tsnode-core/lib/interfaces';
import { HttpController } from "./helpers";

class HttpMeta {
  private static instance: HttpMeta;
  public controllers: Map<string, IControllerDefinition> = new Map<string, IControllerDefinition>() ;
  constructor() {
    return HttpMeta.instance || (HttpMeta.instance = this);
  }

  public GuardDecorator<T extends IGuard>(type: Type<T>): TypeFunction<HttpController> {
    return (target: Type<HttpController>) : void => {
      const controller: IControllerDefinition = this.controllers.get(target.name)!;
      Object.assign(controller, { guard: type });
    }
  }

  public ControllerDecorator (basePath: string) : TypeFunction<HttpController> {
    return (target: Type<HttpController>) : void => {
      const controller: IControllerDefinition = this.controllers.get(target.name)!;
      Object.assign(controller, {
        basePath: this.normalizePath(basePath),
        definition: target, 
      });
    }
  }

  public RouteDecorator<T>(method: HttpMethods, path: string, requestOptions?: IRequestOptions<T>) : Function {
    return (target: Type<any>, fname: string, descriptor: IPropertyDescriptor) : void => 
      this.defineRoute(method, target, path, fname, descriptor, requestOptions);
  }

  public defineRoute<T>(method: HttpMethods, target: Type<HttpController>,
                      defaultPath: string, fname: string, descriptor: IPropertyDescriptor, requestOptions?: IRequestOptions<T>) : void {
    if(!this.controllers.has(target.constructor.name)) {
      this.controllers.set(target.constructor.name, {
        basePath: '',
        routes: new Map<string, IRoutes>(),
        definition: target, 
      });
    }

    const path: string = this.normalizePath(defaultPath);

    const controller: IControllerDefinition = this.controllers.get(target.constructor.name)!
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
    if(defaultPath.endsWith('/') && !defaultPath.startsWith('/')){
      return `/${defaultPath}`.slice(0, -1);
    } else if(defaultPath.endsWith('/')) {
      return defaultPath.slice(0, -1);
    } else if(!defaultPath.startsWith('/')){
      return `/${defaultPath}`;
    } else {
      return defaultPath;
    }
  }
}


export const httpMeta = new HttpMeta()

export const Controller =  <T extends HttpController>(name: string): TypeFunction<T>  =>  httpMeta.ControllerDecorator.call(httpMeta, name);

export const Get = <T>(path: string, requestOptions?: IRequestOptions<T>) => httpMeta.RouteDecorator.call(httpMeta, HttpMethods.GET, path, requestOptions);

export const Post = <T>(path: string, requestOptions?: IRequestOptions<T>) => httpMeta.RouteDecorator.call(httpMeta, HttpMethods.POST, path, requestOptions);

export const Put = <T>(path: string, requestOptions?: IRequestOptions<T>) => httpMeta.RouteDecorator.call(httpMeta, HttpMethods.PUT, path, requestOptions);

export const Patch = <T>(path: string, requestOptions?: IRequestOptions<T>) => httpMeta.RouteDecorator.call(httpMeta, HttpMethods.PATCH, path, requestOptions); 

export const Delete = <T>(path: string, requestOptions?: IRequestOptions<T>) => httpMeta.RouteDecorator.call(httpMeta, HttpMethods.DELETE, path, requestOptions);

export const Guard = <T extends IGuard>(type: Type<T>) => httpMeta.GuardDecorator.call(httpMeta, type)


// export const Before: Function = httpMeta.RouteDecorator.bind(httpMeta, 'before');

// export const After: Function = httpMeta.RouteDecorator.bind(httpMeta, 'after');


