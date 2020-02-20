import { Injector } from "@pskl/di-core";
import { IControllerDefinition, IGuardDefinition, IGuard } from "../types";
export declare class ControllerResolver<T extends IGuard, K = unknown> {
    controllerDefinition: IControllerDefinition;
    guardDefinition: IGuardDefinition<T, K>;
    resolve: Function;
    inject: Function;
    constructor(injector: Injector, controllerDefinition: IControllerDefinition, guardDefinition: IGuardDefinition<T, K>);
}
