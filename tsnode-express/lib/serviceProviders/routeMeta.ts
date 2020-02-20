import { PathParams } from 'express-serve-static-core';

import { IControllerDefinition, IMethod, IRequestOptions } from '../types';

export class RouteMeta<T = unknown> {
  public controllerName: string;
  public method: string;
  public basePath: PathParams;
  public path: string;
  public functionName: string;
  public requestOptions: IRequestOptions<T>;
  constructor(controller: IControllerDefinition, method: IMethod<T>) {
    this.controllerName = controller.definition.name;
    this.basePath = controller.basePath;

    this.path = method.path;
    this.method = method.method;

    this.functionName = method.name;
    this.requestOptions = method.requestOptions;
  }

  get fullPath() {
    return `${this.basePath}${this.path}`;
  }
}
