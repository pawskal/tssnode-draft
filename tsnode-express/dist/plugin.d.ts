import { Express, IRouterHandler, IRouterMatcher } from 'express';
import { ExtendedError } from 'ts-http-errors';
import IOCContainer from '@pskl/di-core';
import { IControllerDefinition, IGuard, IGuardDefinition } from './types';
declare class TSHttpExpress extends IOCContainer {
    readonly controllers: Map<string, IControllerDefinition>;
    readonly guards: Map<string, IGuardDefinition<IGuard, unknown>>;
    express: Express;
    use: IRouterHandler<TSHttpExpress> & IRouterMatcher<TSHttpExpress>;
    protected router: Express;
    constructor(cb?: Function);
    handleNotFound(): this;
    handleError(err: ExtendedError, ...args: any[]): this;
    setup(): this;
    protected health(): void;
    protected getControllerGuard({ definition }: IControllerDefinition): IGuardDefinition<IGuard<unknown, unknown>, unknown> | undefined;
    protected buildController(controllerDefinition: IControllerDefinition): void;
}
export default TSHttpExpress;
