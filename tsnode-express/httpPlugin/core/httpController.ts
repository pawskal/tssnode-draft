import { IOnInit, IOnDestroy, IControllerDefinition, IMethod, IRequest, IResponse, IRequestParams, IGuard } from "../interfaces";

import { RequestHandler, NextFunction } from "express-serve-static-core";

import { RequestArguments } from "./requestArguments";
import { Resolver } from "../../../tsnode-core/lib/interfaces";
import { ControllerResolver } from "./injectionHelper";
import { RequestContext } from '../serviceProviders/requestContext';
import { RouteMeta } from "../serviceProviders/routeMeta";


export abstract class HttpController implements IOnInit, IOnDestroy {
  // static
  public static getHandler(controllerResolver: ControllerResolver<IGuard, unknown>, method: IMethod): RequestHandler {
    return async function handler (req: IRequest, res: IResponse, next: NextFunction) {
      try {
          // tslint:disable-next-line: no-var-keyword
          const requestContext = new RequestContext(req, res, next)
          const { controllerDefinition, guardDefinition } = controllerResolver
          // controllerResolver.inject(requestContext, new HeadersTest)
          controllerResolver.inject(requestContext, requestContext)
           if(guardDefinition) {
            const guard: IGuard = controllerResolver.resolve(guardDefinition.guard.name, requestContext)
            const options = new RouteMeta(controllerDefinition, method)
            const data = await guard.verify(req, options);
            console.log(data, '&&&&')
            // Object.assign(requestParams, data)
          }
          var instance = controllerResolver.resolve(controllerDefinition.definition.name, requestContext);
          const requestParams = new RequestArguments(req);
         
          // var instance = resolve(controller.definition);
          Object.assign(instance, { req, res, next });
          res.on("finish", () => {
            instance.finished = true;
            instance.onDestroy ? instance.onDestroy() : instance.noop();
          });
          instance.onInit ? instance.onInit() : instance.noop();
          const origin: (options: IRequestParams) => any = method.handler || instance.noop;
          res.result = await origin.call(instance, requestParams) || {};
      } catch (e) {
        next(e);
      } finally {
          process.nextTick(() => instance.finished
            ? void 0
            : res.status(instance.statusCode || 200).send(res.result));
      }
    };
  }
  protected req!: IRequest & Request;
  protected res!: IResponse & Request;
  protected next!: NextFunction;
  protected statusCode?: number;
  protected finished: boolean = false;
  public onInit?(): void;
  public onDestroy?(): void;
}
