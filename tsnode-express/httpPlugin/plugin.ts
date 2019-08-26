import TSNodeCore from '../../tsnode-core/lib/_application';
import express, { IRouterHandler, IRouterMatcher, Express } from 'express';
import Router from 'express';
import bodyParser from 'body-parser';
import { NotFoundError, InternalServerError, ExtendedError } from 'ts-http-errors';
// import { success, warning, error, info } from 'nodejs-lite-logger';

import { httpMeta } from './decorators'; 
import {  HttpController } from './helpers';
import { ConfigProvider } from '../../tsnode-core/lib';
import { HttpMethods, IRequest, IResponse, IRoutes, IControllerDefinition } from './interfaces';

class TSNodeExpress extends TSNodeCore {
  public express: Express;

  protected router: Express;

  protected enableAthorization: boolean = false;

  public use: IRouterHandler<TSNodeExpress> & IRouterMatcher<TSNodeExpress>;

  constructor(cb?: Function) {
    super();
    this.express = express();

    this.router = Router();

    cb ? cb(this.express) : void 0;

    this.use = function (): TSNodeExpress {
      this.express.use(...arguments)
      return this;
    };

    this.use('/health', this.health.bind(this));
    this.use(bodyParser.json());
    this.use(bodyParser.urlencoded({ extended: false }));
  }

  public get controllers(): Map<string, IControllerDefinition> {
    return httpMeta.controllers;
  }

  protected health() {
    this.configProvider.logLevels.includes('info') && console.log('GET', '\t', '/health');
    arguments[1].status(200)
                .json({ status: 'live' });
  }

  public handleNotFound() {
    this.handleError(
      new NotFoundError(`Route ${arguments[0].originalUrl} was not found`),
      ...arguments
    )
  }

  public handleError(err: ExtendedError, ...args: any[]): void;
  public handleError(err: ExtendedError, req: IRequest, res: IResponse, next: Function): void {
    const { configProvider }: ConfigProvider = this;
    if(err.statusCode) {
      configProvider.logLevels.includes('warning')
        && console.warn(err.name, '\t', configProvider.printStack ? err : err.message);
      res.status(err.statusCode).json(err);
    } else {
      configProvider.logLevels.includes('error') && console.error(err);
      res.status(500).json(new InternalServerError(err.message));
    }  
  }

  protected buildController(definition: IControllerDefinition, name: string) : void {
    const { configProvider }: ConfigProvider = this;

    const router = Router();
    const { routes, basePath = '/' } = definition;

    new Map<string, IRoutes>([...routes.entries()]
      .sort(([path]: Array<any>) => path.startsWith('/:') ? 1 : -1))
      .forEach((routes: IRoutes, path: string) =>
        Object.keys(routes).forEach((methodKey: string) => {
          const method = methodKey as HttpMethods

          const handler = HttpController.getHandler(
            this.resolve.bind(this),
            definition,
            routes[method]!,
          )

          const logMiddleware = configProvider.logLevels.includes('info')
            && function() { 
              console.log(
                method.toUpperCase(), '\t',
                `${basePath}${path}`, '\t',
                'target: ', '\t',
                routes[method]!.name || '',
              );
              arguments[2].call();
        }

        this.use(basePath!, router[method](
          path,
          [logMiddleware].filter(m => m),
          handler
        ));
        configProvider.logLevels.includes('success')
          && console.log(method.toUpperCase(), '\t', `${basePath}${path}`);
    }));
  }

  public async start(cb: Function) : Promise<void> {
    this.addExportValue<TSNodeExpress>('express');
    super.start((...args: any[]) => {
      this.controllers.forEach(this.buildController.bind(this));
  
      this.use(this.handleNotFound.bind(this));
      this.use(this.handleError.bind(this));
      cb(...args);
    });
  }
}

export default TSNodeExpress;
