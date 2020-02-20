import { Injector } from "@pskl/di-core";
import { IControllerDefinition, IGuardDefinition, IGuard } from "../types";

export class ControllerResolver<T extends IGuard, K = unknown> {
  public resolve: Function;
  public inject: Function;

  constructor (
    injector: Injector,
    public controllerDefinition: IControllerDefinition,
    public guardDefinition: IGuardDefinition<T, K>,
  ){
    this.resolve = injector._resolveTarget.bind(injector)
    this.inject = injector.setWeakInstance.bind(injector)
  }
}