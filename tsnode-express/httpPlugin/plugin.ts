import bodyParser from 'body-parser';
import express, { Express, IRouterHandler, IRouterMatcher } from 'express';
import Router from 'express';
import { ExtendedError, InternalServerError, NotFoundError } from 'ts-http-errors';

import TSNodeCore from '../../tsnode-core/lib/_application';

import { ConfigProvider } from '../../tsnode-core/lib';
import { httpMeta } from './core';
import { HttpMethods, IControllerDefinition, IGuard, IGuardDefinition, IRequest, IResponse, IRoutes } from './interfaces';
import { ControllerResolver } from './core/injectionHelper';
import { HttpMeta } from './core/httpMeta';


class TSNodeExpress extends TSNodeCore {

  public get controllers(): Map<string, IControllerDefinition> {
    return httpMeta.controllers;
  }

  public get guards(): Map<string, IGuardDefinition<IGuard, unknown>> {
    return httpMeta.guards;
  }
  public express: Express;

  public use: IRouterHandler<TSNodeExpress> & IRouterMatcher<TSNodeExpress>;

  protected router: Express;
  // protected injectionHelper = new ControllerResolver(this._injector)
  constructor(cb?: Function) {
    super();
    this.express = express();

    this.router = Router();

    cb ? cb(this.express) : void 0;

    this.use = function(): TSNodeExpress {
      this.express.use(...arguments);
      return this;
    };

    this.use('/health', this.health.bind(this));
    this.use(bodyParser.json());
    this.use(bodyParser.urlencoded({ extended: false }));
  }

  public handleNotFound(): this {
    this.handleError(
      new NotFoundError(`Route ${arguments[0].originalUrl} was not found`),
      ...arguments,
    );
    return this;
  }

  public handleError(err: ExtendedError, ...args: any[]): this;
  public handleError(err: ExtendedError, req: IRequest, res: IResponse, next: Function): this {
    const { configProvider }: ConfigProvider = this;
    if (err.statusCode) {
      configProvider.logLevels.includes('warning')
        && console.warn(err.name, '\t', configProvider.printStack ? err : err.message);
      res.status(err.statusCode).json(err);
    } else {
      configProvider.logLevels.includes('error') && console.error(err);
      res.status(500).json(new InternalServerError(err.message));
    }
    return this;
  }

  public setup(): this  {
      this.controllers.forEach(this.buildController.bind(this));
      this.use(this.handleNotFound.bind(this));
      this.use(this.handleError.bind(this));
       super.setup();
       return this;
  }

  protected health() {
    this.configProvider.logLevels.includes('info') && console.log('GET', '\t', '/health');
    arguments[1].status(200)
                .json({ status: 'live' });
  }

  protected getControllerGuard({ definition }: IControllerDefinition) {
    return this.guards.get(definition.name)
  }

  protected buildController(controllerDefinition: IControllerDefinition): void {
    const { configProvider }: ConfigProvider = this;
    const guardDefinition = this.getControllerGuard(controllerDefinition)!
    console.log('#################')
    const controllerResolver = new ControllerResolver<IGuard, unknown>(this._injector, controllerDefinition, guardDefinition)
    const router = Router();
    const { routes, basePath = '/' } = controllerDefinition;
    console.log(this.guards)
    new Map<string, IRoutes>([...routes.entries()]
      .sort(([path]: any[]) => path.startsWith('/:') ? 1 : -1))
      .forEach((routes: IRoutes, path: string) =>
        Object.keys(routes).forEach((methodKey: string) => {
          const method = methodKey as HttpMethods;

          const handler = HttpMeta.getHandler(
            controllerResolver,
            routes[method]!,
          );

          this.use(basePath!, router[method](
            path,
            [].filter((m) => m),
            handler,
          )
        );
        configProvider.logLevels.includes('success')
          && console.log(method.toUpperCase(), '\t', `${basePath}${path}`);
    }));
  }
}

export default TSNodeExpress;
