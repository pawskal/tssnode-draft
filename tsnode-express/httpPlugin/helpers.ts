// import { IRequest } from ".";
import { IMethod, IResponse,IRequest, IOnInit, IOnDestroy, IControllerDefinition, IGuard, IRequestOptions, IRequestParams } from "./interfaces";
import { RequestHandler, NextFunction, PathParams, Request } from "express-serve-static-core";
import { Resolver } from "../../tsnode-core/lib/interfaces";
import { IncomingHttpHeaders } from "http";

export abstract class HttpController implements IOnInit, IOnDestroy {
  protected req!: IRequest & Request;
  protected res!: IResponse & Request;
  protected next!: NextFunction;
  protected statusCode?: number;
  protected finished: boolean = false;
  onInit?(): void;
  onDestroy?(): void;
  // static 
  static getHandler(resolve: Resolver<any>, controller: IControllerDefinition, method: IMethod): RequestHandler {
    return async (req: IRequest, res: IResponse, next: NextFunction) => {
      try {
          var instance = resolve(controller.definition);
          const requestParams = new RequestArguments(req);
          if(controller.guard) {
            const guard: IGuard = resolve(controller.guard)
            const options = new RouteMeta(controller, method)
            const data = await guard.verify(req, options);
            console.log(data, '&&&&')
            Object.assign(requestParams, data)
          }
          // var instance = resolve(controller.definition);
          Object.assign(instance, { req, res, next })
          res.on('finish', () => {
            instance.finished = true
            instance.onDestroy ? instance.onDestroy() : instance.noop()
          });
          instance.onInit ? instance.onInit() : instance.noop()
          const origin: (options: IRequestParams) => any = method.handler || instance.noop;
          res.result = await origin.call(instance, requestParams) || {};
      } catch (e) {
        next(e)
      } finally {
          process.nextTick(() => instance.finished
            ? void 0
            : res.status(instance.statusCode || 200).send(res.result))
      }
    }
  }
}

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
    this.method = method.method

    this.functionName = method.name;
    this.requestOptions = method.requestOptions;
  }

  get fullPath() {
    return `${this.basePath}${this.path}`
  }
}

export interface IRequestArguments extends IRequestParams {}

export class RequestArguments implements IRequestArguments {
  body: any;
  params: any;
  query: any;
  headers: IncomingHttpHeaders;
  constructor(req: Request) {
    this.body = req.body;
    this.params = req.params;
    this.query = req.query;
    this.headers = req.headers;
    // Object.assign(this, additionalParams)
  }
}

